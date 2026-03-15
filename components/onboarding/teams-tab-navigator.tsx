import React from "react";
import {
    View,
    Pressable,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useNavigation, useNavigationState } from "@react-navigation/native";
import { Search } from "lucide-react-native";
import { Text as GluestackText } from "@/components/ui/text";
import { useOnboarding } from "@/contexts/onboarding-context";
import { useQuery } from "@tanstack/react-query";
import { listClubs } from "@/lib/api/clubs";
import { listTeams } from "@/lib/api/teams";
import type { ApiTeam } from "@/lib/api/teams";
import type { ApiClub } from "@/lib/api/clubs";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { OnboardingStackParamList } from "./onboarding-navigator";
import {
    TeamAvatar,
    FollowButton,
    formatTeamDisplayName,
    StepBottomBar,
} from "./teams-tab-content";

type TeamsTabParamList = {
    "from-clubs": undefined;
    other: undefined;
};

const TabStack = createNativeStackNavigator<TeamsTabParamList>();

function TeamsHeaderWithTabs({
    onOpenSearch,
}: {
    onOpenSearch: () => void;
}) {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const currentRoute = useNavigationState(
        (state) => state?.routes?.[state?.index ?? 0]?.name ?? "from-clubs"
    ) as "from-clubs" | "other";
    const isFromClubs = currentRoute === "from-clubs";

    const goToFromClubs = () => {
        if (!isFromClubs) navigation.goBack();
    };
    const goToOther = () => {
        if (isFromClubs) (navigation as any).navigate("other");
    };

    return (
        <View style={[headerStyles.container, { paddingTop: insets.top }]}>
            <View style={headerStyles.stepHeader}>
                <GluestackText className="font-lato text-2xl font-bold text-typography-900">
                    Follow teams
                </GluestackText>
                <Pressable hitSlop={12} onPress={onOpenSearch}>
                    <Search size={22} color="#1A1A1A" />
                </Pressable>
            </View>
            <View style={headerStyles.tabBar}>
                <Pressable
                    onPress={goToFromClubs}
                    style={
                        isFromClubs ? headerStyles.tabActive : headerStyles.tab
                    }
                >
                    <GluestackText
                        className={
                            isFromClubs
                                ? "font-lato text-sm font-semibold text-typography-900"
                                : "font-lato text-sm font-medium text-typography-500"
                        }
                    >
                        From your clubs
                    </GluestackText>
                    {isFromClubs && <View style={headerStyles.tabLine} />}
                </Pressable>
                <Pressable
                    onPress={goToOther}
                    style={
                        !isFromClubs ? headerStyles.tabActive : headerStyles.tab
                    }
                >
                    <GluestackText
                        className={
                            !isFromClubs
                                ? "font-lato text-sm font-semibold text-typography-900"
                                : "font-lato text-sm font-medium text-typography-500"
                        }
                    >
                        Other teams
                    </GluestackText>
                    {!isFromClubs && <View style={headerStyles.tabLine} />}
                </Pressable>
            </View>
        </View>
    );
}

export function TeamsTabNavigator() {
    const parentNav =
        useNavigation<NativeStackNavigationProp<OnboardingStackParamList>>();
    const { followedClubs, followedTeams, toggleFollowTeam } = useOnboarding();

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

    const handleNext = () => parentNav.replace("players");
    const handleBack = () => parentNav.replace("clubs");
    const openSearch = () => parentNav.push("search", { segment: "teams" });

    return (
        <TabStack.Navigator
            screenOptions={{
                headerShown: true,
                header: () => (
                    <TeamsHeaderWithTabs onOpenSearch={openSearch} />
                ),
                headerStatusBarHeight: 0,
                animation: "slide_from_right",
                contentStyle: { backgroundColor: "#FFFFFF" },
            }}
        >
            <TabStack.Screen name="from-clubs">
                {() => (
                    <TeamsTabContent
                        teams={teamsFromClubs}
                        clubs={clubs}
                        followedTeams={followedTeams}
                        toggleFollowTeam={toggleFollowTeam}
                        isLoading={teamsQuery.isLoading}
                        emptyMessage="Follow clubs first to see their teams"
                        onBack={handleBack}
                        onNext={handleNext}
                        step={2}
                    />
                )}
            </TabStack.Screen>
            <TabStack.Screen name="other">
                {() => (
                    <TeamsTabContent
                        teams={teamsOther}
                        clubs={clubs}
                        followedTeams={followedTeams}
                        toggleFollowTeam={toggleFollowTeam}
                        isLoading={teamsQuery.isLoading}
                        emptyMessage="No other teams found"
                        onBack={handleBack}
                        onNext={handleNext}
                        step={2}
                    />
                )}
            </TabStack.Screen>
        </TabStack.Navigator>
    );
}

function TeamsTabContent({
    teams,
    clubs,
    followedTeams,
    toggleFollowTeam,
    isLoading,
    emptyMessage,
    onBack,
    onNext,
    step,
}: {
    teams: ApiTeam[];
    clubs: ApiClub[];
    followedTeams: Set<string>;
    toggleFollowTeam: (id: string) => void;
    isLoading: boolean;
    emptyMessage: string;
    onBack: () => void;
    onNext: () => void;
    step: number;
}) {
    return (
        <View style={{ flex: 1 }}>
            <ScrollView
                style={headerStyles.scrollArea}
                contentContainerStyle={headerStyles.scrollContent}
                contentInsetAdjustmentBehavior="automatic"
                showsVerticalScrollIndicator={false}
            >
                {isLoading && (
                    <View className="py-8 items-center">
                        <ActivityIndicator />
                    </View>
                )}
                {!isLoading && teams.length === 0 && (
                    <GluestackText className="font-lato text-typography-500 py-4">
                        {emptyMessage}
                    </GluestackText>
                )}
                {!isLoading &&
                    teams.map((team) => (
                        <View key={team.id} style={headerStyles.listItem}>
                            <View style={headerStyles.listItemLeft}>
                                <TeamAvatar logoUrl={team.logo} />
                                <View>
                                    <GluestackText className="font-lato text-[15px] font-semibold text-typography-900">
                                        {formatTeamDisplayName(team, clubs)}
                                    </GluestackText>
                                    {team.acronym && (
                                        <GluestackText className="font-lato text-[13px] font-medium text-typography-500">
                                            {team.acronym}
                                        </GluestackText>
                                    )}
                                </View>
                            </View>
                            <FollowButton
                                id={team.id}
                                following={followedTeams.has(team.id)}
                                onToggle={toggleFollowTeam}
                            />
                        </View>
                    ))}
            </ScrollView>
            <StepBottomBar
                step={step}
                onBack={onBack}
                onNext={onNext}
                isLast={false}
            />
        </View>
    );
}

const headerStyles = StyleSheet.create({
    container: {
        backgroundColor: "#FFFFFF",
    },
    stepHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    tabBar: {
        flexDirection: "row",
        gap: 8,
        paddingHorizontal: 20,
        paddingVertical: 12,
        alignItems: "center",
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    tabActive: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        alignItems: "center",
    },
    tabLine: {
        width: "100%",
        height: 2,
        backgroundColor: "#1A1A1A",
        marginTop: 4,
    },
    scrollArea: { flex: 1 },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 24,
    },
    listItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#F6F7F8",
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    listItemLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
    },
});
