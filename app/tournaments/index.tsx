import React from "react";
import { ScrollView, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text as GluestackText } from "@/components/ui/text";
import type { TabId } from "@/lib/mock-tournaments";
import { useTournamentsSections } from "@/lib/hooks/use-tournaments";
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
    TournamentsScreenSkeleton,
} from "./components";

function getSegment(segment?: string): TabId {
    if (segment === "following" || segment === "mine") return segment;
    return "all";
}

export default function TournamentsListScreen() {
    const router = useRouter();
    const { segment } = useLocalSearchParams<{ segment?: string }>();
    const tab = getSegment(segment);
    const { data, isLoading, isError, error, refetch } =
        useTournamentsSections();
    const onTournamentPress = (id: string) => router.push(`/tournaments/${id}`);

    const showSkeleton = isLoading;

    return (
        <TournamentsScreenShell>
            <ScrollView
                className='flex-1'
                contentContainerStyle={{
                    paddingBottom: SECTION_GAP + 24,
                    paddingHorizontal: 0,
                    gap: SECTION_GAP,
                }}
                contentInsetAdjustmentBehavior='automatic'
                showsVerticalScrollIndicator={false}
            >
                <View className='px-6 pt-1'>
                    <View className='flex-row items-center justify-between mb-6'>
                        <GluestackText className='text-[28px] font-bold text-typography-900'>
                            Tournaments
                        </GluestackText>
                        <TournamentsHeaderActions />
                    </View>
                    <View className='mb-6'>
                        <TournamentsSegmentControl />
                    </View>
                </View>

                {showSkeleton && <TournamentsScreenSkeleton />}

                {isError && !showSkeleton && (
                    <View className='mx-6 rounded-2xl bg-secondary-100 p-4 items-center justify-center min-h-[120]'>
                        <GluestackText className='text-typography-500 text-center'>
                            {error?.message ?? "Failed to load tournaments"}
                        </GluestackText>
                        <Text
                            className='text-[14px] font-semibold text-primary-500 mt-2'
                            onPress={() => refetch()}
                        >
                            Retry
                        </Text>
                    </View>
                )}

                {!showSkeleton && !isError && (tab === "all" || tab === "following") && (
                    <>
                        {tab === "all" && data.live.length > 0 && (
                            <View className='mb-1'>
                                <View className='px-6 mb-3'>
                                    <View className='flex-row items-center justify-between'>
                                        <View className='flex-row items-center gap-1.5'>
                                            <View className='w-2 h-2 rounded-full bg-error-500' />
                                            <Text className='text-[11px] font-bold text-error-500'>
                                                LIVE NOW
                                            </Text>
                                        </View>
                                        <Text className='text-[12px] text-typography-500'>
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
                                            onPress={() =>
                                                onTournamentPress(item.id)
                                            }
                                        />
                                    ))}
                                </ScrollView>
                            </View>
                        )}

                        {tab === "all" && (
                            <>
                                <View className='px-6'>
                                    <SectionHeader
                                        title='Today'
                                        right='See all'
                                    />
                                    {data.today.map((item) => (
                                        <TodayCard
                                            key={item.id}
                                            item={item}
                                            onPress={() =>
                                                onTournamentPress(item.id)
                                            }
                                        />
                                    ))}
                                </View>

                                <View className='px-6'>
                                    <SectionHeader
                                        title='Upcoming'
                                        right='See all'
                                    />
                                    {data.upcoming.map((item) => (
                                        <UpcomingCard
                                            key={item.id}
                                            item={item}
                                            onPress={() =>
                                                onTournamentPress(item.id)
                                            }
                                        />
                                    ))}
                                </View>

                                <View>
                                    <View className='px-6 mb-3'>
                                        <SectionHeader
                                            title='Near Me'
                                            right='See all'
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
                                                onPress={() =>
                                                    onTournamentPress(item.id)
                                                }
                                            />
                                        ))}
                                    </ScrollView>
                                </View>
                            </>
                        )}

                        {(tab === "all" || tab === "following") && (
                            <View className='px-6 mt-2'>
                                <SectionHeader
                                    title='Following'
                                    right='See all'
                                />
                                {data.following.length === 0 &&
                                tab === "following" ? (
                                    <View className='rounded-2xl bg-secondary-100 p-4 items-center justify-center min-h-[120]'>
                                        <GluestackText className='text-typography-500 text-center'>
                                            You aren't following any tournaments
                                            yet.
                                        </GluestackText>
                                    </View>
                                ) : (
                                    data.following.map((item) => (
                                        <FollowingCard
                                            key={item.id}
                                            item={item}
                                            onPress={() =>
                                                onTournamentPress(item.id)
                                            }
                                        />
                                    ))
                                )}
                            </View>
                        )}
                    </>
                )}

                {!showSkeleton && !isError && tab === "mine" && (
                    <View className='px-6'>
                        <SectionHeader
                            title='My tournaments'
                            right='Create new'
                        />
                        <View className='rounded-2xl bg-secondary-100 p-4 items-center justify-center min-h-[120]'>
                            <GluestackText className='text-typography-500 text-center'>
                                You haven't created any tournaments yet.
                            </GluestackText>
                        </View>
                    </View>
                )}
            </ScrollView>
        </TournamentsScreenShell>
    );
}
