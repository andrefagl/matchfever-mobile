import React, { useState, useMemo } from "react";
import {
    View,
    Pressable,
    StyleSheet,
    ActivityIndicator,
    InteractionManager,
    BackHandler,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ArrowRight, Search } from "lucide-react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { BrandLogo } from "@/components/brand-logo";
import { Text as GluestackText } from "@/components/ui/text";
import { useOnboarding } from "@/contexts/onboarding-context";
import { listClubs } from "@/lib/api/clubs";
import { listTeams } from "@/lib/api/teams";
import { listPlayers } from "@/lib/api/players";
import type { ApiClub } from "@/lib/api/clubs";
import type { ApiTeam } from "@/lib/api/teams";
import type { ApiPlayer } from "@/lib/api/players";
import type { OnboardingStackParamList } from "./onboarding-navigator";
import type { OnboardingSelections } from "@/lib/onboarding-storage";
import Animated, {
    useAnimatedStyle,
    withDelay,
    withTiming,
} from "react-native-reanimated";
import { AnimatedTabContent } from "./animated-tab-content";
import { AnimatedTabBar } from "./animated-tab-bar";
import { useOnboardingProgress } from "@/contexts/onboarding-progress-context";
import {
    ClubListItem,
    TeamListItem,
    PlayerListItem,
} from "./list-items";

const PROGRESS_TRACK_WIDTH = 120;
const PROGRESS_ANIMATION_DURATION = 300;
const PROGRESS_ANIMATION_DELAY = 200;

function formatTeamDisplayName(team: ApiTeam, clubs: ApiClub[]): string {
    const clubMap = new Map(clubs.map((c) => [c.id, c]));
    if (team.name?.includes(" - ")) return team.name;
    if (team.clubId) {
        const club = clubMap.get(team.clubId);
        const clubName = club?.name ?? club?.shortName ?? "";
        const escalao = team.escalao ?? team.name;
        if (clubName) return `${clubName} - ${escalao}`;
    }
    return team.name ?? team.acronym ?? "";
}

function playersByTeam(
    players: ApiPlayer[],
    teamIds: string[],
    teams: ApiTeam[],
    clubs: ApiClub[]
): [string, string, ApiPlayer[]][] {
    const teamMap = new Map(teams.map((t) => [t.id, t]));
    const byTeam = new Map<string, ApiPlayer[]>();
    for (const p of players) {
        const tid = p.teamId ?? "other";
        if (!byTeam.has(tid)) byTeam.set(tid, []);
        byTeam.get(tid)!.push(p);
    }
    const result: [string, string, ApiPlayer[]][] = [];
    for (const teamId of teamIds) {
        const list = byTeam.get(teamId) ?? [];
        if (list.length > 0) {
            const team = teamMap.get(teamId);
            const name = team ? formatTeamDisplayName(team, clubs) : teamId;
            result.push([teamId, name, list]);
        }
    }
    const other = byTeam.get("other") ?? [];
    if (other.length > 0) result.push(["other", "Other", other]);
    return result;
}

function playersByPosition(players: ApiPlayer[]): [string, ApiPlayer[]][] {
    const byPos = new Map<string, ApiPlayer[]>();
    for (const p of players) {
        const key = p.position || "Other";
        if (!byPos.has(key)) byPos.set(key, []);
        byPos.get(key)!.push(p);
    }
    return Array.from(byPos.entries());
}

function StepBottomBar({
    step,
    onBack,
    onNext,
    isLast,
    showBack = true,
}: {
    step: number;
    onBack: () => void;
    onNext: () => void;
    isLast: boolean;
    showBack?: boolean;
}) {
    const progress = step / 3;
    const targetWidth = progress * PROGRESS_TRACK_WIDTH;
    const { fillWidth, shouldResetProgressRef } = useOnboardingProgress();

    useFocusEffect(
        React.useCallback(() => {
            const task = InteractionManager.runAfterInteractions(() => {
                if (shouldResetProgressRef.current) {
                    fillWidth.value = 0;
                    shouldResetProgressRef.current = false;
                }
                fillWidth.value = withDelay(
                    PROGRESS_ANIMATION_DELAY,
                    withTiming(targetWidth, {
                        duration: PROGRESS_ANIMATION_DURATION,
                    })
                );
            });
            return () => task.cancel();
        }, [step, fillWidth, targetWidth, shouldResetProgressRef])
    );

    const animatedFillStyle = useAnimatedStyle(() => ({
        width: fillWidth.value,
    }));

    return (
        <View style={styles.bottomBar}>
            {showBack ? (
                <Pressable onPress={onBack} hitSlop={12}>
                    <GluestackText className="font-lato text-[15px] font-medium text-typography-600">
                        Back
                    </GluestackText>
                </Pressable>
            ) : (
                <View />
            )}
            <View style={styles.progressTrack}>
                <Animated.View
                    style={[styles.progressFill, animatedFillStyle]}
                />
            </View>
            <Pressable onPress={onNext} style={styles.nextBtn}>
                <GluestackText className="font-lato text-white font-semibold text-base">
                    {isLast ? "Finish" : "Next"}
                </GluestackText>
            </Pressable>
        </View>
    );
}

