import React from "react";
import { View, Text, Pressable } from "react-native";
import { Link, useLocalSearchParams } from "expo-router";
import { Text as GluestackText } from "@/components/ui/text";
import { Pressable as UIPressable } from "@/components/ui/pressable";
import type {
    LiveTournament,
    TodayTournament,
    UpcomingTournament,
    NearMeTournament,
    FollowingTournament,
    TabId,
} from "@/lib/mock-tournaments";

export const CARD_GAP = 12;
export const H_PADDING = 24;
export const SECTION_GAP = 24;

export function TournamentsScreenShell({
    children,
}: {
    children: React.ReactNode;
}) {
    return <View className="flex-1 bg-background-0">{children}</View>;
}

export function SectionHeader({
    title,
    right,
    onRightPress,
}: {
    title: string;
    right?: string;
    onRightPress?: () => void;
}) {
    return (
        <View className="flex-row items-center justify-between mb-3">
            <GluestackText className="text-[17px] font-bold text-typography-900">
                {title}
            </GluestackText>
            {right && (
                onRightPress ? (
                    <Pressable onPress={onRightPress}>
                        <Text className="text-[14px] font-semibold text-primary-500">
                            {right}
                        </Text>
                    </Pressable>
                ) : (
                    <GluestackText className="text-[14px] font-semibold text-primary-500">
                        {right}
                    </GluestackText>
                )
            )}
        </View>
    );
}

type CardPressableProps = {
    children: React.ReactNode;
    onPress?: () => void;
    className?: string;
};

function CardPressable({
    children,
    onPress,
    className,
}: CardPressableProps) {
    return (
        <UIPressable
            onPress={onPress}
            className={`rounded-2xl bg-secondary-100 overflow-hidden ${className ?? ""}`}
        >
            {children}
        </UIPressable>
    );
}

export function LiveCard({
    item,
    onPress,
}: {
    item: LiveTournament;
    onPress?: () => void;
}) {
    const g = item.featuredGame;
    return (
        <CardPressable
            onPress={onPress}
            className="w-[280px] p-4"
        >
            <GluestackText
                className="text-[15px] font-bold text-typography-900 mb-1"
                numberOfLines={2}
            >
                {item.name}
            </GluestackText>
            <GluestackText
                className="text-[12px] text-typography-500 mb-3"
                numberOfLines={1}
            >
                {item.organizerName}
            </GluestackText>
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                    <Text className="text-[13px] font-semibold text-typography-900">
                        {g.homeTeamAbbr}
                    </Text>
                    <View className="flex-row items-baseline gap-1">
                        <Text className="text-[18px] font-bold text-typography-900">
                            {g.scoreHome}
                        </Text>
                        <Text className="text-[11px] font-bold text-error-500">
                            {g.minuteDisplay ?? `${g.minute}'`}
                        </Text>
                        <Text className="text-[18px] font-bold text-typography-900">
                            {g.scoreAway}
                        </Text>
                    </View>
                    <Text className="text-[13px] font-semibold text-typography-900">
                        {g.awayTeamAbbr}
                    </Text>
                </View>
            </View>
            <Text className="text-[11px] text-typography-500 mt-2">
                {g.gamesLiveInTournament} games live
            </Text>
        </CardPressable>
    );
}

export function TodayCard({
    item,
    onPress,
}: {
    item: TodayTournament;
    onPress?: () => void;
}) {
    return (
        <CardPressable onPress={onPress} className="p-4 mb-3">
            <View className="flex-row items-center justify-between">
                <View className="flex-1">
                    <GluestackText
                        className="text-[15px] font-bold text-typography-900 mb-1"
                        numberOfLines={2}
                    >
                        {item.name}
                    </GluestackText>
                    <GluestackText
                        className="text-[12px] text-typography-500"
                        numberOfLines={1}
                    >
                        {item.organizerName}
                    </GluestackText>
                </View>
                <View className="flex-row items-center gap-2">
                    <View
                        className={`px-2.5 py-1 rounded-lg ${
                            item.badge === "starting_soon"
                                ? "bg-warning-100"
                                : "bg-secondary-200"
                        }`}
                    >
                        <Text
                            className={`text-[11px] font-bold ${
                                item.badge === "starting_soon"
                                    ? "text-warning-700"
                                    : "text-typography-700"
                            }`}
                        >
                            {item.startTime}
                        </Text>
                    </View>
                </View>
            </View>
        </CardPressable>
    );
}

