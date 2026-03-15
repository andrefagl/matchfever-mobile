import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    ScrollView,
    TextInput,
    Pressable,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text as GluestackText } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { listTeams } from "@/lib/api/teams";
import { addTeamsToTournament } from "@/lib/api/tournaments";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function AddTeamsScreen() {
    const { tournamentId } = useLocalSearchParams<{ tournamentId: string }>();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const teamsQuery = useQuery({
        queryKey: ["teams", search],
        queryFn: () => listTeams({ q: search || undefined, limit: 50 }),
    });

    const toggleTeam = useCallback((id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const handleAdd = async () => {
        if (!tournamentId || selectedIds.size === 0) return;
        setError(null);
        setIsSubmitting(true);
        try {
            await addTeamsToTournament(tournamentId, {
                teamIds: [...selectedIds],
            });
            queryClient.invalidateQueries({ queryKey: ["tournaments"] });
            router.back();
        } catch (e) {
            setError((e as Error).message ?? "Failed to add teams");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!tournamentId) {
        return (
            <View className="flex-1 p-6">
                <GluestackText className="text-typography-500">
                    Missing tournament
                </GluestackText>
            </View>
        );
    }

    const teams = teamsQuery.data ?? [];

    return (
        <View className="flex-1 bg-background-0">
            <View className="px-6 py-4 border-b border-outline-200">
                <TextInput
                    className="h-11 px-4 rounded-lg bg-secondary-100 text-typography-900"
                    placeholder="Search teams..."
                    placeholderTextColor="#8C8C8C"
                    value={search}
                    onChangeText={setSearch}
                />
            </View>
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
                refreshControl={
                    <RefreshControl
                        refreshing={teamsQuery.isFetching}
                        onRefresh={() => teamsQuery.refetch()}
                    />
                }
            >
                {teamsQuery.isLoading && (
                    <View className="py-8 items-center">
                        <ActivityIndicator />
                    </View>
                )}
                {!teamsQuery.isLoading && teams.length === 0 && (
                    <GluestackText className="text-typography-500 text-center py-8">
                        No teams found
                    </GluestackText>
                )}
                {!teamsQuery.isLoading &&
                    teams.map(
                        (t: { id: string; name: string; acronym?: string | null }) => (
                            <Pressable
                                key={t.id}
                                onPress={() => toggleTeam(t.id)}
                                className={`flex-row items-center p-4 rounded-xl mb-2 ${
                                    selectedIds.has(t.id)
                                        ? "bg-primary-100 border-2 border-primary-500"
                                        : "bg-secondary-100"
                                }`}
                            >
                                <View className="flex-1">
                                    <GluestackText className="text-[15px] font-semibold text-typography-900">
                                        {t.name}
                                    </GluestackText>
                                    {t.acronym && (
                                        <Text className="text-[12px] text-typography-500">
                                            {t.acronym}
                                        </Text>
                                    )}
                                </View>
                                {selectedIds.has(t.id) && (
                                    <Text className="text-primary-500 font-bold">
                                        ✓
                                    </Text>
                                )}
                            </Pressable>
                        ),
                    )}
            </ScrollView>
            <View className="absolute bottom-0 left-0 right-0 p-6 bg-background-0 border-t border-outline-200">
                {error && (
                    <GluestackText className="text-error-500 text-sm mb-2">
                        {error}
                    </GluestackText>
                )}
                <Button
                    onPress={handleAdd}
                    disabled={isSubmitting || selectedIds.size === 0}
                    size="xl"
                    className="rounded-lg"
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <ButtonText>
                            Add {selectedIds.size} team
                            {selectedIds.size !== 1 ? "s" : ""}
                        </ButtonText>
                    )}
                </Button>
            </View>
        </View>
    );
}
