import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Text as GluestackText } from "@/components/ui/text";
import { useTournamentsSections } from "@/lib/hooks/use-tournaments";
import {
    CARD_GAP,
    H_PADDING,
    LiveCard,
    TodayCard,
    SectionHeader,
} from "@/components/tournaments-screen";

export default function HomeScreen() {
    const router = useRouter();
    const { data, isLoading, isError, error, refetch } =
        useTournamentsSections();
    const onTournamentPress = (id: string) =>
        router.push(`/tournaments/${id}`);

    return (
        <ScrollView
            className="flex-1 bg-background-0"
            contentContainerStyle={{
                paddingBottom: 24,
                paddingHorizontal: 0,
            }}
            contentInsetAdjustmentBehavior="automatic"
            showsVerticalScrollIndicator={false}
        >
            <View className="px-6 pt-4 pb-2">
                <GluestackText className="text-[28px] font-bold text-typography-900">
                    What's happening
                </GluestackText>
            </View>

            {isError && (
                <View className="mx-6 rounded-2xl bg-secondary-100 p-4 items-center justify-center min-h-[100]">
                    <GluestackText className="text-typography-500 text-center">
                        {error?.message ?? "Failed to load"}
                    </GluestackText>
                    <Text
                        className="text-[14px] font-semibold text-primary-500 mt-2"
                        onPress={() => refetch()}
                    >
                        Retry
                    </Text>
                </View>
            )}

            {!isError && data.live.length > 0 && (
                <View className="mb-4">
                    <View className="px-6 mb-3">
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center gap-1.5">
                                <View className="w-2 h-2 rounded-full bg-error-500" />
                                <Text className="text-[11px] font-bold text-error-500">
                                    LIVE NOW
                                </Text>
                            </View>
                        </View>
                    </View>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{
                            paddingHorizontal: H_PADDING,
                            gap: CARD_GAP,
                        }}
                    >
                        {data.live.map((item) => (
                            <LiveCard
                                key={item.id}
                                item={item}
                                onPress={() => onTournamentPress(item.id)}
                            />
                        ))}
                    </ScrollView>
                </View>
            )}

            {!isError && data.today.length > 0 && (
                <View className="px-6">
                    <SectionHeader title="Today" />
                    {data.today.map((item) => (
                        <TodayCard
                            key={item.id}
                            item={item}
                            onPress={() => onTournamentPress(item.id)}
                        />
                    ))}
                </View>
            )}

            {!isError && !isLoading && data.live.length === 0 && data.today.length === 0 && (
                <View className="mx-6 rounded-2xl bg-secondary-100 p-8 items-center justify-center min-h-[120]">
                    <GluestackText className="text-typography-500 text-center">
                        No live or today tournaments. Check the Tournaments tab
                        for upcoming events.
                    </GluestackText>
                    <Pressable
                        onPress={() => router.push("/tournaments")}
                        className="mt-4"
                    >
                        <Text className="text-[14px] font-semibold text-primary-500">
                            Browse tournaments
                        </Text>
                    </Pressable>
                </View>
            )}
        </ScrollView>
    );
}
