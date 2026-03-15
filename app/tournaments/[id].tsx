import React, { useState } from "react";
import {
    View,
    Text,
    ScrollView,
    Pressable,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text as GluestackText } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import {
    useTournament,
    useTournamentMatches,
    useTournamentStandings,
    useTournamentTeams,
    useGenerateFixtures,
} from "@/lib/hooks/use-tournaments";
import { useUser } from "@/contexts/user-context";

type TabId = "matches" | "standings" | "teams";

const TABS: { id: TabId; label: string }[] = [
    { id: "matches", label: "Matches" },
    { id: "standings", label: "Standings" },
    { id: "teams", label: "Teams" },
];

function formatMatchTime(startTime: string | null): string {
    if (!startTime) return "—";
    try {
        const d = new Date(startTime);
        return d.toLocaleTimeString("pt-PT", {
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return "—";
    }
}

export default function TournamentDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { user } = useUser();
    const [tab, setTab] = useState<TabId>("matches");

    const tournamentQuery = useTournament(id);
    const generateFixturesMutation = useGenerateFixtures(id);
    const matchesQuery = useTournamentMatches(id);
    const standingsQuery = useTournamentStandings(id);
    const teamsQuery = useTournamentTeams(id);

    const isLoading =
        tournamentQuery.isLoading ||
        (tab === "matches" && matchesQuery.isLoading) ||
        (tab === "standings" && standingsQuery.isLoading) ||
        (tab === "teams" && teamsQuery.isLoading);
    const isError =
        tournamentQuery.isError ||
        (tab === "matches" && matchesQuery.isError) ||
        (tab === "standings" && standingsQuery.isError) ||
        (tab === "teams" && teamsQuery.isError);

    const refetch = () => {
        tournamentQuery.refetch();
        matchesQuery.refetch();
        standingsQuery.refetch();
        teamsQuery.refetch();
    };

    const tournament = tournamentQuery.data;
    const matches = matchesQuery.data ?? [];
    const standings = standingsQuery.data ?? [];
    const teams = teamsQuery.data ?? [];
    const isOwner =
        Boolean(user?.id && tournament?.ownerUserId === user.id);

    return (
        <View className="flex-1 bg-background-0">
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 24 }}
                contentInsetAdjustmentBehavior="automatic"
                refreshControl={
                    <RefreshControl
                        refreshing={tournamentQuery.isFetching}
                        onRefresh={refetch}
                    />
                }
            >
                <View className="px-6 pt-4 pb-4">
                    <GluestackText className="text-[24px] font-bold text-typography-900 mb-1">
                        {tournament?.name ?? "—"}
                    </GluestackText>
                    <GluestackText className="text-[14px] text-typography-500">
                        {tournament?.location ?? "—"} ·{" "}
                        {tournament?.formatType ?? "—"}
                    </GluestackText>
                </View>

                {isOwner && (
                    <View className="px-6 mb-4 flex-row gap-3">
                        <Button
                            size="sm"
                            variant="outline"
                            action="secondary"
                            onPress={() =>
                                router.push(
                                    `/tournaments/add-teams?tournamentId=${id}`,
                                )
                            }
                            className="flex-1 rounded-lg"
                        >
                            <ButtonText>Add teams</ButtonText>
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            action="secondary"
                            onPress={() => generateFixturesMutation.mutate()}
                            disabled={generateFixturesMutation.isPending}
                            className="flex-1 rounded-lg"
                        >
                            {generateFixturesMutation.isPending ? (
                                <ActivityIndicator size="small" />
                            ) : (
                                <ButtonText>Generate fixtures</ButtonText>
                            )}
                        </Button>
                    </View>
                )}

                <View className="px-6 mb-4">
                    <View className="flex-row rounded-[22px] bg-secondary-100 p-1 gap-1">
                        {TABS.map((t) => (
                            <Pressable
                                key={t.id}
                                onPress={() => setTab(t.id)}
                                className={`flex-1 py-2 px-4 rounded-[18px] items-center justify-center ${
                                    tab === t.id
                                        ? "bg-typography-900"
                                        : "bg-transparent"
                                }`}
                            >
                                <Text
                                    className={`text-[14px] font-semibold ${
                                        tab === t.id
                                            ? "text-typography-0"
                                            : "text-typography-600"
                                    }`}
                                >
                                    {t.label}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </View>

                {isError && (
                    <View className="mx-6 rounded-2xl bg-secondary-100 p-4 items-center justify-center min-h-[120]">
                        <GluestackText className="text-typography-500 text-center">
                            Failed to load data
                        </GluestackText>
                        <Text
                            className="text-[14px] font-semibold text-primary-500 mt-2"
                            onPress={() => refetch()}
                        >
                            Retry
                        </Text>
                    </View>
                )}

                {!isError && isLoading && (
                    <View className="px-6 py-8 items-center">
                        <ActivityIndicator size="large" />
                    </View>
                )}

                {!isError && !isLoading && tab === "matches" && (
                    <View className="px-6 gap-3">
                        {matches.length === 0 ? (
                            <View className="rounded-2xl bg-secondary-100 p-6 items-center">
                                <GluestackText className="text-typography-500 text-center">
                                    No matches yet
                                </GluestackText>
                            </View>
                        ) : (
                            matches.map(
                                (
                                    m: {
                                        id: string;
                                        homeTeamName?: string | null;
                                        awayTeamName?: string | null;
                                        homeTeamAcronym?: string | null;
                                        awayTeamAcronym?: string | null;
                                        status: string;
                                        startTime: string | null;
                                        minute: number | null;
                                        scoreHome: number | null;
                                        scoreAway: number | null;
                                    },
                                ) => (
                                    <View
                                        key={m.id}
                                        className="rounded-2xl bg-secondary-100 p-4 flex-row items-center justify-between"
                                    >
                                        <View className="flex-1">
                                            <Text className="text-[12px] text-typography-500">
                                                {formatMatchTime(m.startTime)}
                                            </Text>
                                            <Text className="text-[11px] font-bold text-error-500 mt-0.5">
                                                {m.status === "LIVE"
                                                    ? `LIVE ${m.minute ?? 0}'`
                                                    : m.status}
                                            </Text>
                                        </View>
                                        <View className="flex-row items-center gap-2 flex-1 justify-center">
                                            <Text
                                                className="text-[14px] font-semibold text-typography-900"
                                                numberOfLines={1}
                                            >
                                                {m.homeTeamAcronym ??
                                                    m.homeTeamName ??
                                                    "—"}
                                            </Text>
                                            <View className="flex-row items-baseline gap-1 min-w-[48] justify-center">
                                                <Text className="text-[16px] font-bold text-typography-900">
                                                    {m.scoreHome ?? 0}
                                                </Text>
                                                <Text className="text-typography-500">-</Text>
                                                <Text className="text-[16px] font-bold text-typography-900">
                                                    {m.scoreAway ?? 0}
                                                </Text>
                                            </View>
                                            <Text
                                                className="text-[14px] font-semibold text-typography-900"
                                                numberOfLines={1}
                                            >
                                                {m.awayTeamAcronym ??
                                                    m.awayTeamName ??
                                                    "—"}
                                            </Text>
                                        </View>
                                    </View>
                                ),
                            )
                        )}
                    </View>
                )}

                {!isError && !isLoading && tab === "standings" && (
                    <View className="px-6 gap-3">
                        {standings.length === 0 ? (
                            <View className="rounded-2xl bg-secondary-100 p-6 items-center">
                                <GluestackText className="text-typography-500 text-center">
                                    No standings yet
                                </GluestackText>
                            </View>
                        ) : (
                            <>
                                <View className="flex-row px-4 py-2 mb-1">
                                    <Text className="text-[11px] font-bold text-typography-500 w-6">#</Text>
                                    <Text className="flex-1 text-[11px] font-bold text-typography-500 ml-2">Team</Text>
                                    <Text className="text-[11px] font-bold text-typography-500 w-6 text-center">P</Text>
                                    <Text className="text-[11px] font-bold text-typography-500 w-6 text-center">W</Text>
                                    <Text className="text-[11px] font-bold text-typography-500 w-6 text-center">D</Text>
                                    <Text className="text-[11px] font-bold text-typography-500 w-6 text-center">L</Text>
                                    <Text className="text-[11px] font-bold text-typography-500 w-8 text-center">GD</Text>
                                    <Text className="text-[11px] font-bold text-typography-500 w-8 text-center">Pts</Text>
                                </View>
                                {standings.map(
                                (
                                    s: {
                                        id: string;
                                        teamName?: string | null;
                                        teamAcronym?: string | null;
                                        played: number;
                                        wins: number;
                                        draws: number;
                                        losses: number;
                                        gf: number;
                                        ga: number;
                                        gd: number;
                                        points: number;
                                    },
                                    idx: number,
                                ) => (
                                    <View
                                        key={s.id}
                                        className="rounded-2xl bg-secondary-100 p-4 flex-row items-center justify-between"
                                    >
                                        <Text className="text-[14px] font-bold text-typography-900 w-6">
                                            {idx + 1}
                                        </Text>
                                        <Text
                                            className="flex-1 text-[14px] font-semibold text-typography-900 ml-2"
                                            numberOfLines={1}
                                        >
                                            {s.teamAcronym ??
                                                s.teamName ??
                                                "—"}
                                        </Text>
                                        <View className="flex-row gap-3">
                                            <Text className="text-[12px] text-typography-600 w-6 text-center">
                                                {s.played}
                                            </Text>
                                            <Text className="text-[12px] text-typography-600 w-6 text-center">
                                                {s.wins}
                                            </Text>
                                            <Text className="text-[12px] text-typography-600 w-6 text-center">
                                                {s.draws}
                                            </Text>
                                            <Text className="text-[12px] text-typography-600 w-6 text-center">
                                                {s.losses}
                                            </Text>
                                            <Text className="text-[12px] text-typography-600 w-8 text-center">
                                                {s.gd >= 0 ? `+${s.gd}` : s.gd}
                                            </Text>
                                            <Text className="text-[14px] font-bold text-typography-900 w-8 text-center">
                                                {s.points}
                                            </Text>
                                        </View>
                                    </View>
                                ),
                            )}
                            </>
                        )}
                    </View>
                )}

                {!isError && !isLoading && tab === "teams" && (
                    <View className="px-6 gap-3">
                        {teams.length === 0 ? (
                            <View className="rounded-2xl bg-secondary-100 p-6 items-center">
                                <GluestackText className="text-typography-500 text-center">
                                    No teams yet
                                </GluestackText>
                            </View>
                        ) : (
                            teams.map(
                                (
                                    t: {
                                        id: string;
                                        name: string;
                                        acronym?: string | null;
                                        groupLabel?: string | null;
                                    },
                                    idx: number,
                                ) => (
                                    <View
                                        key={t.id}
                                        className="rounded-2xl bg-secondary-100 p-4 flex-row items-center"
                                    >
                                        <Text className="text-[14px] font-bold text-typography-900 w-6">
                                            {idx + 1}
                                        </Text>
                                        <View className="flex-1 ml-2">
                                            <GluestackText className="text-[15px] font-semibold text-typography-900">
                                                {t.name}
                                            </GluestackText>
                                            {(t.acronym || t.groupLabel) && (
                                                <Text className="text-[12px] text-typography-500 mt-0.5">
                                                    {[t.acronym, t.groupLabel]
                                                        .filter(Boolean)
                                                        .join(" · ")}
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                ),
                            )
                        )}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
