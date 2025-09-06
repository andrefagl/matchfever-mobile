import { GoogleIcon } from "@/components/custom-icons";
import { AppleIcon } from "@/components/custom-icons/apple";
import { FacebookIcon } from "@/components/custom-icons/facebook";
import { BrandLogo } from "@/components/brand-logo";
import { AuthTextInput } from "@/components/auth-text-input";
import { AuthPasswordInput } from "@/components/auth-password-input";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Pressable } from "@/components/ui/pressable";
import { Text as TextUI } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView } from "react-native";
import { useUser } from "../contexts/user-context";

const Signin = () => {
    const { signIn } = useUser();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isSubmissionEligible =
        email.trim().length > 0 && password.trim().length > 0;

    const handleLogin = async () => {
        setError(null);
        if (!email.trim() || !password.trim()) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        if (password.length < 6) {
            Alert.alert("Error", "Password must be at least 6 characters");
            return;
        }

        setIsLoading(true);

        try {
            await signIn(email, password);
            router.push("/");
        } catch (error) {
            if (error instanceof Error) {
                console.log("sopas error: ", error.message);
            } else {
                console.log("sopas error: ", error);
            }
            Alert.alert("Error", "Login failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // TODO: Deal with the keyboard avoiding view and TouchableWithoutFeedback
    return (
        <ScrollView
            contentContainerStyle={{
                flexGrow: 1,
                justifyContent: "center",
            }}
            className='flex-1 bg-background-0'
            // contentInsetAdjustmentBehavior='automatic'
            automaticallyAdjustKeyboardInsets={true}
        >
            <VStack className='px-6'>
                <VStack space='xl'>
                    {/* <KeyboardAvoidingView
                            behavior={
                                Platform.OS === "ios" ? "padding" : "height"
                            }
                        > */}
                    <VStack className='items-center' space='xs'>
                        <BrandLogo size='lg' variant='light' className='mb-4' />
                        <Heading
                            size='3xl'
                            className='font-brand leading-snug text-black'
                        >
                            Sign in
                        </Heading>
                    </VStack>

                    <VStack space='md' className='flex-1'>
                        <AuthTextInput
                            placeholder='Email'
                            value={email}
                            onChangeText={setEmail}
                            keyboardType='email-address'
                            autoCapitalize='none'
                            autoCorrect={false}
                        />

                        <AuthPasswordInput
                            placeholder='Password'
                            value={password}
                            onChangeText={setPassword}
                            autoCapitalize='none'
                        />

                        <Button
                            onPress={handleLogin}
                            disabled={isLoading || !isSubmissionEligible}
                            size='xl'
                            className={`rounded-lg ${
                                isLoading || !isSubmissionEligible
                                    ? "opacity-60"
                                    : ""
                            }`}
                        >
                            <ButtonText className='text-white font-semibold'>
                                {isLoading ? "Signing In..." : "Sign in"}
                            </ButtonText>
                        </Button>
                        <TextUI className='text-typography-600 text-center text-lg leading-none'>
                            or
                        </TextUI>
                        <Button
                            variant='outline'
                            size='xl'
                            className='bg-white border border-outline-200 rounded-lg'
                        >
                            <HStack className='items-center' space='sm'>
                                <Icon as={GoogleIcon} size='md' />
                                <ButtonText className='text-black text-lg'>
                                    Continue with Google
                                </ButtonText>
                            </HStack>
                        </Button>

                        <Button
                            variant='outline'
                            size='xl'
                            className='bg-white border border-outline-200 rounded-lg'
                        >
                            <HStack className='items-center' space='sm'>
                                <Icon as={AppleIcon} size='xl' />
                                <ButtonText className='text-black text-lg'>
                                    Continue with Apple
                                </ButtonText>
                            </HStack>
                        </Button>

                        <Button
                            variant='outline'
                            size='xl'
                            className='border border-outline-200 rounded-lg'
                        >
                            <HStack className='items-center' space='sm'>
                                <Icon as={FacebookIcon} size='xl' />
                                <ButtonText className='text-foreground text-lg'>
                                    Continue with Facebook
                                </ButtonText>
                            </HStack>
                        </Button>
                    </VStack>
                    {/* </KeyboardAvoidingView> */}
                </VStack>
            </VStack>

            <VStack>
                <Pressable className='items-center mt-6'>
                    <TextUI className='text-blue-500 text-sm font-medium'>
                        Need help signing in?
                    </TextUI>
                </Pressable>

                <HStack className='justify-center items-center mt-8'>
                    <TextUI className='text-gray-600 text-sm'>
                        Don't have an account?{" "}
                    </TextUI>
                    <Pressable onPress={() => router.push("/signup")}>
                        <TextUI className='text-blue-500 text-sm font-semibold'>
                            Sign Up
                        </TextUI>
                    </Pressable>
                </HStack>
            </VStack>
        </ScrollView>
    );
};

export default Signin;