export function WelcomeScreen() {
    const navigation =
        useNavigation<NativeStackNavigationProp<OnboardingStackParamList>>();
    const router = useRouter();
    const { shouldResetProgressRef } = useOnboardingProgress();

    useFocusEffect(
        React.useCallback(() => {
            shouldResetProgressRef.current = true;
        }, [shouldResetProgressRef])
    );

    const handleNext = () => {
        navigation.push("clubs");
    };

    return (
        <SafeAreaView
            className="flex-1 bg-background-0"
            edges={["top", "bottom"]}
        >
            <View style={styles.welcomeContent}>
                <View style={styles.welcomeTop}>
                    <BrandLogo size="xl" variant="dark" />
                    <GluestackText className="font-museoModerno text-[36px] font-semibold text-typography-900 text-center mb-12">
                        matchfever
                    </GluestackText>
                    <GluestackText className="font-lato text-[22px] font-medium text-typography-900 text-center">
                        Make every match count.
                    </GluestackText>
                </View>
                <View style={styles.welcomeBottom}>
                    <Pressable onPress={handleNext} style={styles.quickSetupBtn}>
                        <GluestackText className="font-lato text-white font-semibold text-[17px]">
                            Quick Setup
                        </GluestackText>
                        <ArrowRight size={20} color="#FFFFFF" />
                    </Pressable>
                    <Pressable
                        onPress={() => router.replace("/(profile)/signin")}
                        style={styles.signInRow}
                    >
                        <GluestackText className="font-lato text-[15px] font-normal text-typography-500">
                            Already a user?{" "}
                        </GluestackText>
                        <GluestackText className="font-lato text-[15px] font-semibold text-typography-900">
                            Sign in
                        </GluestackText>
                    </Pressable>
                </View>
            </View>
        </SafeAreaView>
    );
}

export function ClubsScreen() {
    const navigation =
        useNavigation<NativeStackNavigationProp<OnboardingStackParamList>>();
    const { followedClubs, toggleFollowClub } = useOnboarding();

    useFocusEffect(
        React.useCallback(() => {
            const subscription = BackHandler.addEventListener(
                "hardwareBackPress",
                () => true
            );
            return () => subscription.remove();
        }, [])
    );

    const clubsQuery = useQuery({
        queryKey: ["clubs"],
        queryFn: () => listClubs({ limit: 50 }),
    });

    const clubs = clubsQuery.data ?? [];

    const handleNext = () => navigation.push("teams");
    const openSearch = () => navigation.push("search", { segment: "clubs" });

    return (
        <SafeAreaView
            className="flex-1 bg-background-0"
            edges={["top", "bottom"]}
        >
            <View style={styles.stepHeader}>
                <GluestackText className="font-lato text-2xl font-bold text-typography-900">
                    Follow clubs
                </GluestackText>
                <Pressable hitSlop={12} onPress={openSearch}>
                    <Search size={22} color="#1A1A1A" />
                </Pressable>
            </View>
            <FlashList
                data={clubs}
                style={styles.scrollArea}
                renderItem={({ item }) => (
                    <ClubListItem
                        item={item}
                        followedIds={followedClubs}
                        onToggleFollow={toggleFollowClub}
                    />
                )}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={
                    <GluestackText className="font-lato text-[11px] font-semibold text-typography-500 mb-3">
                        Suggested
                    </GluestackText>
                }
                ListEmptyComponent={
                    clubsQuery.isLoading ? (
                        <View className="py-8 items-center">
                            <ActivityIndicator />
                        </View>
                    ) : (
                        <GluestackText className="font-lato text-typography-500 py-4">
                            No clubs found
                        </GluestackText>
                    )
                }
                contentContainerStyle={styles.scrollContent}
                contentInsetAdjustmentBehavior="automatic"
                showsVerticalScrollIndicator={false}
            />
            <StepBottomBar
                step={1}
                onBack={() => {}}
                onNext={handleNext}
                isLast={false}
                showBack={false}
            />
        </SafeAreaView>
    );
}

