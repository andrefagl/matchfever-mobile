import {
    FadeInUpTransition,
    FadeOutUpTransition,
    LinearTransition,
} from "@/animations";
import React from "react";
import { Text } from "react-native";
import Animated from "react-native-reanimated";

export const FormError = ({ children }: { children: React.ReactNode }) => {
    return (
        <Animated.View
            entering={FadeInUpTransition}
            exiting={FadeOutUpTransition}
            layout={LinearTransition}
        >
            <Text className='text-error-500 text-md px-1 text-center'>
                {children}
            </Text>
        </Animated.View>
    );
};
