import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    View,
    Pressable,
    StyleSheet,
    LayoutChangeEvent,
    LayoutRectangle,
} from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import { Text as GluestackText } from "@/components/ui/text";

const DURATION = 250;

type TabConfig = {
    label: string;
};

type Props = {
    tabs: [TabConfig, TabConfig];
    activeIndex: 0 | 1;
    onTabPress: (index: 0 | 1) => void;
};

export function AnimatedTabBar({ tabs, activeIndex, onTabPress }: Props) {
    const [tabLayouts, setTabLayouts] = useState<
        [LayoutRectangle | null, LayoutRectangle | null]
    >([null, null]);
    const [textLayouts, setTextLayouts] = useState<
        [LayoutRectangle | null, LayoutRectangle | null]
    >([null, null]);
    const hasAnimatedRef = useRef(false);

    const underlineX = useSharedValue(0);
    const underlineWidth = useSharedValue(0);

    const handleTabLayout = useCallback(
        (index: 0 | 1) => (e: LayoutChangeEvent) => {
            const layout = e.nativeEvent?.layout;
            if (!layout) return;
            setTabLayouts((prev) => {
                const next = [...prev] as [LayoutRectangle | null, LayoutRectangle | null];
                next[index] = layout;
                return next;
            });
        },
        []
    );

    const handleTextLayout = useCallback(
        (index: 0 | 1) => (e: LayoutChangeEvent) => {
            const layout = e.nativeEvent?.layout;
            if (!layout) return;
            setTextLayouts((prev) => {
                const next = [...prev] as [LayoutRectangle | null, LayoutRectangle | null];
                next[index] = layout;
                return next;
            });
        },
        []
    );

    useEffect(() => {
        const tab = tabLayouts[activeIndex];
        const text = textLayouts[activeIndex];
        if (tab && text) {
            const x = tab.x + text.x;
            const width = text.width;
            const isInitial = !hasAnimatedRef.current;
            hasAnimatedRef.current = true;
            const duration = isInitial ? 0 : DURATION;
            underlineX.value = withTiming(x, { duration });
            underlineWidth.value = withTiming(width, { duration });
        }
    }, [activeIndex, tabLayouts, textLayouts, underlineX, underlineWidth]);

    const underlineStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: underlineX.value }],
        width: underlineWidth.value,
    }));

    return (
        <View style={styles.tabBar}>
            <View style={styles.tabRow}>
                <Pressable
                    onLayout={handleTabLayout(0)}
                    onPress={() => onTabPress(0)}
                    style={styles.tab}
                >
                    <View
                        onLayout={handleTextLayout(0)}
                        style={styles.textWrapper}
                    >
                        <GluestackText
                            className={
                                activeIndex === 0
                                    ? "font-lato text-sm font-semibold text-typography-900"
                                    : "font-lato text-sm font-medium text-typography-500"
                            }
                        >
                            {tabs[0].label}
                        </GluestackText>
                    </View>
                </Pressable>
                <Pressable
                    onLayout={handleTabLayout(1)}
                    onPress={() => onTabPress(1)}
                    style={styles.tab}
                >
                    <View
                        onLayout={handleTextLayout(1)}
                        style={styles.textWrapper}
                    >
                        <GluestackText
                            className={
                                activeIndex === 1
                                    ? "font-lato text-sm font-semibold text-typography-900"
                                    : "font-lato text-sm font-medium text-typography-500"
                            }
                        >
                            {tabs[1].label}
                        </GluestackText>
                    </View>
                </Pressable>
                <Animated.View style={[styles.underline, underlineStyle]} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    tabRow: {
        flexDirection: "row",
        gap: 8,
        alignItems: "center",
        position: "relative",
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        alignItems: "center",
    },
    textWrapper: {
        alignSelf: "center",
    },
    underline: {
        position: "absolute",
        bottom: 0,
        left: 0,
        height: 2,
        backgroundColor: "#1A1A1A",
    },
});
