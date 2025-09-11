import { BrandLogo } from "@/components/brand-logo";
import { AuthTextInput } from "@/components/auth-text-input";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Text as TextUI } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { LinkButton } from "@/components/link-button";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Box } from "@/components/ui/box";
import { Spinner } from "@/components/ui/spinner";
import { useUser } from "@/contexts/user-context";
import { account } from "@/lib/appwrite";

const OTP = () => {
    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user, pendingUser, createOTPSession } = useUser();
    console.log("sopas user: ", user);
    console.log("sopas pendingUser: ", pendingUser);
    const router = useRouter();

    const isSubmissionEligible = otp.trim().length;
    useEffect(() => {
        console.log("sopas useEffect");
        router.setParams({
            animation: "slide_from_bottom",
        });
    }, []);

    const handleTestAnimation = () => {
        router.dismissAll();
        router.replace("/");
    };

    const handleVerifyOTP = async () => {
        setError(null);
        if (!otp.trim()) {
            Alert.alert("Error", "Please enter the code");
            return;
        }

        if (otp.length < 6) {
            Alert.alert("Error", "Please enter a valid 6-digit OTP code");
            return;
        }

        setIsLoading(true);

        try {
            // TODO: Implement OTP verification logic
            console.log("Verifying OTP:", otp);

            if (!pendingUser) {
                Alert.alert(
                    "Error",
                    "No pending user session found. Please try signing in again."
                );
                // router.push("/signin");
                return;
            }

            // Create session with the pending user ID
            const result = await createOTPSession(otp);

            // Redirect based on whether user needs to set their name
            if (result.needsNameSetup) {
                // Push to set-name view (user can still go back to OTP if needed)
                router.push("/set-name");
            } else {
                router.setParams({
                    animation: "slide_from_bottom",
                });
                router.dismissAll();
                router.replace("/");
            }
        } catch (error) {
            if (error instanceof Error) {
                console.log("OTP verification error: ", error.message);
            } else {
                console.log("OTP verification error: ", error);
            }
            Alert.alert("Error", "Invalid OTP code. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOTP = async () => {
        try {
            // TODO: Implement resend OTP logic
            console.log("Resending OTP...");
            Alert.alert("Success", "OTP code has been resent to your email");
        } catch (error) {
            Alert.alert("Error", "Failed to resend OTP. Please try again.");
        }
    };

    return (
        <SafeAreaView className='flex-1 bg-background-0'>
            <ScrollView
                className='bg-background-0'
                contentInsetAdjustmentBehavior='automatic'
                keyboardShouldPersistTaps='always'
                keyboardDismissMode='on-drag'
            >
                <VStack className='px-6'>
                    <VStack space='xl'>
                        <VStack className='items-center' space='xs'>
                            <Heading
                                size='2xl'
                                className='font-latoBold leading-snug text-slate-950'
                            >
                                Check your email
                            </Heading>
                            <TextUI className='text-typography-900 text-center text-base leading-relaxed'>
                                To continue, enter the code we just sent to
                            </TextUI>
                            <TextUI className='text-typography-900 text-center font-bold leading-relaxed'>
                                {pendingUser?.email || "your email"}.
                            </TextUI>
                        </VStack>

                        <VStack space='xl' className='flex-1'>
                            <VStack space='md'>
                                <AuthTextInput
                                    placeholder='Email code'
                                    value={otp}
                                    onChangeText={setOtp}
                                    keyboardType='numeric'
                                    autoCapitalize='none'
                                    autoCorrect={false}
                                    className='text-center text-2xl tracking-widest'
                                    handleClearInput={() => {
                                        setOtp("");
                                        setError(null);
                                    }}
                                />
                                <Button
                                    onPress={handleVerifyOTP}
                                    disabled={
                                        isLoading || !isSubmissionEligible
                                    }
                                    size='xl'
                                    className={`rounded-lg ${
                                        isLoading || !isSubmissionEligible
                                            ? "opacity-60"
                                            : ""
                                    }`}
                                >
                                    {isLoading ? (
                                        <Spinner color='white' />
                                    ) : (
                                        <ButtonText className='text-white font-semibold'>
                                            Continue
                                        </ButtonText>
                                    )}
                                </Button>
                            </VStack>
                            <Box className='items-center'>
                                <LinkButton onPress={handleResendOTP}>
                                    Didn't get the code? Try again
                                </LinkButton>
                            </Box>
                        </VStack>
                    </VStack>
                </VStack>
            </ScrollView>
        </SafeAreaView>
    );
};

export default OTP;
