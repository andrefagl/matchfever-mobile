import { OtpForm } from "@/components/forms/otp";
import { Heading } from "@/components/ui/heading";
import { VStack } from "@/components/ui/vstack";
import { useUser } from "@/contexts/user-context";
import React from "react";
import { ScrollView } from "react-native";
import { Text } from "@/components/ui/text";

const OTP = () => {
    const { pendingUser } = useUser();

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
                            Check your email
                        </Heading>
                        <Text className='text-typography-900 text-center text-base leading-relaxed'>
                            To continue, enter the code we just sent to
                        </Text>
                        <Text className='text-typography-900 text-center font-bold leading-relaxed'>
                            {pendingUser?.email || "your email"}.
                        </Text>
                    </VStack>
                    <OtpForm />
                </VStack>
            </VStack>
        </ScrollView>
    );
};

export default OTP;
