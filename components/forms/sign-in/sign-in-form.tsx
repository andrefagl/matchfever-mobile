import { AuthTextInput } from "@/components/auth-text-input";
import { FormError } from "@/components/form-error";
import { Button, ButtonText } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { VStack } from "@/components/ui/vstack";
import { useUser } from "@/contexts/user-context";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { signInSchema, SignInSchema } from "./sign-in-schema";

export const SignInForm = () => {
    const router = useRouter();
    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting, isDirty, isValid, submitCount },
        resetField,
        clearErrors,
        getValues,
        setError,
    } = useForm<SignInSchema>({
        resolver: zodResolver(signInSchema),
        mode: "onSubmit",
        defaultValues: {
            email: "",
        },
    });
    const { signinOrSignup } = useUser();

    const handleSignInSubmit = async () => {
        try {
            await signinOrSignup("sopas");
            router.push("/otp");
        } catch (error) {
            if (error instanceof Error) {
                console.log("sopas error: ", error.message);
            } else {
                console.log("sopas error: ", error);
            }
            // Alert.alert("Error", "Login failed. Please try again.");
            setError("root", { message: "Login failed. Please try again." });
        }
    };

    useEffect(() => {
        if (!isValid && !isDirty && submitCount > 0) {
            clearErrors();
        }
    }, [isDirty]);

    console.log("sopas rendering");

    return (
        <VStack space='md'>
            <Controller
                control={control}
                name='email'
                render={({ field: { onChange, value } }) => (
                    <AuthTextInput
                        placeholder='Email'
                        value={value}
                        onChangeText={onChange}
                        keyboardType='email-address'
                        autoCapitalize='none'
                        autoCorrect={false}
                        handleClearInput={() => {
                            resetField("email");
                        }}
                    />
                )}
            />

            <Button
                onPress={handleSubmit(handleSignInSubmit)}
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
            {errors.email ? (
                <FormError>{errors.email.message}</FormError>
            ) : errors.root ? (
                <FormError>{errors.root.message}</FormError>
            ) : null}
        </VStack>
    );
};
