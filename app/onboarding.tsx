import React, { useState } from "react";
import {
    View,
    ScrollView,
    Pressable,
    StyleSheet,
    ActivityIndicator,
    Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowRight, Search, Bell } from "lucide-react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BrandLogo } from "@/components/brand-logo";
import { Text as GluestackText } from "@/components/ui/text";
import { useUser } from "@/contexts/user-context";
import { setOnboardingCompleted } from "@/lib/onboarding-storage";
import { listClubs } from "@/lib/api/clubs";
import { listTeams } from "@/lib/api/teams";
import { listPlayers } from "@/lib/api/players";
import type { ApiPlayer } from "@/lib/api/players";
import type { ApiTeam } from "@/lib/api/teams";
import type { ApiClub } from "@/lib/api/clubs";

const TOTAL_STEPS = 4;

function formatPlayerDisplayName(player: ApiPlayer): string {
    if (player.firstName && player.lastName) {
        const lastParts = player.lastName.trim().split(/\s+/).filter(Boolean);
        const last = lastParts[lastParts.length - 1] ?? player.lastName;
        return `${player.firstName} ${last}`;
    }
    const parts = (player.name ?? "").trim().split(/\s+/).filter(Boolean);
    if (parts.length <= 2) return player.name ?? "";
    return `${parts[0]} ${parts[parts.length - 1]}`;
}

function playersByPosition(
    players: ApiPlayer[]
): [string, ApiPlayer[]][] {
    const byPos = new Map<string, ApiPlayer[]>();
    for (const p of players) {
        const key = p.position || "Other";
        if (!byPos.has(key)) byPos.set(key, []);
        byPos.get(key)!.push(p);
    }
    return Array.from(byPos.entries());
}

/**
 * Format team display as "Clube - Escalão".
 * - If team.name contains " - ": use as is (already full format)
 * - Else if team has clubId + escalao: use club.name + " - " + escalao
 * - Else if team has clubId: use club.name + " - " + team.name (name = escalão)
 * - Else: use team.name
 */
function formatTeamDisplayName(
    team: ApiTeam,
    clubs: ApiClub[]
): string {
    const clubMap = new Map(clubs.map((c) => [c.id, c]));
    if (team.name.includes(" - ")) {
        return team.name;
    }
    if (team.clubId) {
        const club = clubMap.get(team.clubId);
        const clubName = club?.name ?? club?.shortName ?? "";
        const escalao = team.escalao ?? team.name;
        if (clubName) return `${clubName} - ${escalao}`;
    }
    return team.name ?? team.acronym ?? "";
}

/** Group players by team for "From your teams" tab */
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
            const name = team
                ? formatTeamDisplayName(team, clubs)
                : teamId;
            result.push([teamId, name, list]);
        }
    }
    const other = byTeam.get("other") ?? [];
    if (other.length > 0) {
        result.push(["other", "Other", other]);
    }
    return result;
}

function PlayerAvatar({
    avatarUrl,
    style,
}: {
    avatarUrl?: string | null;
    style?: object;
}) {
    if (avatarUrl) {
        return (
            <Image
                source={{ uri: avatarUrl }}
                style={[styles.avatar, style]}
                resizeMode="cover"
            />
        );
    }
    return <View style={[styles.avatar, style]} />;
}

function TeamAvatar({
    logoUrl,
    style,
}: {
    logoUrl?: string | null;
    style?: object;
}) {
    if (logoUrl) {
        return (
            <Image
                source={{ uri: logoUrl }}
                style={[styles.avatar, style]}
                resizeMode="cover"
            />
        );
    }
    return <View style={[styles.avatar, style]} />;
}

function FollowButton({
    id,
    following,
    onToggle,
}: {
    id: string;
    following: boolean;
    onToggle: (id: string) => void;
}) {
    return (
        <Pressable
            onPress={() => onToggle(id)}
            style={[
                styles.followBtn,
                following ? styles.followBtnActive : styles.followBtnOutline,
            ]}
        >
            <GluestackText
                className={following ? "font-lato text-white font-semibold text-[13px]" : "font-lato text-typography-900 font-semibold text-[13px]"}
            >
                {following ? "Following" : "Follow"}
            </GluestackText>
            {following && <Bell size={14} color="#FFFFFF" />}
        </Pressable>
    );
}

