import {
    Bell,
    Bookmark,
    CalendarDays,
    Folder,
    MapPin,
    SlidersHorizontal,
} from "lucide-react-native";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Box } from "@/components/ui/box";
import { Text as GluestackText } from "@/components/ui/text";
import {
    type LiveTournament,
    type NearMeTournament,
    type TabId,
    type TodayTournament,
    type UpcomingTournament,
    type FollowingTournament,
} from "@/lib/mock-tournaments";

export const SECTION_GAP = 24;
export const H_PADDING = 24;
export const CARD_GAP = 12;
export const CARD_WIDTH = 256;
export const LIVE_CARD_HEIGHT = 160;

const TAB_IDS: TabId[] = ["all", "following", "mine"];
const TAB_LABELS: Record<TabId, string> = {
    all: "All",
    following: "Following",
    mine: "Mine",
};

function getSegmentFromParams(segment?: string): TabId {
    if (segment === "following" || segment === "mine") return segment;
    return "all";
}

export function TournamentsSegmentControl() {
    const router = useRouter();
    const params = useLocalSearchParams<{ segment?: string }>();
    const value = getSegmentFromParams(params.segment);

    const handlePress = (id: TabId) => {
        if (id === value) return;
        if (id === "all") router.replace("/tournaments");
        else router.replace(`/tournaments?segment=${id}`);
    };

    return (
        <View className='flex-row rounded-[22px] bg-secondary-100 p-1 gap-1'>
            {TAB_IDS.map((tabId) => (
                <Pressable
                    key={tabId}
                    onPress={() => handlePress(tabId)}
                    className='flex-1 flex-row items-center justify-center rounded-[18px] py-2'
                    style={{
                        backgroundColor:
                            value === tabId ? "rgb(26, 26, 26)" : "transparent",
                    }}
                >
                    <Text
                        className='text-[13px] font-semibold'
                        style={{
                            color:
                                value === tabId
                                    ? "#FFFFFF"
                                    : "rgb(156, 163, 175)",
                        }}
                    >
                        {TAB_LABELS[tabId]}
                    </Text>
                </Pressable>
            ))}
        </View>
    );
}

export function TournamentsHeaderActions() {
    return (
        <View className='flex-row items-center gap-2'>
            <Pressable className='w-[38px] h-[38px] rounded-full bg-secondary-100 items-center justify-center'>
                <Bell size={18} color='rgb(26, 26, 26)' />
            </Pressable>
            <Pressable className='w-[38px] h-[38px] rounded-full bg-secondary-100 items-center justify-center'>
                <SlidersHorizontal size={18} color='rgb(26, 26, 26)' />
            </Pressable>
        </View>
    );
}

