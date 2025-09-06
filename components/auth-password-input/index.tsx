import React from "react";
import { Input, InputField } from "@/components/ui/input";
import { FormControl } from "@/components/ui/form-control";

type AuthPasswordInputProps = {
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    autoCapitalize?: "none" | "sentences" | "words" | "characters";
    className?: string;
};

export const AuthPasswordInput = ({
    placeholder,
    value,
    onChangeText,
    autoCapitalize = "none",
    className = "",
}: AuthPasswordInputProps) => {
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
                    secureTextEntry
                    autoCapitalize={autoCapitalize}
                    className='placeholder:text-typography-600 text-lg px-5'
                />
            </Input>
        </FormControl>
    );
};
