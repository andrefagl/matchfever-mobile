import React, { useState, useEffect, useRef } from "react";
import {
    View,
    ScrollView,
    Pressable,
    TextInput,
    StyleSheet,
    ActivityIndicator,
    Image,
    Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Search, Bell } from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import { Text as GluestackText } from "@/components/ui/text";
import { listClubs } from "@/lib/api/clubs";
import { listTeams } from "@/lib/api/teams";
import { listPlayers } from "@/lib/api/players";
import type { ApiPlayer } from "@/lib/api/players";
import type { ApiTeam } from "@/lib/api/teams";
import type { ApiClub } from "@/lib/api/clubs";

export type OnboardingSearchSegment = "clubs" | "teams" | "players";

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

function PlayerAvatar({ avatarUrl }: { avatarUrl?: string | null }) {
    if (avatarUrl) {
        return (
            <Image
                source={{ uri: avatarUrl }}
                style={styles.avatar}
                resizeMode="cover"
            />
        );
    }
    return <View style={styles.avatar} />;
}

function TeamAvatar({ logoUrl }: { logoUrl?: string | null }) {
    if (logoUrl) {
        return (
            <Image
                source={{ uri: logoUrl }}
                style={styles.avatar}
                resizeMode="cover"
            />
        );
    }
    return <View style={styles.avatar} />;
}

export interface OnboardingSearchViewProps {
    segment: OnboardingSearchSegment;
    followedIds: Set<string>;
    onToggleFollow: (id: string) => void;
    onBack: () => void;
    clubs?: ApiClub[];
}

