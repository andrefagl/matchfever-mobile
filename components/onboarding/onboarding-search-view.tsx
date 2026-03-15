import React, { useState, useEffect, useRef, useMemo } from "react";
import {
    View,
    Pressable,
    TextInput,
    StyleSheet,
    ActivityIndicator,
    Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Search } from "lucide-react-native";
import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import { Text as GluestackText } from "@/components/ui/text";
import { listClubs } from "@/lib/api/clubs";
import { listTeams } from "@/lib/api/teams";
import { listPlayers } from "@/lib/api/players";
import type { ApiPlayer } from "@/lib/api/players";
import type { ApiTeam } from "@/lib/api/teams";
import type { ApiClub } from "@/lib/api/clubs";
import {
    ClubListItem,
    TeamListItem,
    PlayerListItem,
} from "./list-items";

export type OnboardingSearchSegment = "clubs" | "teams" | "players";

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

    const data = useMemo(() => {
        if (segment === "clubs") return clubsData;
        if (segment === "teams") return teamsData;
        return playersData;
    }, [segment, clubsData, teamsData, playersData]);

    const isSearching = debouncedSearch.trim().length > 0;

    const handleCancel = () => {
        Keyboard.dismiss();
        setSearch("");
        setDebouncedSearch("");
        onBack();
    };

    const renderItem = ({ item }: { item: ApiClub | ApiTeam | ApiPlayer }) => {
        if (segment === "clubs") {
            return (
                <ClubListItem
                    item={item as ApiClub}
                    followedIds={followedIds}
                    onToggleFollow={onToggleFollow}
                />
            );
        }
        if (segment === "teams") {
            return (
                <TeamListItem
                    item={item as ApiTeam}
                    clubs={clubs}
                    followedIds={followedIds}
                    onToggleFollow={onToggleFollow}
                />
            );
        }
        return (
            <PlayerListItem
                item={item as ApiPlayer}
                followedIds={followedIds}
                onToggleFollow={onToggleFollow}
            />
        );
    };

    const emptyMessage =
        segment === "clubs"
            ? isSearching
                ? "No clubs found"
                : "No trending clubs"
            : segment === "teams"
              ? isSearching
                  ? "No teams found"
                  : "No trending teams"
              : isSearching
                ? "No players found"
                : "No trending players";

    const ListHeaderComponent = (
        <GluestackText className="font-lato text-[17px] font-bold text-typography-900 mb-3">
            {isSearching ? "Results" : "Trending"}
        </GluestackText>
    );

    const ListEmptyComponent = isLoading ? (
        <View className="py-8 items-center">
            <ActivityIndicator />
        </View>
    ) : (
        <GluestackText className="font-lato text-typography-500 py-4">
            {emptyMessage}
        </GluestackText>
    );

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

            <FlashList
                data={data}
                style={{ flex: 1 }}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={ListHeaderComponent}
                ListEmptyComponent={ListEmptyComponent}
                contentContainerStyle={styles.scrollContent}
                contentInsetAdjustmentBehavior="automatic"
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            />
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
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 24,
    },
});
