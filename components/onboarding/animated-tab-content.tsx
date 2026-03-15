import React, { useEffect } from "react";
import { View, useWindowDimensions, StyleSheet } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";

const DURATION = 250;

type Props = {
    activeIndex: 0 | 1;
    children: [React.ReactNode, React.ReactNode];
};

export function AnimatedTabContent({ activeIndex, children }: Props) {
    const { width } = useWindowDimensions();
    const translateX = useSharedValue(0);

    useEffect(() => {
        translateX.value = withTiming(-activeIndex * width, {
            duration: DURATION,
        });
    }, [activeIndex, width, translateX]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    return (
        <View style={[styles.container, { width }]}>
            <Animated.View
                style={[
                    styles.slider,
                    { width: width * 2 },
                    animatedStyle,
                ]}
            >
                <View style={[styles.pane, { width }]}>{children[0]}</View>
                <View style={[styles.pane, { width }]}>{children[1]}</View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        overflow: "hidden",
    },
    slider: {
        flexDirection: "row",
        flex: 1,
    },
    pane: {
        flex: 1,
    },
});
