import React from "react";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
interface LinkButtonProps {
    onPress: () => void;
    children: React.ReactNode;
    className?: string;
}

export const LinkButton: React.FC<LinkButtonProps> = ({
    onPress,
    children,
    className = "mt-2",
}) => {
    return (
        <Pressable onPress={onPress} className={className}>
            <Text className='text-brand-link text-base font-semibold'>
                {children}
            </Text>
        </Pressable>
    );
};
