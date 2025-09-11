import { AuthTextInput } from "@/components/auth-text-input";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Spinner } from "@/components/ui/spinner";
import { Text as TextUI } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const RequestOTP = () => {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const isSubmissionEligible = email.trim().length > 0;

    const handleContinue = async () => {
        if (!email.trim()) {
            Alert.alert("Error", "Please enter your email address");
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert("Error", "Please enter a valid email address");
            return;
        }

        setIsLoading(true);

        try {
            // TODO: Implement OTP request logic
            console.log("Requesting OTP for email:", email);

            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // Navigate to OTP verification page
            router.push("/otp");
        } catch (error) {
            if (error instanceof Error) {
                console.log("OTP request error: ", error.message);
            } else {
                console.log("OTP request error: ", error);
            }
            Alert.alert("Error", "Failed to send OTP. Please try again.");
        } finally {
            setIsLoading(false);
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
                                Trouble logging in?
                            </Heading>
                            <TextUI className='text-typography-900 text-center text-base leading-relaxed'>
                                We'll send you a code to get you back in your
                                account.
                            </TextUI>
                        </VStack>

                        <VStack space='lg' className='flex-1'>
                            <VStack space='md'>
                                <AuthTextInput
                                    placeholder='Email'
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType='email-address'
                                    autoCapitalize='none'
                                    autoCorrect={false}
                                    handleClearInput={() => {
                                        setEmail("");
                                    }}
                                />
                            </VStack>

                            <Button
                                onPress={handleContinue}
                                disabled={isLoading || !isSubmissionEligible}
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
                    </VStack>
                </VStack>
            </ScrollView>
        </SafeAreaView>
    );
};

export default RequestOTP;
