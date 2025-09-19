import React, { useEffect } from "react";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    Easing,
    SharedValue,
} from "react-native-reanimated";
import { Text } from "react-native";

const ANIMATION_CONFIG = {
    enter: {
        maxHeight: { duration: 250, easing: Easing.out(Easing.quad) },
        opacity: { duration: 250, easing: Easing.out(Easing.quad) },
        scaleY: { duration: 250, easing: Easing.out(Easing.back(1.05)) },
        translateY: { duration: 250, easing: Easing.out(Easing.quad) },
    },
    exit: {
        translateY: { duration: 250, easing: Easing.in(Easing.quad) },
        scaleY: { duration: 250, easing: Easing.in(Easing.quad) },
        opacity: { duration: 250, easing: Easing.in(Easing.quad) },
        maxHeight: { duration: 250, easing: Easing.in(Easing.quad) },
    },
    maxHeight: 100,
    translateYOffset: -15,
} as const;

const animateIn = (
    maxHeight: SharedValue<number>,
    opacity: SharedValue<number>,
    scaleY: SharedValue<number>,
    translateY: SharedValue<number>
) => {
    opacity.value = withTiming(1, ANIMATION_CONFIG.enter.opacity);

    setTimeout(() => {
        maxHeight.value = withTiming(
            ANIMATION_CONFIG.maxHeight,
            ANIMATION_CONFIG.enter.maxHeight
        );
        scaleY.value = withTiming(1, ANIMATION_CONFIG.enter.scaleY);
        translateY.value = withTiming(0, ANIMATION_CONFIG.enter.translateY);
    }, 20);
};

const animateOut = (
    maxHeight: SharedValue<number>,
    opacity: SharedValue<number>,
    scaleY: SharedValue<number>,
    translateY: SharedValue<number>,
    onComplete: () => void
) => {
    opacity.value = withTiming(0, ANIMATION_CONFIG.exit.opacity);
    scaleY.value = withTiming(0, ANIMATION_CONFIG.exit.scaleY);
    translateY.value = withTiming(
        ANIMATION_CONFIG.translateYOffset,
        ANIMATION_CONFIG.exit.translateY
    );
    maxHeight.value = withTiming(0, ANIMATION_CONFIG.exit.maxHeight);

    const timer = setTimeout(() => {
        onComplete();
    }, ANIMATION_CONFIG.exit.maxHeight.duration);

    return () => clearTimeout(timer);
};

type FormErrorProps = {
    error?: string;
};

export const FormError = ({ error }: FormErrorProps) => {
    const maxHeight = useSharedValue(0);
    const opacity = useSharedValue(0);
    const scaleY = useSharedValue(0);
    const translateY = useSharedValue(
        ANIMATION_CONFIG.translateYOffset as number
    );
    const [isVisible, setIsVisible] = React.useState(false);
    const [displayError, setDisplayError] = React.useState<string | undefined>(
        undefined
    );

    const handleAnimationComplete = () => {
        setIsVisible(false);
        setDisplayError(undefined);
    };

    useEffect(() => {
        if (error) {
            setDisplayError(error);
            setIsVisible(true);
            animateIn(maxHeight, opacity, scaleY, translateY);
        } else if (isVisible) {
            const cleanup = animateOut(
                maxHeight,
                opacity,
                scaleY,
                translateY,
                handleAnimationComplete
            );
            return cleanup;
        }
    }, [error, isVisible]);

    const animatedStyle = useAnimatedStyle(
        () => ({
            maxHeight: maxHeight.value,
            opacity: opacity.value,
            transform: [
                { scaleY: scaleY.value },
                { translateY: translateY.value },
            ],
            transformOrigin: "top",
            overflow: "hidden",
        }),
        []
    );

    if (!isVisible) {
        return <Animated.View style={animatedStyle} />;
    }

    return (
        <Animated.View className='px-1' style={animatedStyle}>
            <Text className='text-error-500 text-md px-1 text-center'>
                {displayError}
            </Text>
        </Animated.View>
    );
};
