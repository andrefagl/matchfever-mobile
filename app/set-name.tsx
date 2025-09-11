import { AuthTextInput } from "@/components/auth-text-input";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Spinner } from "@/components/ui/spinner";
import { Text as TextUI } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { router, useFocusEffect } from "expo-router";
import React, { useState, useCallback } from "react";
import { Alert, ScrollView, BackHandler } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "@/contexts/user-context";

const SetName = () => {
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { updateUserName } = useUser();

    const isSubmissionEligible = name.trim().length > 0;

    // Prevent back navigation
    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                // Return true to prevent default back behavior
                return true;
            };

            const subscription = BackHandler.addEventListener(
                "hardwareBackPress",
                onBackPress
            );

            return () => subscription?.remove();
        }, [])
    );

    const handleContinue = async () => {
        if (!name.trim()) {
            Alert.alert("Error", "Please enter your name");
            return;
        }

        // Basic name validation (at least 2 characters)
        if (name.trim().length < 2) {
            Alert.alert(
                "Error",
                "Please enter a valid name (at least 2 characters)"
            );
            return;
        }

        setIsLoading(true);

        try {
            // Update user name
            await updateUserName(name.trim());

            // Navigate to home page and clear navigation stack
            router.dismissAll();
            router.replace("/");
        } catch (error) {
            if (error instanceof Error) {
                console.log("Name update error: ", error.message);
            } else {
                console.log("Name update error: ", error);
            }
            Alert.alert("Error", "Failed to update name. Please try again.");
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
                                What's your name?
                            </Heading>
                            <TextUI className='text-typography-900 text-center text-base leading-relaxed'>
                                Let's personalize your Matchfever experience
                                with your name.
                            </TextUI>
                        </VStack>

                        <VStack space='lg' className='flex-1'>
                            <VStack space='md'>
                                <AuthTextInput
                                    placeholder='Your name'
                                    value={name}
                                    onChangeText={setName}
                                    autoCapitalize='words'
                                    autoCorrect={false}
                                    handleClearInput={() => {
                                        setName("");
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

export default SetName;
