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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listClubs } from "@/lib/api/clubs";
import { listTeams } from "@/lib/api/teams";
import { listPlayers } from "@/lib/api/players";
import type { ApiPlayer } from "@/lib/api/players";
import type { ApiTeam } from "@/lib/api/teams";
import type { ApiClub } from "@/lib/api/clubs";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { OnboardingStackParamList } from "./onboarding-navigator";
import {
    PlayerAvatar,
    FollowButton,
    StepBottomBar,
    formatPlayerDisplayName,
    playersByTeam,
    playersByPosition,
} from "./players-tab-content";

type PlayersTabParamList = {
    "from-teams": undefined;
    other: undefined;
};

const TabStack = createNativeStackNavigator<PlayersTabParamList>();

function PlayersHeaderWithTabs({
    onOpenSearch,
}: {
    onOpenSearch: () => void;
}) {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const currentRoute = useNavigationState(
        (state) =>
            state?.routes?.[state?.index ?? 0]?.name ?? "from-teams"
    ) as "from-teams" | "other";
    const isFromTeams = currentRoute === "from-teams";

    const goToFromTeams = () => {
        if (!isFromTeams) navigation.goBack();
    };
    const goToOther = () => {
        if (isFromTeams) (navigation as any).navigate("other");
    };

    return (
        <View style={[headerStyles.container, { paddingTop: insets.top }]}>
            <View style={headerStyles.stepHeader}>
                <GluestackText className="font-lato text-2xl font-bold text-typography-900">
                    Follow players
                </GluestackText>
                <Pressable hitSlop={12} onPress={onOpenSearch}>
                    <Search size={22} color="#1A1A1A" />
                </Pressable>
            </View>
            <View style={headerStyles.tabBar}>
                <Pressable
                    onPress={goToFromTeams}
                    style={
                        isFromTeams ? headerStyles.tabActive : headerStyles.tab
                    }
                >
                    <GluestackText
                        className={
                            isFromTeams
                                ? "font-lato text-sm font-semibold text-typography-900"
                                : "font-lato text-sm font-medium text-typography-500"
                        }
                    >
                        From your teams
                    </GluestackText>
                    {isFromTeams && <View style={headerStyles.tabLine} />}
                </Pressable>
                <Pressable
                    onPress={goToOther}
                    style={
                        !isFromTeams ? headerStyles.tabActive : headerStyles.tab
                    }
                >
                    <GluestackText
                        className={
                            !isFromTeams
                                ? "font-lato text-sm font-semibold text-typography-900"
                                : "font-lato text-sm font-medium text-typography-500"
                        }
                    >
                        Other players
                    </GluestackText>
                    {!isFromTeams && <View style={headerStyles.tabLine} />}
                </Pressable>
            </View>
        </View>
    );
}

export function PlayersTabNavigator({
    onComplete,
}: {
    onComplete?: () => void;
}) {
    const parentNav =
        useNavigation<NativeStackNavigationProp<OnboardingStackParamList>>();
    const queryClient = useQueryClient();
    const {
        followedTeams,
        followedPlayers,
        toggleFollowPlayer,
    } = useOnboarding();

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
        parentNav.replace("teams");
    };
    const handleNext = () => onComplete?.();
    const openSearch = () =>
        parentNav.push("search", { segment: "players" });

    return (
        <TabStack.Navigator
            screenOptions={{
                headerShown: true,
                header: () => (
                    <PlayersHeaderWithTabs onOpenSearch={openSearch} />
                ),
                headerStatusBarHeight: 0,
                animation: "slide_from_right",
                contentStyle: { backgroundColor: "#FFFFFF" },
            }}
        >
            <TabStack.Screen name="from-teams">
                {() => (
                    <PlayersTabContent
                        players={playersFromTeams}
                        teams={teams}
                        clubs={clubs}
                        followedTeamIds={followedTeamIds}
                        followedPlayers={followedPlayers}
                        toggleFollowPlayer={toggleFollowPlayer}
                        isLoading={playersFromTeamsQuery.isLoading}
                        emptyMessage="Follow teams first to see their players"
                        onBack={handleBack}
                        onNext={handleNext}
                    />
                )}
            </TabStack.Screen>
            <TabStack.Screen name="other">
                {() => (
                    <PlayersTabContent
                        players={playersOther}
                        teams={teams}
                        clubs={clubs}
                        followedTeamIds={followedTeamIds}
                        followedPlayers={followedPlayers}
                        toggleFollowPlayer={toggleFollowPlayer}
                        isLoading={playersOtherQuery.isLoading}
                        emptyMessage="No other players found"
                        onBack={handleBack}
                        onNext={handleNext}
                    />
                )}
            </TabStack.Screen>
        </TabStack.Navigator>
    );
}