export function SectionHeader({
    title,
    right,
    icon: Icon,
}: {
    title: string;
    right?: string;
    icon?: React.ComponentType<{ size: number; color: string }>;
}) {
    return (
        <View className='flex-row items-center justify-between mb-3'>
            <View className='flex-row items-center gap-1.5'>
                {Icon && <Icon size={14} color='rgb(107, 114, 128)' />}
                <GluestackText className='text-[17px] font-bold text-typography-900'>
                    {title}
                </GluestackText>
            </View>
            {right && (
                <Text className='text-[13px] text-typography-500'>{right}</Text>
            )}
        </View>
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
    const content = (
        <>
            <View>
                <View
                    className='flex-row items-center gap-1 rounded-[10px] self-start px-2 py-0.5 mb-2.5'
                    style={{ backgroundColor: "#FF3B30" }}
                >
                    <View className='w-1.5 h-1.5 rounded-full bg-white' />
                    <Text className='text-[10px] font-bold text-white'>
                        LIVE
                    </Text>
                </View>
                <Text
                    className='text-[14px] font-bold text-white'
                    numberOfLines={1}
                    ellipsizeMode='tail'
                >
                    {item.name}
                </Text>
                <Text className='text-[11px] text-typography-500 mt-0.5'>
                    {item.organizerName}
                </Text>
            </View>
            <View
                className='flex-row items-center justify-between rounded-[10px] px-2.5 py-2'
                style={{ backgroundColor: "rgb(42, 42, 42)" }}
            >
                <View className='flex-row items-center gap-1.5'>
                    <View className='w-5 h-5 rounded-full bg-primary-400' />
                    <Text className='text-[11px] font-semibold text-white'>
                        {g.homeTeamAbbr}
                    </Text>
                </View>
                <Text
                    className='text-[13px] font-bold'
                    style={{ color: "#FF6B6B" }}
                >
                    {g.scoreHome} – {g.scoreAway}
                </Text>
                <View className='flex-row items-center gap-1.5'>
                    <Text className='text-[11px] font-semibold text-white'>
                        {g.awayTeamAbbr}
                    </Text>
                    <View className='w-5 h-5 rounded-full bg-primary-400' />
                </View>
            </View>
            <Text className='text-[10px] text-typography-500'>
                {g.minute}' · {g.gamesLiveInTournament} games live
            </Text>
        </>
    );
    const style = {
        width: CARD_WIDTH,
        height: LIVE_CARD_HEIGHT,
        backgroundColor: "rgb(26, 26, 26)",
    };
    if (onPress) {
        return (
            <Pressable
                onPress={onPress}
                className='rounded-[20px] p-3.5 justify-between'
                style={style}
            >
                {content}
            </Pressable>
        );
    }
    return (
        <View
            className='rounded-[20px] p-3.5 justify-between'
            style={style}
        >
            {content}
        </View>
    );
}

export function TodayCard({
    item,
    onPress,
}: {
    item: TodayTournament;
    onPress?: () => void;
}) {
    const isStartingSoon = item.badge === "starting_soon";
    const content = (
        <>
            <View className='flex-1 gap-1'>
                <GluestackText
                    className='text-[14px] font-semibold text-typography-900'
                    numberOfLines={1}
                >
                    {item.name}
                </GluestackText>
                <GluestackText className='text-[12px] text-typography-500'>
                    {item.organizerName} · Starts {item.startTime}
                </GluestackText>
            </View>
            <View
                className='rounded-[10px] px-2.5 py-1.5'
                style={{
                    backgroundColor: isStartingSoon ? "#F0FDF4" : "#FFFBEB",
                }}
            >
                <Text
                    className='text-[11px] font-semibold'
                    style={{ color: isStartingSoon ? "#16A34A" : "#D97706" }}
                >
                    {isStartingSoon ? "Starting soon" : "Today"}
                </Text>
            </View>
        </>
    );
    const cn = 'flex-row items-center gap-3 rounded-2xl bg-secondary-100 p-4 mb-6';
    if (onPress) return <Pressable onPress={onPress} className={cn}>{content}</Pressable>;
    return <View className={cn}>{content}</View>;
}

export function UpcomingCard({
    item,
    onPress,
}: {
    item: UpcomingTournament;
    onPress?: () => void;
}) {
    const content = (
        <>
            <View className='flex-1 gap-1'>
                <GluestackText
                    className='text-[14px] font-semibold text-typography-900'
                    numberOfLines={1}
                >
                    {item.name}
                </GluestackText>
                <GluestackText className='text-[12px] text-typography-500'>
                    {item.organizerName} · {item.dateRange}
                </GluestackText>
            </View>
            {item.badgeLabel && (
                <View className='rounded-[10px] px-2.5 py-1.5 bg-info-50'>
                    <Text className='text-[11px] font-semibold text-info-600'>
                        {item.badgeLabel}
                    </Text>
                </View>
            )}
        </>
    );
    const cn = 'flex-row items-center gap-3 rounded-2xl bg-secondary-100 p-4 mb-6';
    if (onPress) return <Pressable onPress={onPress} className={cn}>{content}</Pressable>;
    return <View className={cn}>{content}</View>;
}

export function NearMeCard({
    item,
    onPress,
}: {
    item: NearMeTournament;
    onPress?: () => void;
}) {
    const content = (
        <>
            <GluestackText
                className='text-[13px] font-semibold text-typography-900'
                numberOfLines={1}
                ellipsizeMode='tail'
            >
                {item.name}
            </GluestackText>
            <View className='gap-1'>
                <View className='flex-row items-center gap-1'>
                    <MapPin size={11} color='rgb(156, 163, 175)' />
                    <Text className='text-[11px] text-typography-500'>
                        {item.distance}
                    </Text>
                </View>
                <View className='flex-row items-center gap-1'>
                    <CalendarDays size={11} color='rgb(156, 163, 175)' />
                    <Text className='text-[11px] text-typography-500'>
                        {item.dateRange}
                    </Text>
                </View>
            </View>
            <View className='rounded-lg px-2 py-1 self-start bg-info-100'>
                <Text className='text-[10px] font-semibold text-info-700'>
                    {item.teamCount} teams
                </Text>
            </View>
        </>
    );
    const style = { width: CARD_WIDTH, backgroundColor: "rgb(246, 247, 248)", gap: 16 };
    if (onPress) return <Pressable onPress={onPress} className='rounded-2xl p-3.5' style={style}>{content}</Pressable>;
    return <View className='rounded-2xl p-3.5' style={style}>{content}</View>;
}

export function FollowingCard({
    item,
    onPress,
}: {
    item: FollowingTournament;
    onPress?: () => void;
}) {
    const content = (
        <>
            <View className='flex-1 gap-1'>
                <GluestackText
                    className='text-[14px] font-semibold text-typography-900'
                    numberOfLines={1}
                >
                    {item.name}
                </GluestackText>
                <GluestackText className='text-[12px] text-typography-500'>
                    {item.organizerName} · {item.dateRange}
                </GluestackText>
            </View>
            <View className='rounded-[10px] px-2.5 py-1.5 bg-info-50'>
                <Text className='text-[11px] font-semibold text-info-600'>
                    {item.teamCount} teams
                </Text>
            </View>
        </>
    );
    const cn = 'flex-row items-center gap-3 rounded-2xl bg-secondary-100 p-4 mb-6';
    if (onPress) return <Pressable onPress={onPress} className={cn}>{content}</Pressable>;
    return <View className={cn}>{content}</View>;
}

export function TournamentsScreenShell({
    children,
}: {
    children: React.ReactNode;
}) {
    return <Box className='flex-1 bg-background-0'>{children}</Box>;
}

// --- Skeletons (loading placeholders) ---

const SKELETON_BG = "rgb(229, 231, 235)";
const SKELETON_BG_DARK = "rgb(70, 70, 70)";

function SkeletonBox({
    className,
    style,
    dark,
}: {
    className?: string;
    style?: React.ComponentProps<typeof View>["style"];
    dark?: boolean;
}) {
    return (
        <View
            className={className}
            style={[
                { backgroundColor: dark ? SKELETON_BG_DARK : SKELETON_BG },
                style,
            ]}
        />
    );
}

export function LiveCardSkeleton() {
    return (
        <View
            className='rounded-[20px] p-3.5 justify-between'
            style={{
                width: CARD_WIDTH,
                height: LIVE_CARD_HEIGHT,
                backgroundColor: "rgb(246, 247, 248)",
            }}
        >
            <View>
                <SkeletonBox
                    className='rounded-[10px] self-start mb-2.5'
                    style={{ width: 48, height: 20 }}
                />
                <SkeletonBox
                    className='rounded h-4 mb-1'
                    style={{ width: 160 }}
                />
                <SkeletonBox
                    className='rounded h-3'
                    style={{ width: 100 }}
                />
            </View>
            <View
                className='flex-row items-center justify-between rounded-[10px] px-2.5 py-2'
                style={{ backgroundColor: "rgb(229, 231, 235)" }}
            >
                <View className='flex-row items-center gap-1.5'>
                    <SkeletonBox
                        className='rounded-full'
                        style={{ width: 20, height: 20 }}
                    />
                    <SkeletonBox
                        className='rounded h-3'
                        style={{ width: 28 }}
                    />
                </View>
                <SkeletonBox
                    className='rounded h-4'
                    style={{ width: 44 }}
                />
                <View className='flex-row items-center gap-1.5'>
                    <SkeletonBox
                        className='rounded h-3'
                        style={{ width: 28 }}
                    />
                    <SkeletonBox
                        className='rounded-full'
                        style={{ width: 20, height: 20 }}
                    />
                </View>
            </View>
            <SkeletonBox
                className='rounded h-3'
                style={{ width: 100 }}
            />
        </View>
    );
}

export function TodayCardSkeleton() {
    return (
        <View className='flex-row items-center gap-3 rounded-2xl bg-secondary-100 p-4 mb-6'>
            <View className='flex-1 gap-2'>
                <SkeletonBox className='rounded h-4' style={{ width: "80%" }} />
                <SkeletonBox className='rounded h-3' style={{ width: "60%" }} />
            </View>
            <SkeletonBox
                className='rounded-[10px]'
                style={{ width: 72, height: 28 }}
            />
        </View>
    );
}

export function UpcomingCardSkeleton() {
    return (
        <View className='flex-row items-center gap-3 rounded-2xl bg-secondary-100 p-4 mb-6'>
            <View className='flex-1 gap-2'>
                <SkeletonBox className='rounded h-4' style={{ width: "85%" }} />
                <SkeletonBox className='rounded h-3' style={{ width: "65%" }} />
            </View>
            <SkeletonBox
                className='rounded-[10px]'
                style={{ width: 56, height: 28 }}
            />
        </View>
    );
}

export function NearMeCardSkeleton() {
    return (
        <View
            className='rounded-2xl p-3.5'
            style={{ width: CARD_WIDTH, backgroundColor: "rgb(246, 247, 248)", gap: 16 }}
        >
            <SkeletonBox className='rounded h-4' style={{ width: "70%" }} />
            <View className='gap-2'>
                <SkeletonBox className='rounded h-3' style={{ width: 64 }} />
                <SkeletonBox className='rounded h-3' style={{ width: 90 }} />
            </View>
            <SkeletonBox
                className='rounded-lg self-start'
                style={{ width: 70, height: 22 }}
            />
        </View>
    );
}

export function FollowingCardSkeleton() {
    return (
        <View className='flex-row items-center gap-3 rounded-2xl bg-secondary-100 p-4 mb-6'>
            <View className='flex-1 gap-2'>
                <SkeletonBox className='rounded h-4' style={{ width: "75%" }} />
                <SkeletonBox className='rounded h-3' style={{ width: "55%" }} />
            </View>
            <SkeletonBox
                className='rounded-[10px]'
                style={{ width: 64, height: 28 }}
            />
        </View>
    );
}

function SectionHeaderSkeleton() {
    return (
        <View className='flex-row items-center justify-between mb-3'>
            <SkeletonBox className='rounded h-5' style={{ width: 100 }} />
            <SkeletonBox className='rounded h-4' style={{ width: 52 }} />
        </View>
    );
}

export function TournamentsScreenSkeleton() {
    return (
        <>
            <View className='mb-1'>
                <View className='px-6 mb-3'>
                    <View className='flex-row items-center justify-between'>
                        <View className='flex-row items-center gap-1.5'>
                            <View
                                className='w-2 h-2 rounded-full'
                                style={{ backgroundColor: SKELETON_BG }}
                            />
                            <SkeletonBox
                                className='rounded h-3'
                                style={{ width: 70 }}
                            />
                        </View>
                        <SkeletonBox
                            className='rounded h-3'
                            style={{ width: 90 }}
                        />
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
                    <LiveCardSkeleton />
                    <LiveCardSkeleton />
                    <LiveCardSkeleton />
                </ScrollView>
            </View>

            <View className='px-6'>
                <SectionHeaderSkeleton />
                <TodayCardSkeleton />
                <TodayCardSkeleton />
            </View>

            <View className='px-6'>
                <SectionHeaderSkeleton />
                <UpcomingCardSkeleton />
                <UpcomingCardSkeleton />
            </View>

            <View>
                <View className='px-6 mb-3'>
                    <SectionHeaderSkeleton />
                </View>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingHorizontal: H_PADDING,
                        gap: CARD_GAP,
                    }}
                >
                    <NearMeCardSkeleton />
                    <NearMeCardSkeleton />
                    <NearMeCardSkeleton />
                </ScrollView>
            </View>

            <View className='px-6 mt-2'>
                <SectionHeaderSkeleton />
                <FollowingCardSkeleton />
                <FollowingCardSkeleton />
            </View>
        </>
    );
}