export function OnboardingSearchView({
    segment,
    followedIds,
    onToggleFollow,
    onBack,
    clubs = [],
}: OnboardingSearchViewProps) {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setDebouncedSearch(search);
        }, 350);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [search]);

    const handleSearchChange = (text: string) => setSearch(text);

    const searchPlaceholder =
        segment === "clubs"
            ? "Search clubs..."
            : segment === "teams"
              ? "Search teams..."
              : "Search players...";

    const clubsQuery = useQuery({
        queryKey: ["onboarding-search", "clubs", debouncedSearch],
        queryFn: () =>
            listClubs({
                q: debouncedSearch || undefined,
                limit: 50,
            }),
        enabled: segment === "clubs",
    });

    const teamsQuery = useQuery({
        queryKey: ["onboarding-search", "teams", debouncedSearch],
        queryFn: () =>
            listTeams({
                q: debouncedSearch || undefined,
                limit: 50,
            }),
        enabled: segment === "teams",
    });

    const playersQuery = useQuery({
        queryKey: ["onboarding-search", "players", debouncedSearch],
        queryFn: () =>
            listPlayers({
                q: debouncedSearch || undefined,
                limit: 50,
            }),
        enabled: segment === "players",
    });

    const isLoading =
        (segment === "clubs" && clubsQuery.isLoading) ||
        (segment === "teams" && teamsQuery.isLoading) ||
        (segment === "players" && playersQuery.isLoading);

    const clubsData = clubsQuery.data ?? [];
    const teamsData = teamsQuery.data ?? [];
    const playersData = playersQuery.data ?? [];

    const isSearching = debouncedSearch.trim().length > 0;

    const handleCancel = () => {
        Keyboard.dismiss();
        setSearch("");
        setDebouncedSearch("");
        onBack();
    };

    return (
        <SafeAreaView
            className="flex-1 bg-background-0"
            edges={["top", "bottom"]}
        >
            <View style={styles.searchHeader}>
                <Pressable onPress={onBack} hitSlop={12} style={styles.backBtn}>
                    <ArrowLeft size={24} color="#1A1A1A" />
                </Pressable>
                <View style={styles.searchBar}>
                    <Search size={20} color="#6B7280" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder={searchPlaceholder}
                        placeholderTextColor="#9CA3AF"
                        value={search}
                        onChangeText={handleSearchChange}
                        autoCapitalize="none"
                        autoCorrect={false}
                        returnKeyType="search"
                    />
                </View>
                <Pressable onPress={handleCancel} hitSlop={12}>
                    <GluestackText className="font-lato text-base font-semibold text-typography-900">
                        Cancel
                    </GluestackText>
                </Pressable>
            </View>

            <ScrollView
                style={styles.scrollArea}
                contentContainerStyle={styles.scrollContent}
                contentInsetAdjustmentBehavior="automatic"
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <GluestackText className="font-lato text-[17px] font-bold text-typography-900 mb-3">
                    {isSearching ? "Results" : "Trending"}
                </GluestackText>

                {isLoading && (
                    <View className="py-8 items-center">
                        <ActivityIndicator />
                    </View>
                )}

                {!isLoading && segment === "clubs" && (
                    <>
                        {clubsData.length === 0 && (
                            <GluestackText className="font-lato text-typography-500 py-4">
                                {isSearching
                                    ? "No clubs found"
                                    : "No trending clubs"}
                            </GluestackText>
                        )}
                        {clubsData.map((club) => (
                            <View key={club.id} style={styles.listItem}>
                                <View style={styles.listItemLeft}>
                                    <TeamAvatar logoUrl={club.logo} />
                                    <GluestackText className="font-lato text-[15px] font-semibold text-typography-900">
                                        {club.name}
                                    </GluestackText>
                                </View>
                                <Pressable
                                    onPress={() => onToggleFollow(club.id)}
                                    style={[
                                        styles.followBtn,
                                        followedIds.has(club.id)
                                            ? styles.followBtnActive
                                            : styles.followBtnOutline,
                                    ]}
                                >
                                    <GluestackText
                                        className={
                                            followedIds.has(club.id)
                                                ? "font-lato text-white font-semibold text-[13px]"
                                                : "font-lato text-typography-900 font-semibold text-[13px]"
                                        }
                                    >
                                        {followedIds.has(club.id)
                                            ? "Following"
                                            : "Follow"}
                                    </GluestackText>
                                    {followedIds.has(club.id) && (
                                        <Bell size={14} color="#FFFFFF" />
                                    )}
                                </Pressable>
                            </View>
                        ))}
                    </>
                )}

                {!isLoading && segment === "teams" && (
                    <>
                        {teamsData.length === 0 && (
                            <GluestackText className="font-lato text-typography-500 py-4">
                                {isSearching
                                    ? "No teams found"
                                    : "No trending teams"}
                            </GluestackText>
                        )}
                        {teamsData.map((team) => (
                            <View key={team.id} style={styles.listItem}>
                                <View style={styles.listItemLeft}>
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
                                <Pressable
                                    onPress={() => onToggleFollow(team.id)}
                                    style={[
                                        styles.followBtn,
                                        followedIds.has(team.id)
                                            ? styles.followBtnActive
                                            : styles.followBtnOutline,
                                    ]}
                                >
                                    <GluestackText
                                        className={
                                            followedIds.has(team.id)
                                                ? "font-lato text-white font-semibold text-[13px]"
                                                : "font-lato text-typography-900 font-semibold text-[13px]"
                                        }
                                    >
                                        {followedIds.has(team.id)
                                            ? "Following"
                                            : "Follow"}
                                    </GluestackText>
                                    {followedIds.has(team.id) && (
                                        <Bell size={14} color="#FFFFFF" />
                                    )}
                                </Pressable>
                            </View>
                        ))}
                    </>
                )}

                {!isLoading && segment === "players" && (
                    <>
                        {playersData.length === 0 && (
                            <GluestackText className="font-lato text-typography-500 py-4">
                                {isSearching
                                    ? "No players found"
                                    : "No trending players"}
                            </GluestackText>
                        )}
                        {playersData.map((player) => (
                            <View key={player.id} style={styles.listItem}>
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
                                        {formatPlayerDisplayName(player)}
                                    </GluestackText>
                                </View>
                                <Pressable
                                    onPress={() => onToggleFollow(player.id)}
                                    style={[
                                        styles.followBtn,
                                        followedIds.has(player.id)
                                            ? styles.followBtnActive
                                            : styles.followBtnOutline,
                                    ]}
                                >
                                    <GluestackText
                                        className={
                                            followedIds.has(player.id)
                                                ? "font-lato text-white font-semibold text-[13px]"
                                                : "font-lato text-typography-900 font-semibold text-[13px]"
                                        }
                                    >
                                        {followedIds.has(player.id)
                                            ? "Following"
                                            : "Follow"}
                                    </GluestackText>
                                    {followedIds.has(player.id) && (
                                        <Bell size={14} color="#FFFFFF" />
                                    )}
                                </Pressable>
                            </View>
                        ))}
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    searchHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    backBtn: {
        padding: 4,
    },
    searchBar: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        height: 44,
        backgroundColor: "#F3F4F6",
        borderRadius: 12,
        paddingHorizontal: 16,
    },
    searchInput: {
        flex: 1,
        fontFamily: "Lato",
        fontSize: 16,
        color: "#1A1A1A",
        padding: 0,
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
});
