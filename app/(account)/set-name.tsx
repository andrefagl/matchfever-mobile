import { SetNameForm } from "@/components/forms/set-name";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useFocusEffect } from "expo-router";
import React, { useCallback } from "react";
import { ScrollView, BackHandler } from "react-native";

const SetName = () => {
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

    return (
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
                        <Text className='text-typography-900 text-center text-base leading-relaxed'>
                            Let's personalize your Matchfever experience with
                            your name.
                        </Text>
                    </VStack>

                    <SetNameForm />
                </VStack>
            </VStack>
        </ScrollView>
    );
};

export default SetName;