export function UpcomingCard({
    item,
    onPress,
}: {
    item: UpcomingTournament;
    onPress?: () => void;
}) {
    return (
        <CardPressable onPress={onPress} className="p-4 mb-3">
            <View className="flex-row items-center justify-between">
                <View className="flex-1">
                    <GluestackText
                        className="text-[15px] font-bold text-typography-900 mb-1"
                        numberOfLines={2}
                    >
                        {item.name}
                    </GluestackText>
                    <GluestackText
                        className="text-[12px] text-typography-500"
                        numberOfLines={1}
                    >
                        {item.organizerName}
                    </GluestackText>
                </View>
                {item.badgeLabel && (
                    <View className="px-2.5 py-1 rounded-lg bg-secondary-200">
                        <Text className="text-[11px] font-bold text-typography-700">
                            {item.badgeLabel}
                        </Text>
                    </View>
                )}
            </View>
            <Text className="text-[12px] text-typography-500 mt-2">
                {item.dateRange}
            </Text>
        </CardPressable>
    );
}

export function NearMeCard({
    item,
    onPress,
}: {
    item: NearMeTournament;
    onPress?: () => void;
}) {
    return (
        <CardPressable onPress={onPress} className="w-[200px] p-4">
            <GluestackText
                className="text-[15px] font-bold text-typography-900 mb-1"
                numberOfLines={2}
            >
                {item.name}
            </GluestackText>
            <Text className="text-[12px] text-typography-500 mb-1">
                {item.distance}
            </Text>
            <Text className="text-[11px] text-typography-500">
                {item.dateRange} · {item.teamCount} teams
            </Text>
        </CardPressable>
    );
}

export function FollowingCard({
    item,
    onPress,
}: {
    item: FollowingTournament;
    onPress?: () => void;
}) {
    return (
        <CardPressable onPress={onPress} className="p-4 mb-3">
            <GluestackText
                className="text-[15px] font-bold text-typography-900 mb-1"
                numberOfLines={2}
            >
                {item.name}
            </GluestackText>
            <GluestackText
                className="text-[12px] text-typography-500"
                numberOfLines={1}
            >
                {item.organizerName}
            </GluestackText>
            <Text className="text-[12px] text-typography-500 mt-2">
                {item.dateRange} · {item.teamCount} teams
            </Text>
        </CardPressable>
    );
}

const SEGMENTS: { id: TabId; label: string }[] = [
    { id: "all", label: "All" },
    { id: "following", label: "Following" },
    { id: "mine", label: "Mine" },
];

export function TournamentsSegmentControl() {
    const { segment } = useLocalSearchParams<{ segment?: string }>();
    const current = (segment === "following" || segment === "mine"
        ? segment
        : "all") as TabId;

    return (
        <View className="flex-row rounded-[22px] bg-secondary-100 p-1 gap-1">
            {SEGMENTS.map((seg) => {
                const isActive = current === seg.id;
                const href =
                    seg.id === "all"
                        ? "/tournaments"
                        : `/tournaments?segment=${seg.id}`;
                return (
                    <Link
                        key={seg.id}
                        href={href}
                        asChild
                        className="flex-1"
                    >
                        <Pressable
                            className={`flex-1 py-2 px-4 rounded-[18px] items-center justify-center ${
                                isActive ? "bg-typography-900" : "bg-transparent"
                            }`}
                        >
                            <Text
                                className={`text-[14px] font-semibold ${
                                    isActive
                                        ? "text-typography-0"
                                        : "text-typography-600"
                                }`}
                            >
                                {seg.label}
                            </Text>
                        </Pressable>
                    </Link>
                );
            })}
        </View>
    );
}

export function TournamentsHeaderActions() {
    return (
        <View className="flex-row items-center gap-2">
            <UIPressable className="w-[38px] h-[38px] rounded-[19px] bg-secondary-100 items-center justify-center">
                <Text className="text-typography-900">🔔</Text>
            </UIPressable>
            <UIPressable className="w-[38px] h-[38px] rounded-[19px] bg-secondary-100 items-center justify-center">
                <Text className="text-typography-900">⚙</Text>
            </UIPressable>
        </View>
    );
}

export function TournamentsScreenSkeleton() {
    return (
        <View className="px-6 gap-4">
            <View className="h-[120px] rounded-2xl bg-secondary-200 animate-pulse" />
            <View className="h-[80px] rounded-2xl bg-secondary-200 animate-pulse" />
            <View className="h-[80px] rounded-2xl bg-secondary-200 animate-pulse" />
            <View className="h-[80px] rounded-2xl bg-secondary-200 animate-pulse" />
        </View>
    );
}
