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
import { setNameSchema, SetNameSchema } from "./set-name-schema";

export const SetNameForm = () => {
    const router = useRouter();
    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting, isDirty, isValid, submitCount },
        resetField,
        clearErrors,
        setError,
        getValues,
    } = useForm<SetNameSchema>({
        resolver: zodResolver(setNameSchema),
        mode: "onSubmit",
        reValidateMode: "onSubmit",
        defaultValues: {
            name: "",
        },
    });
    const { updateUserName } = useUser();

    const handleSetNameSubmit = async () => {
        try {
            await updateUserName(getValues("name").trim());
            router.dismissAll();
            router.replace("/");
        } catch (error) {
            setError("root", { message: (error as Error).message });
        }
    };

    useEffect(() => {
        if (!isValid && !isDirty && submitCount > 0) {
            clearErrors();
        }
    }, [isDirty]);

    const validationErrors = errors.name?.message || errors.root?.message;

    return (
        <VStack space='lg'>
            <VStack space='md'>
                <Controller
                    control={control}
                    name='name'
                    render={({ field: { onChange, value } }) => (
                        <AuthTextInput
                            placeholder='Your name'
                            value={value}
                            onChangeText={onChange}
                            autoCapitalize='words'
                            autoCorrect={false}
                            handleClearInput={() => {
                                resetField("name");
                            }}
                        />
                    )}
                />

                <Button
                    onPress={handleSubmit(handleSetNameSubmit)}
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

            {validationErrors && <FormError>{validationErrors}</FormError>}
        </VStack>
    );
};