function StepBottomBar({
    step,
    onBack,
    onNext,
    isLast,
}: {
    step: number;
    onBack: () => void;
    onNext: () => void;
    isLast: boolean;
}) {
    const progress = step / 3;
    return (
        <View style={styles.bottomBar}>
            <Pressable onPress={onBack} hitSlop={12}>
                <GluestackText className="font-lato text-[15px] font-medium text-typography-600">
                    Back
                </GluestackText>
            </Pressable>
            <View style={styles.progressTrack}>
                <View
                    style={[
                        styles.progressFill,
                        { width: `${progress * 100}%` },
                    ]}
                />
            </View>
            <Pressable
                onPress={onNext}
                style={styles.nextBtn}
            >
                <GluestackText className="font-lato text-white font-semibold text-base">
                    {isLast ? "Finish" : "Next"}
                </GluestackText>
            </Pressable>
        </View>
    );
}

export default function OnboardingScreen({
    onComplete,
}: {
    onComplete?: () => void;
}) {
    const { user } = useUser();
    const [step, setStep] = useState(0);
    const [isCompleting, setIsCompleting] = useState(false);
    const [followedClubs, setFollowedClubs] = useState<Set<string>>(new Set());
    const [followedTeams, setFollowedTeams] = useState<Set<string>>(new Set());
    const [followedPlayers, setFollowedPlayers] = useState<Set<string>>(new Set());
    const [teamsTab, setTeamsTab] = useState<"from-clubs" | "other">("from-clubs");
    const [playersTab, setPlayersTab] = useState<"from-teams" | "other">("from-teams");

    const clubsQuery = useQuery({
        queryKey: ["clubs"],
        queryFn: () => listClubs({ limit: 50 }),
        enabled: step >= 1,
    });

    const teamsQuery = useQuery({
        queryKey: ["teams"],
        queryFn: () => listTeams({ limit: 50 }),
        enabled: step >= 2,
    });

    const queryClient = useQueryClient();
    const followedTeamIds = Array.from(followedTeams);
    const followedTeamIdsKey = [...followedTeamIds].sort().join(",");

    const playersFromTeamsQuery = useQuery({
        queryKey: ["players", "from-teams", followedTeamIdsKey],
        queryFn: async () => {
            if (followedTeamIds.length === 0) return [];
            if (followedTeamIds.length === 1) {
                const list = await listPlayers({
                    teamIds: followedTeamIds,
                    limit: 50,
                });
                return list.map((p) => ({ ...p, teamId: followedTeamIds[0] }));
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
        enabled: step >= 3 && followedTeamIds.length > 0,
    });

    const playersOtherQuery = useQuery({
        queryKey: ["players", "other", followedTeamIdsKey],
        queryFn: () =>
            listPlayers({
                excludeTeamIds: followedTeamIds,
                limit: 50,
            }),
        enabled: step >= 3,
    });

    const clubs = clubsQuery.data ?? [];
    const teams = teamsQuery.data ?? [];
    const playersFromTeams = playersFromTeamsQuery.data ?? [];
    const playersOther = playersOtherQuery.data ?? [];

    const teamsFromClubs = teams.filter(
        (t) => t.clubId && followedClubs.has(t.clubId)
    );
    const teamsOther = teams.filter(
        (t) => !t.clubId || !followedClubs.has(t.clubId)
    );

    const toggleFollow = (
        setter: React.Dispatch<React.SetStateAction<Set<string>>>,
        id: string
    ) => {
        setter((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleNext = async () => {
        if (step < TOTAL_STEPS - 1) {
            setStep((s) => s + 1);
        } else {
            if (!user) return;
            setIsCompleting(true);
            await setOnboardingCompleted(user.id);
            onComplete?.();
        }
    };

    const handleBack = () => {
        if (step > 0) {
            if (step === 3) {
                queryClient.removeQueries({ queryKey: ["players"] });
            }
            setStep((s) => s - 1);
        }
    };

    const router = useRouter();

    // Step 0: Welcome
    if (step === 0) {
        return (
            <SafeAreaView className="flex-1 bg-background-0" edges={["top", "bottom"]}>
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
                        <Pressable
                            onPress={handleNext}
                            disabled={isCompleting}
                            style={styles.quickSetupBtn}
                        >
                            <GluestackText className="font-lato text-white font-semibold text-[17px]">
                                Quick Setup
                            </GluestackText>
                            <ArrowRight size={20} color="#FFFFFF" />
                        </Pressable>
                        <Pressable
                            onPress={() => router.replace("/(account)/signin")}
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

    // Step 1: Follow clubs
    if (step === 1) {
        return (
            <SafeAreaView className="flex-1 bg-background-0" edges={["top", "bottom"]}>
                <View style={styles.stepHeader}>
                    <GluestackText className="font-lato text-2xl font-bold text-typography-900">
                        Follow clubs
                    </GluestackText>
                    <Pressable hitSlop={12}>
                        <Search size={22} color="#1A1A1A" />
                    </Pressable>
                </View>
                <ScrollView
                    style={styles.scrollArea}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <GluestackText className="font-lato text-[11px] font-semibold text-typography-500 mb-3">
                        Suggested
                    </GluestackText>
                    {clubsQuery.isLoading && (
                        <View className="py-8 items-center">
                            <ActivityIndicator />
                        </View>
                    )}
                    {!clubsQuery.isLoading && clubs.length === 0 && (
                        <GluestackText className="font-lato text-typography-500 py-4">
                            No clubs found
                        </GluestackText>
                    )}
                    {!clubsQuery.isLoading &&
                        clubs.map((club) => (
                            <View key={club.id} style={styles.listItem}>
                                <View style={styles.listItemLeft}>
                                    <TeamAvatar logoUrl={club.logo} />
                                    <GluestackText className="font-lato text-[15px] font-semibold text-typography-900">
                                        {club.name}
                                    </GluestackText>
                                </View>
                                <FollowButton
                                    id={club.id}
                                    following={followedClubs.has(club.id)}
                                    onToggle={(id) =>
                                        toggleFollow(setFollowedClubs, id)
                                    }
                                />
                            </View>
                        ))}
                </ScrollView>
                <StepBottomBar
                    step={1}
                    onBack={handleBack}
                    onNext={handleNext}
                    isLast={false}
                />
            </SafeAreaView>
        );
    }

    // Step 2: Follow teams
    if (step === 2) {
        return (
            <SafeAreaView className="flex-1 bg-background-0" edges={["top", "bottom"]}>
                <View style={styles.stepHeader}>
                    <GluestackText className="font-lato text-2xl font-bold text-typography-900">
                        Follow teams
                    </GluestackText>
                    <Pressable hitSlop={12}>
                        <Search size={22} color="#1A1A1A" />
                    </Pressable>
                </View>
                <View style={styles.tabBar}>
                    <Pressable
                        onPress={() => setTeamsTab("from-clubs")}
                        style={
                            teamsTab === "from-clubs"
                                ? styles.tabActive
                                : styles.tab
                        }
                    >
                        <GluestackText
                            className={
                                teamsTab === "from-clubs"
                                    ? "font-lato text-sm font-semibold text-typography-900"
                                    : "font-lato text-sm font-medium text-typography-500"
                            }
                        >
                            From your clubs
                        </GluestackText>
                        {teamsTab === "from-clubs" && (
                            <View style={styles.tabLine} />
                        )}
                    </Pressable>
                    <Pressable
                        onPress={() => setTeamsTab("other")}
                        style={
                            teamsTab === "other" ? styles.tabActive : styles.tab
                        }
                    >
                        <GluestackText
                            className={
                                teamsTab === "other"
                                    ? "font-lato text-sm font-semibold text-typography-900"
                                    : "font-lato text-sm font-medium text-typography-500"
                            }
                        >
                            Other teams
                        </GluestackText>
                        {teamsTab === "other" && (
                            <View style={styles.tabLine} />
                        )}
                    </Pressable>
                </View>
                <ScrollView
                    style={styles.scrollArea}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {teamsQuery.isLoading && (
                        <View className="py-8 items-center">
                            <ActivityIndicator />
                        </View>
                    )}
                    {!teamsQuery.isLoading &&
                        (teamsTab === "from-clubs"
                            ? teamsFromClubs
                            : teamsOther
                        ).length === 0 && (
                            <GluestackText className="font-lato text-typography-500 py-4">
                                {teamsTab === "from-clubs"
                                    ? "Follow clubs first to see their teams"
                                    : "No other teams found"}
                            </GluestackText>
                        )}
                    {!teamsQuery.isLoading &&
                        (teamsTab === "from-clubs"
                            ? teamsFromClubs
                            : teamsOther
                        ).map((team) => (
                            <View key={team.id} style={styles.listItem}>
                                <View style={styles.listItemLeft}>
                                    <TeamAvatar logoUrl={team.logo} />
                                    <View>
                                        <GluestackText className="font-lato text-[15px] font-semibold text-typography-900">
                                            {team.name}
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
                                    onToggle={(id) =>
                                        toggleFollow(setFollowedTeams, id)
                                    }
                                />
                            </View>
                        ))}
                </ScrollView>
                <StepBottomBar
                    step={2}
                    onBack={handleBack}
                    onNext={handleNext}
                    isLast={false}
                />
            </SafeAreaView>
        );
    }

    // Step 3: Follow players
    return (
        <SafeAreaView className="flex-1 bg-background-0" edges={["top", "bottom"]}>
            <View style={styles.stepHeader}>
<GluestackText className="font-lato text-2xl font-bold text-typography-900">
                        Follow players
                    </GluestackText>
                <Pressable hitSlop={12}>
                    <Search size={22} color="#1A1A1A" />
                </Pressable>
            </View>
            <View style={styles.tabBar}>
                <Pressable
                    onPress={() => setPlayersTab("from-teams")}
                    style={
                        playersTab === "from-teams"
                            ? styles.tabActive
                            : styles.tab
                    }
                >
                    <GluestackText
                        className={
                            playersTab === "from-teams"
                                ? "font-lato text-sm font-semibold text-typography-900"
                                : "font-lato text-sm font-medium text-typography-500"
                        }
                    >
                        From your teams
                    </GluestackText>
                    {playersTab === "from-teams" && (
                        <View style={styles.tabLine} />
                    )}
                </Pressable>
                <Pressable
                    onPress={() => setPlayersTab("other")}
                    style={
                        playersTab === "other" ? styles.tabActive : styles.tab
                    }
                >
                    <GluestackText
                        className={
                            playersTab === "other"
                                ? "font-lato text-sm font-semibold text-typography-900"
                                : "font-lato text-sm font-medium text-typography-500"
                        }
                    >
                        Other players
                    </GluestackText>
                    {playersTab === "other" && (
                        <View style={styles.tabLine} />
                    )}
                </Pressable>
            </View>
            <ScrollView
                style={styles.scrollArea}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {(playersTab === "from-teams"
                    ? playersFromTeamsQuery
                    : playersOtherQuery
                ).isLoading && (
                    <View className="py-8 items-center">
                        <ActivityIndicator />
                    </View>
                )}
                {!(playersTab === "from-teams"
                    ? playersFromTeamsQuery
                    : playersOtherQuery
                ).isLoading &&
                    (playersTab === "from-teams"
                        ? playersFromTeams
                        : playersOther
                    ).length === 0 && (
<GluestackText className="font-lato text-typography-500 py-4">
                        {playersTab === "from-teams"
                            ? "Follow teams first to see their players"
                            : "No other players found"}
                    </GluestackText>
                    )}
                {!(playersTab === "from-teams"
                    ? playersFromTeamsQuery
                    : playersOtherQuery
                ).isLoading &&
                    (playersTab === "from-teams" && followedTeamIds.length > 0
                        ? playersByTeam(
                              playersFromTeams,
                              followedTeamIds,
                              teams,
                              clubs
                          ).map(([teamId, teamName, list], idx) => (
                              <React.Fragment key={teamId}>
                                  <GluestackText
                                      className={`font-lato text-[11px] font-semibold text-typography-500 mb-3 ${idx === 0 ? "mt-0" : "mt-5"}`}
                                  >
                                      {teamName}
                                  </GluestackText>
                                  {list.map((player) => (
                                      <View
                                          key={player.id}
                                          style={styles.listItem}
                                      >
                                          <View
                                              style={[
                                                  styles.listItemLeft,
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
                                                  {formatPlayerDisplayName(
                                                      player
                                                  )}
                                              </GluestackText>
                                          </View>
                                          <FollowButton
                                              id={player.id}
                                              following={followedPlayers.has(
                                                  player.id
                                              )}
                                              onToggle={(id) =>
                                                  toggleFollow(
                                                      setFollowedPlayers,
                                                      id
                                                  )
                                              }
                                          />
                                      </View>
                                  ))}
                              </React.Fragment>
                          ))
                        : playersByPosition(
                              playersTab === "from-teams"
                                  ? playersFromTeams
                                  : playersOther
                          ).map(([position, list]) => (
                              <React.Fragment key={position || "other"}>
                                  {position && (
                                      <GluestackText className="font-lato text-[11px] font-semibold text-typography-500 mb-3 mt-2">
                                          {position}
                                      </GluestackText>
                                  )}
                                  {list.map((player) => (
                                      <View
                                          key={player.id}
                                          style={styles.listItem}
                                      >
                                          <View
                                              style={[
                                                  styles.listItemLeft,
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
                                                  {formatPlayerDisplayName(
                                                      player
                                                  )}
                                              </GluestackText>
                                          </View>
                                          <FollowButton
                                              id={player.id}
                                              following={followedPlayers.has(
                                                  player.id
                                              )}
                                              onToggle={(id) =>
                                                  toggleFollow(
                                                      setFollowedPlayers,
                                                      id
                                                  )
                                              }
                                          />
                                      </View>
                                  ))}
                              </React.Fragment>
                          ))
                    )}
            </ScrollView>
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
    scrollArea: {
        flex: 1,
    },
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
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#E5E7EB",
        overflow: "hidden",
    },
    followBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    followBtnOutline: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#1A1A1A",
    },
    followBtnActive: {
        backgroundColor: "#1A1A1A",
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
