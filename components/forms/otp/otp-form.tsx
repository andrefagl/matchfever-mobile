import { AuthTextInput } from "@/components/auth-text-input";
import { FormError } from "@/components/form-error";
import { Button, ButtonText } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { VStack } from "@/components/ui/vstack";
import { Box } from "@/components/ui/box";
import { LinkButton } from "@/components/link-button";
import { useUser } from "@/contexts/user-context";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { otpSchema, OtpSchema } from "./otp-schema";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";

export const OtpForm = () => {
    const router = useRouter();
    const [isResending, setIsResending] = useState<boolean>(false);
    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting, isDirty, isValid, submitCount },
        resetField,
        clearErrors,
        setError,
        getValues,
    } = useForm<OtpSchema>({
        resolver: zodResolver(otpSchema),
        mode: "onSubmit",
        reValidateMode: "onSubmit",
        defaultValues: {
            code: "",
        },
    });
    const { createOTPSession, resendOTP } = useUser();

    const handleOtpSubmit = async () => {
        try {
            const result = await createOTPSession(getValues("code"));
            if (result?.needsNameSetup) {
                router.push("/set-name");
            } else {
                router.push("/");
            }
        } catch (error) {
            setError("root", { message: (error as Error).message });
        }
    };

    const handleResendOTP = async () => {
        setIsResending(true);
        try {
            const result = await resendOTP();

            if (result?.success) {
                clearErrors();
            }
        } catch (error) {
            setError("root", { message: (error as Error).message });
        } finally {
            setIsResending(false);
        }
    };

    useEffect(() => {
        if (!isValid && !isDirty && submitCount > 0) {
            clearErrors();
        }
    }, [isDirty]);

    return (
        <VStack space='lg'>
            <VStack space='md'>
                <Controller
                    control={control}
                    name='code'
                    render={({ field: { onChange, value } }) => (
                        <AuthTextInput
                            placeholder='Email code'
                            value={value}
                            onChangeText={onChange}
                            keyboardType='numeric'
                            autoCapitalize='none'
                            autoCorrect={false}
                            handleClearInput={() => {
                                resetField("code");
                            }}
                        />
                    )}
                />

                <Button
                    onPress={handleSubmit(handleOtpSubmit)}
                    disabled={isSubmitting || !isDirty}
                    size='xl'
                    className={`rounded-lg ${
                        isSubmitting || !isDirty ? "opacity-60" : ""
                    }`}
                >
                    {isSubmitting ? (
                        <Spinner color='white' />
                    ) : (
                        <ButtonText className='text-white font-semibold'>
                            Continue
                        </ButtonText>
                    )}
                </Button>
            </VStack>

            {errors.code ? (
                <FormError>{errors.code?.message}</FormError>
            ) : errors.root ? (
                <FormError>{errors.root?.message}</FormError>
            ) : null}

            <Box className='items-center'>
                {isResending ? (
                    <HStack space='xs'>
                        <Spinner color='#0e69b7' />
                        <Text className='text-brand-link text-base font-semibold'>
                            Sending...
                        </Text>
                    </HStack>
                ) : (
                    <LinkButton onPress={handleResendOTP}>
                        Didn't get the code? Try again
                    </LinkButton>
                )}
            </Box>
        </VStack>
    );
};
