import React from "react";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { FormControl } from "@/components/ui/form-control";
import { CircleXIcon } from "lucide-react-native";

type AuthTextInputProps = {
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    handleClearInput?: () => void;
    keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
    autoCapitalize?: "none" | "sentences" | "words" | "characters";
    autoCorrect?: boolean;
    className?: string;
};

const ClearInputIcon = () => {
    return <CircleXIcon size={18} fill={"#bcbcbc"} stroke={"#f2f1f1"} />;
};

export const AuthTextInput = ({
    placeholder,
    value,
    onChangeText,
    handleClearInput,
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
                {handleClearInput && value.length > 0 && (
                    <InputSlot className='pr-3' onPress={handleClearInput}>
                        <InputIcon as={ClearInputIcon} />
                    </InputSlot>
                )}
            </Input>
        </FormControl>
    );
};