function PlayersTabContent({
    players,
    teams,
    clubs,
    followedTeamIds,
    followedPlayers,
    toggleFollowPlayer,
    isLoading,
    emptyMessage,
    onBack,
    onNext,
}: {
    players: ApiPlayer[];
    teams: ApiTeam[];
    clubs: ApiClub[];
    followedTeamIds: string[];
    followedPlayers: Set<string>;
    toggleFollowPlayer: (id: string) => void;
    isLoading: boolean;
    emptyMessage: string;
    onBack: () => void;
    onNext: () => void;
}) {
    const content =
        followedTeamIds.length > 0
            ? playersByTeam(players, followedTeamIds, teams, clubs).map(
                  ([teamId, teamName, list], idx) => (
                      <React.Fragment key={teamId}>
                          <GluestackText
                              className={`font-lato text-[11px] font-semibold text-typography-500 mb-3 ${idx === 0 ? "mt-0" : "mt-5"}`}
                          >
                              {teamName}
                          </GluestackText>
                          {list.map((player) => (
                              <View key={player.id} style={headerStyles.listItem}>
                                  <View
                                      style={[
                                          headerStyles.listItemLeft,
                                          { flex: 1, minWidth: 0 },
                                      ]}
                                  >
                                      <PlayerAvatar
                                          avatarUrl={player.avatarUrl}
                                      />
                                      <GluestackText
                                          className="font-lato text-[15px] font-semibold text-typography-900"
                                          numberOfLines={1}
                                          ellipsizeMode="tail"
                                      >
                                          {formatPlayerDisplayName(player)}
                                      </GluestackText>
                                  </View>
                                  <FollowButton
                                      id={player.id}
                                      following={followedPlayers.has(
                                          player.id
                                      )}
                                      onToggle={toggleFollowPlayer}
                                  />
                              </View>
                          ))}
                      </React.Fragment>
                  )
              )
            : playersByPosition(players).map(([position, list]) => (
                  <React.Fragment key={position || "other"}>
                      {position && (
                          <GluestackText className="font-lato text-[11px] font-semibold text-typography-500 mb-3 mt-2">
                              {position}
                          </GluestackText>
                      )}
                      {list.map((player) => (
                          <View key={player.id} style={headerStyles.listItem}>
                              <View
                                  style={[
                                      headerStyles.listItemLeft,
                                      { flex: 1, minWidth: 0 },
                                  ]}
                              >
                                  <PlayerAvatar
                                      avatarUrl={player.avatarUrl}
                                  />
                                  <GluestackText
                                      className="font-lato text-[15px] font-semibold text-typography-900"
                                      numberOfLines={1}
                                      ellipsizeMode="tail"
                                  >
                                      {formatPlayerDisplayName(player)}
                                  </GluestackText>
                              </View>
                              <FollowButton
                                  id={player.id}
                                  following={followedPlayers.has(player.id)}
                                  onToggle={toggleFollowPlayer}
                              />
                          </View>
                      ))}
                  </React.Fragment>
              ));

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
                {!isLoading && players.length === 0 && (
                    <GluestackText className="font-lato text-typography-500 py-4">
                        {emptyMessage}
                    </GluestackText>
                )}
                {!isLoading && content}
            </ScrollView>
            <StepBottomBar
                step={3}
                onBack={onBack}
                onNext={onNext}
                isLast={true}
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
