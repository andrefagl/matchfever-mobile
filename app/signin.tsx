import { GoogleIcon } from "@/components/custom-icons";
import { AppleIcon } from "@/components/custom-icons/apple";
import { FacebookIcon } from "@/components/custom-icons/facebook";
import { BrandLogo } from "@/components/brand-logo";
import { AuthTextInput } from "@/components/auth-text-input";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Text as TextUI } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView } from "react-native";
import { useUser } from "../contexts/user-context";
import { Spinner } from "@/components/ui/spinner";
import { LinkButton } from "@/components/link-button";
import { Box } from "@/components/ui/box";
import { SignInForm } from "@/components/forms/sign-in";

const Signin = () => {
    // TODO: Deal with the keyboard avoiding view and TouchableWithoutFeedback
    return (
        <ScrollView
            contentContainerStyle={{
                flexGrow: 1,
                justifyContent: "center",
            }}
            className='flex-1 bg-background-0'
            keyboardShouldPersistTaps='always'
            keyboardDismissMode='on-drag'
        >
            <VStack space='xl' className='px-6'>
                <VStack space='xl'>
                    {/* <KeyboardAvoidingView
                            behavior={
                                Platform.OS === "ios" ? "padding" : "height"
                            }
                        > */}
                    <VStack className='items-center' space='xs'>
                        <BrandLogo size='lg' variant='dark' className='mb-4' />
                        <Heading
                            size='2xl'
                            className='font-latoBold leading-snug text-slate-950'
                        >
                            Log in or sign up
                        </Heading>
                    </VStack>

                    <VStack space='md' className='flex-1'>
                        <SignInForm />
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
                <Box className='items-center'>
                    <LinkButton onPress={() => router.push("/request-otp")}>
                        Need help signing in?
                    </LinkButton>
                </Box>
                <Box className='items-center px-10'>
                    <TextUI className='text-typography-900 text-center font-light text-[13px]'>
                        By signing up, you are creating a Matchfever account and
                        agree to Matchfever's{" "}
                        <TextUI
                            className='text-brand-link underline'
                            onPress={() => router.push("/terms")}
                        >
                            Terms
                        </TextUI>{" "}
                        and{" "}
                        <TextUI
                            className='text-brand-link underline'
                            onPress={() => router.push("/privacy")}
                        >
                            Privacy Policy
                        </TextUI>
                        .
                    </TextUI>
                </Box>
            </VStack>
        </ScrollView>
    );
};

export default Signin;