export function TeamsScreen() {
    const navigation =
        useNavigation<NativeStackNavigationProp<OnboardingStackParamList>>();
    const { followedClubs, followedTeams, toggleFollowTeam } = useOnboarding();
    const [teamsTab, setTeamsTab] = useState<"from-clubs" | "other">("from-clubs");

    const teamsQuery = useQuery({
        queryKey: ["teams"],
        queryFn: () => listTeams({ limit: 50 }),
    });
    const clubsQuery = useQuery({
        queryKey: ["clubs"],
        queryFn: () => listClubs({ limit: 50 }),
    });

    const clubs = clubsQuery.data ?? [];
    const teams = teamsQuery.data ?? [];
    const teamsFromClubs = teams.filter(
        (t) => t.clubId && followedClubs.has(t.clubId)
    );
    const teamsOther = teams.filter(
        (t) => !t.clubId || !followedClubs.has(t.clubId)
    );

    const handleNext = () => navigation.push("players");
    const handleBack = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            navigation.replace("clubs");
        }
    };
    const openSearch = () => navigation.push("search", { segment: "teams" });

    return (
        <SafeAreaView
            className="flex-1 bg-background-0"
            edges={["top", "bottom"]}
        >
            <View style={styles.stepHeader}>
                <GluestackText className="font-lato text-2xl font-bold text-typography-900">
                    Follow teams
                </GluestackText>
                <Pressable hitSlop={12} onPress={openSearch}>
                    <Search size={22} color="#1A1A1A" />
                </Pressable>
            </View>
            <AnimatedTabBar
                tabs={[
                    { label: "From your clubs" },
                    { label: "Other teams" },
                ]}
                activeIndex={teamsTab === "from-clubs" ? 0 : 1}
                onTabPress={(i) => setTeamsTab(i === 0 ? "from-clubs" : "other")}
            />
            <AnimatedTabContent
                activeIndex={teamsTab === "from-clubs" ? 0 : 1}
            >
                <FlashList
                    data={teamsFromClubs}
                    style={styles.scrollArea}
                    renderItem={({ item }) => (
                        <TeamListItem
                            item={item}
                            clubs={clubs}
                            followedIds={followedTeams}
                            onToggleFollow={toggleFollowTeam}
                        />
                    )}
                    keyExtractor={(item) => item.id}
                    ListEmptyComponent={
                        teamsQuery.isLoading ? (
                            <View className="py-8 items-center">
                                <ActivityIndicator />
                            </View>
                        ) : (
                            <GluestackText className="font-lato text-typography-500 py-4">
                                Follow clubs first to see their teams
                            </GluestackText>
                        )
                    }
                    contentContainerStyle={styles.scrollContent}
                    contentInsetAdjustmentBehavior="automatic"
                    showsVerticalScrollIndicator={false}
                />
                <FlashList
                    data={teamsOther}
                    style={styles.scrollArea}
                    renderItem={({ item }) => (
                        <TeamListItem
                            item={item}
                            clubs={clubs}
                            followedIds={followedTeams}
                            onToggleFollow={toggleFollowTeam}
                        />
                    )}
                    keyExtractor={(item) => item.id}
                    ListEmptyComponent={
                        teamsQuery.isLoading ? (
                            <View className="py-8 items-center">
                                <ActivityIndicator />
                            </View>
                        ) : (
                            <GluestackText className="font-lato text-typography-500 py-4">
                                No other teams found
                            </GluestackText>
                        )
                    }
                    contentContainerStyle={styles.scrollContent}
                    contentInsetAdjustmentBehavior="automatic"
                    showsVerticalScrollIndicator={false}
                />
            </AnimatedTabContent>
            <StepBottomBar
                step={2}
                onBack={handleBack}
                onNext={handleNext}
                isLast={false}
            />
        </SafeAreaView>
    );
}

