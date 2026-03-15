import React, { useState } from "react";
import {
    View,
    Text,
    ScrollView,
    TextInput,
    Pressable,
    ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Text as GluestackText } from "@/components/ui/text";
import { useTournaments } from "@/lib/hooks/use-tournaments";

export default function SearchScreen() {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [submitted, setSubmitted] = useState("");

    const tournamentsQuery = useTournaments(undefined, Boolean(submitted));

    const handleSearch = () => {
        setSubmitted(query.trim());
    };

    const tournaments = tournamentsQuery.data ?? [];
    const filtered =
        submitted.length > 0
            ? tournaments.filter(
                  (t: { name?: string; location?: string }) =>
                      (t.name ?? "")
                          .toLowerCase()
                          .includes(submitted.toLowerCase()) ||
                      (t.location ?? "")
                          .toLowerCase()
                          .includes(submitted.toLowerCase()),
              )
            : [];

    return (
        <View className="flex-1 bg-background-0">
            <View className="px-6 py-4 border-b border-outline-200">
                <View className="flex-row gap-2">
                    <TextInput
                        className="flex-1 h-11 px-4 rounded-lg bg-secondary-100 text-typography-900"
                        placeholder="Search tournaments by name or location..."
                        placeholderTextColor="#8C8C8C"
                        value={query}
                        onChangeText={setQuery}
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
                    />
                    <Pressable
                        onPress={handleSearch}
                        className="h-11 px-4 rounded-lg bg-primary-500 justify-center"
                    >
                        <Text className="text-typography-0 font-semibold">
                            Search
                        </Text>
                    </Pressable>
                </View>
            </View>
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ padding: 24, paddingBottom: 48 }}
                contentInsetAdjustmentBehavior="automatic"
            >
                {!submitted && (
                    <GluestackText className="text-typography-500 text-center py-8">
                        Enter a search term to find tournaments
                    </GluestackText>
                )}
                {submitted && tournamentsQuery.isLoading && (
                    <View className="py-8 items-center">
                        <ActivityIndicator />
                    </View>
                )}
                {submitted && !tournamentsQuery.isLoading && filtered.length === 0 && (
                    <GluestackText className="text-typography-500 text-center py-8">
                        No tournaments found for "{submitted}"
                    </GluestackText>
                )}
                {submitted &&
                    !tournamentsQuery.isLoading &&
                    filtered.map(
                        (t: {
                            id: string;
                            name?: string;
                            location?: string;
                            startDate?: string;
                        }) => (
                            <Pressable
                                key={t.id}
                                onPress={() =>
                                    router.push(`/tournaments/${t.id}`)
                                }
                                className="rounded-2xl bg-secondary-100 p-4 mb-3"
                            >
                                <GluestackText className="text-[15px] font-bold text-typography-900">
                                    {t.name ?? "—"}
                                </GluestackText>
                                <Text className="text-[12px] text-typography-500 mt-1">
                                    {t.location ?? "—"} · {t.startDate ?? "—"}
                                </Text>
                            </Pressable>
                        ),
                    )}
            </ScrollView>
        </View>
    );
}
