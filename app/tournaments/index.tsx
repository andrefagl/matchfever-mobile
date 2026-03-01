import { Bookmark, CalendarDays, Folder, MapPin } from "lucide-react-native";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text as GluestackText } from "@/components/ui/text";
import { MOCK_TOURNAMENTS } from "@/lib/mock-tournaments";
import type { TabId } from "@/lib/mock-tournaments";
import {
    CARD_GAP,
    H_PADDING,
    SectionHeader,
    LiveCard,
    TodayCard,
    UpcomingCard,
    NearMeCard,
    FollowingCard,
    SECTION_GAP,
    TournamentsScreenShell,
    TournamentsSegmentControl,
    TournamentsHeaderActions,
} from "./components";

function getSegment(segment?: string): TabId {
    if (segment === "following" || segment === "mine") return segment;
    return "all";
}

export default function TournamentsListScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { segment } = useLocalSearchParams<{ segment?: string }>();
    const tab = getSegment(segment);
    const data = MOCK_TOURNAMENTS;
    const onTournamentPress = (id: string) => router.push(`/tournaments/${id}`);

    return (
        <TournamentsScreenShell>
            <ScrollView
                className="flex-1"
                contentContainerStyle={{
                    paddingTop: insets.top,
                    paddingBottom: SECTION_GAP + 24,
                    paddingHorizontal: 0,
                    gap: SECTION_GAP,
                }}
                contentInsetAdjustmentBehavior="automatic"
                showsVerticalScrollIndicator={false}
            >
                <View className="px-6 pt-1">
                    <View className="flex-row items-center justify-between mb-6">
                        <GluestackText className="text-[28px] font-bold text-typography-900">
                            Tournaments
                        </GluestackText>
                        <TournamentsHeaderActions />
                    </View>
                    <View className="mb-6">
                        <TournamentsSegmentControl />
                    </View>
                </View>

                {(tab === "all" || tab === "following") && (
                    <>
                        {tab === "all" && data.live.length > 0 && (
                            <View className="mb-1">
                                <View className="px-6 mb-3">
                                    <View className="flex-row items-center justify-between">
                                        <View className="flex-row items-center gap-1.5">
                                            <View className="w-2 h-2 rounded-full bg-error-500" />
                                            <Text className="text-[11px] font-bold text-error-500">
                                                LIVE NOW
                                            </Text>
                                        </View>
                                        <Text className="text-[12px] text-typography-500">
                                            {data.live.length} tournaments
                                        </Text>
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

                        {tab === "all" && (
                            <>
                                <View className="px-6">
                                    <SectionHeader title="Today" right="See all" />
                                    {data.today.map((item) => (
                                        <TodayCard
                                            key={item.id}
                                            item={item}
                                            onPress={() => onTournamentPress(item.id)}
                                        />
                                    ))}
                                </View>

                                <View className="px-6">
                                    <SectionHeader
                                        title="Upcoming"
                                        right="See all"
                                        icon={CalendarDays}
                                    />
                                    {data.upcoming.map((item) => (
                                        <UpcomingCard
                                            key={item.id}
                                            item={item}
                                            onPress={() => onTournamentPress(item.id)}
                                        />
                                    ))}
                                </View>

                                <View>
                                    <View className="px-6 mb-3">
                                        <SectionHeader
                                            title="Near Me"
                                            right="See all"
                                            icon={MapPin}
                                        />
                                    </View>
                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        contentContainerStyle={{
                                            paddingHorizontal: H_PADDING,
                                            gap: CARD_GAP,
                                        }}
                                    >
                                        {data.nearMe.map((item) => (
                                            <NearMeCard
                                                key={item.id}
                                                item={item}
                                                onPress={() => onTournamentPress(item.id)}
                                            />
                                        ))}
                                    </ScrollView>
                                </View>
                            </>
                        )}

                        {(tab === "all" || tab === "following") && (
                            <View className="px-6 mt-2">
                                <SectionHeader
                                    title="Following"
                                    right="See all"
                                    icon={Bookmark}
                                />
                                {data.following.length === 0 && tab === "following" ? (
                                    <View className="rounded-2xl bg-secondary-100 p-4 items-center justify-center min-h-[120]">
                                        <GluestackText className="text-typography-500 text-center">
                                            You aren't following any tournaments yet.
                                        </GluestackText>
                                    </View>
                                ) : (
                                    data.following.map((item) => (
                                        <FollowingCard
                                            key={item.id}
                                            item={item}
                                            onPress={() => onTournamentPress(item.id)}
                                        />
                                    ))
                                )}
                            </View>
                        )}
                    </>
                )}

                {tab === "mine" && (
                    <View className="px-6">
                        <SectionHeader
                            title="My tournaments"
                            right="Create new"
                            icon={Folder}
                        />
                        <View className="rounded-2xl bg-secondary-100 p-4 items-center justify-center min-h-[120]">
                            <GluestackText className="text-typography-500 text-center">
                                You haven't created any tournaments yet.
                            </GluestackText>
                        </View>
                    </View>
                )}
            </ScrollView>
        </TournamentsScreenShell>
    );
}
