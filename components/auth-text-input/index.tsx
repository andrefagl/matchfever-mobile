import React from "react";
import { Input, InputField } from "@/components/ui/input";
import { FormControl } from "@/components/ui/form-control";

type AuthTextInputProps = {
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
    autoCapitalize?: "none" | "sentences" | "words" | "characters";
    autoCorrect?: boolean;
    className?: string;
};

export const AuthTextInput = ({
    placeholder,
    value,
    onChangeText,
    keyboardType = "default",
    autoCapitalize = "none",
    autoCorrect = false,
    className = "",
}: AuthTextInputProps) => {
    return (
        <FormControl>
            <Input
                size='xl'
                variant='outline'
                className={`bg-background-100 border-0 rounded-lg ${className}`}
            >
                <InputField
                    placeholder={placeholder}
                    value={value}
                    onChangeText={onChangeText}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    autoCorrect={autoCorrect}
                    className='placeholder:text-typography-600 text-lg px-5'
                />
            </Input>
        </FormControl>
    );
};