export function PlayersScreen({
    onComplete,
}: {
    onComplete?: (selections: OnboardingSelections) => void;
}) {
    const navigation =
        useNavigation<NativeStackNavigationProp<OnboardingStackParamList>>();
    const queryClient = useQueryClient();
    const {
        followedClubs,
        followedTeams,
        followedPlayers,
        toggleFollowPlayer,
    } = useOnboarding();
    const [playersTab, setPlayersTab] = useState<"from-teams" | "other">(
        "from-teams"
    );

    const followedTeamIds = Array.from(followedTeams);
    const followedTeamIdsKey = [...followedTeamIds].sort().join(",");

    const teamsQuery = useQuery({
        queryKey: ["teams"],
        queryFn: () => listTeams({ limit: 50 }),
    });
    const clubsQuery = useQuery({
        queryKey: ["clubs"],
        queryFn: () => listClubs({ limit: 50 }),
    });
    const playersFromTeamsQuery = useQuery({
        queryKey: ["players", "from-teams", followedTeamIdsKey],
        queryFn: async () => {
            if (followedTeamIds.length === 0) return [];
            if (followedTeamIds.length === 1) {
                const list = await listPlayers({
                    teamIds: followedTeamIds,
                    limit: 50,
                });
                return list.map((p) => ({
                    ...p,
                    teamId: followedTeamIds[0],
                }));
            }
            const results = await Promise.all(
                followedTeamIds.map((teamId) =>
                    listPlayers({ teamIds: [teamId], limit: 50 }).then((list) =>
                        list.map((p) => ({ ...p, teamId }))
                    )
                )
            );
            return results.flat();
        },
        enabled: followedTeamIds.length > 0,
    });
    const playersOtherQuery = useQuery({
        queryKey: ["players", "other", followedTeamIdsKey],
        queryFn: () =>
            listPlayers({
                excludeTeamIds: followedTeamIds,
                limit: 50,
            }),
    });

    const clubs = clubsQuery.data ?? [];
    const teams = teamsQuery.data ?? [];
    const playersFromTeams = playersFromTeamsQuery.data ?? [];
    const playersOther = playersOtherQuery.data ?? [];

    const handleBack = () => {
        queryClient.removeQueries({ queryKey: ["players"] });
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            navigation.replace("teams");
        }
    };
    const handleNext = () =>
        onComplete?.({
            clubs: Array.from(followedClubs),
            teams: Array.from(followedTeams),
            players: Array.from(followedPlayers),
        });
    const openSearch = () =>
        navigation.push("search", { segment: "players" });

    const isLoadingFromTeams = playersFromTeamsQuery.isLoading;
    const isLoadingOther = playersOtherQuery.isLoading;

    const playersFromTeamsData = useMemo(() => {
        if (followedTeamIds.length === 0) return [];
        const sections = playersByTeam(
            playersFromTeams,
            followedTeamIds,
            teams,
            clubs
        );
        const flat: (ApiPlayer | { __type: "section"; id: string; title: string })[] = [];
        for (const [teamId, teamName, list] of sections) {
            flat.push({ __type: "section", id: `section-${teamId}`, title: teamName });
            flat.push(...list);
        }
        return flat;
    }, [playersFromTeams, followedTeamIds, teams, clubs]);

    const playersOtherData = useMemo(() => {
        const sections = playersByPosition(playersOther);
        const flat: (ApiPlayer | { __type: "section"; id: string; title: string })[] = [];
        for (const [position, list] of sections) {
            const title = position || "Other";
            flat.push({ __type: "section", id: `section-${title}`, title });
            flat.push(...list);
        }
        return flat;
    }, [playersOther]);

    const renderPlayersFromTeamsItem = ({
        item,
        index,
    }: {
        item: ApiPlayer | { __type: "section"; id: string; title: string };
        index: number;
    }) => {
        if ("__type" in item && item.__type === "section") {
            return (
                <GluestackText
                    className={`font-lato text-[11px] font-semibold text-typography-500 mb-3 ${index === 0 ? "mt-0" : "mt-5"}`}
                >
                    {item.title}
                </GluestackText>
            );
        }
        return (
            <PlayerListItem
                item={item as ApiPlayer}
                followedIds={followedPlayers}
                onToggleFollow={toggleFollowPlayer}
            />
        );
    };

    const renderPlayersOtherItem = ({
        item,
    }: {
        item: ApiPlayer | { __type: "section"; id: string; title: string };
    }) => {
        if ("__type" in item && item.__type === "section") {
            return (
                <GluestackText className="font-lato text-[11px] font-semibold text-typography-500 mb-3 mt-2">
                    {item.title}
                </GluestackText>
            );
        }
        return (
            <PlayerListItem
                item={item as ApiPlayer}
                followedIds={followedPlayers}
                onToggleFollow={toggleFollowPlayer}
            />
        );
    };

    return (
        <SafeAreaView
            className="flex-1 bg-background-0"
            edges={["top", "bottom"]}
        >
            <View style={styles.stepHeader}>
                <GluestackText className="font-lato text-2xl font-bold text-typography-900">
                    Follow players
                </GluestackText>
                <Pressable hitSlop={12} onPress={openSearch}>
                    <Search size={22} color="#1A1A1A" />
                </Pressable>
            </View>
            <AnimatedTabBar
                tabs={[
                    { label: "From your teams" },
                    { label: "Other players" },
                ]}
                activeIndex={playersTab === "from-teams" ? 0 : 1}
                onTabPress={(i) =>
                    setPlayersTab(i === 0 ? "from-teams" : "other")
                }
            />
            <AnimatedTabContent
                activeIndex={playersTab === "from-teams" ? 0 : 1}
            >
                <FlashList
                    data={playersFromTeamsData}
                    style={styles.scrollArea}
                    renderItem={renderPlayersFromTeamsItem}
                    keyExtractor={(item) =>
                        "__type" in item && item.__type === "section"
                            ? item.id
                            : (item as ApiPlayer).id
                    }
                    getItemType={(item) =>
                        "__type" in item && item.__type === "section"
                            ? "sectionHeader"
                            : "row"
                    }
                    ListEmptyComponent={
                        isLoadingFromTeams ? (
                            <View className="py-8 items-center">
                                <ActivityIndicator />
                            </View>
                        ) : (
                            <GluestackText className="font-lato text-typography-500 py-4">
                                Follow teams first to see their players
                            </GluestackText>
                        )
                    }
                    contentContainerStyle={styles.scrollContent}
                    contentInsetAdjustmentBehavior="automatic"
                    showsVerticalScrollIndicator={false}
                />
                <FlashList
                    data={playersOtherData}
                    style={styles.scrollArea}
                    renderItem={renderPlayersOtherItem}
                    keyExtractor={(item) =>
                        "__type" in item && item.__type === "section"
                            ? item.id
                            : (item as ApiPlayer).id
                    }
                    getItemType={(item) =>
                        "__type" in item && item.__type === "section"
                            ? "sectionHeader"
                            : "row"
                    }
                    ListEmptyComponent={
                        isLoadingOther ? (
                            <View className="py-8 items-center">
                                <ActivityIndicator />
                            </View>
                        ) : (
                            <GluestackText className="font-lato text-typography-500 py-4">
                                No other players found
                            </GluestackText>
                        )
                    }
                    contentContainerStyle={styles.scrollContent}
                    contentInsetAdjustmentBehavior="automatic"
                    showsVerticalScrollIndicator={false}
                />
            </AnimatedTabContent>
            <StepBottomBar
                step={3}
                onBack={handleBack}
                onNext={handleNext}
                isLast={true}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    welcomeContent: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 48,
        paddingBottom: 24,
        justifyContent: "space-between",
        alignItems: "center",
    },
    welcomeTop: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    welcomeBottom: {
        width: "100%",
        alignItems: "center",
        gap: 16,
    },
    signInRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    quickSetupBtn: {
        width: "100%",
        height: 56,
        backgroundColor: "#1A1A1A",
        borderRadius: 28,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingHorizontal: 24,
    },
    stepHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    scrollArea: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 24,
    },
    bottomBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        height: 72,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: "#F3F4F6",
        backgroundColor: "#FFFFFF",
    },
    progressTrack: {
        width: 120,
        height: 6,
        backgroundColor: "#E5E7EB",
        borderRadius: 3,
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        backgroundColor: "#1A1A1A",
        borderRadius: 3,
    },
    nextBtn: {
        backgroundColor: "#1A1A1A",
        borderRadius: 24,
        paddingVertical: 12,
        paddingHorizontal: 24,
        justifyContent: "center",
        alignItems: "center",
    },
});
