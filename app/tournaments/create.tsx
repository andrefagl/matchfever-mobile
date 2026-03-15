import React, { useState } from "react";
import {
    View,
    Text,
    ScrollView,
    TextInput,
    Pressable,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Text as GluestackText } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { useCreateTournament } from "@/lib/hooks/use-tournaments";

const FORMATS = [
    { id: "ROUND_ROBIN", label: "Round Robin" },
    { id: "KNOCKOUT", label: "Knockout" },
    { id: "GROUPS", label: "Groups" },
] as const;

export default function CreateTournamentScreen() {
    const router = useRouter();
    const createMutation = useCreateTournament();
    const [name, setName] = useState("");
    const [formatType, setFormatType] = useState<"ROUND_ROBIN" | "KNOCKOUT" | "GROUPS">("ROUND_ROBIN");
    const [location, setLocation] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        setError(null);
        if (!name.trim()) {
            setError("Name is required");
            return;
        }
        try {
            const tournament = await createMutation.mutateAsync({
                name: name.trim(),
                formatType,
                halfDurationMinutes: 45,
                numberOfHalves: 2,
                location: location.trim() || undefined,
            });
            router.replace(`/tournaments/${tournament.id}`);
        } catch (e) {
            setError((e as Error).message ?? "Failed to create tournament");
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1 bg-background-0"
        >
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ padding: 24, paddingBottom: 48 }}
                contentInsetAdjustmentBehavior="automatic"
                keyboardShouldPersistTaps="handled"
            >
                <GluestackText className="text-[17px] font-semibold text-typography-900 mb-2">
                    Tournament name
                </GluestackText>
                <TextInput
                    className="h-12 px-4 rounded-lg border border-outline-300 bg-background-0 text-typography-900 text-base"
                    placeholder="e.g. Summer Cup U14"
                    placeholderTextColor="#8C8C8C"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                />

                <GluestackText className="text-[17px] font-semibold text-typography-900 mt-6 mb-2">
                    Format
                </GluestackText>
                <View className="flex-row gap-2 flex-wrap">
                    {FORMATS.map((f) => (
                        <Pressable
                            key={f.id}
                            onPress={() => setFormatType(f.id)}
                            className={`px-4 py-2 rounded-lg ${
                                formatType === f.id
                                    ? "bg-typography-900"
                                    : "bg-secondary-100"
                            }`}
                        >
                            <Text
                                className={`text-[14px] font-semibold ${
                                    formatType === f.id
                                        ? "text-typography-0"
                                        : "text-typography-700"
                                }`}
                            >
                                {f.label}
                            </Text>
                        </Pressable>
                    ))}
                </View>

                <GluestackText className="text-[17px] font-semibold text-typography-900 mt-6 mb-2">
                    Location (optional)
                </GluestackText>
                <TextInput
                    className="h-12 px-4 rounded-lg border border-outline-300 bg-background-0 text-typography-900 text-base"
                    placeholder="e.g. Lisbon, Portugal"
                    placeholderTextColor="#8C8C8C"
                    value={location}
                    onChangeText={setLocation}
                />

                {error && (
                    <GluestackText className="text-error-500 text-sm mt-4">
                        {error}
                    </GluestackText>
                )}

                <Button
                    onPress={handleSubmit}
                    disabled={createMutation.isPending || !name.trim()}
                    size="xl"
                    className="mt-8 rounded-lg"
                >
                    {createMutation.isPending ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <ButtonText>Create tournament</ButtonText>
                    )}
                </Button>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
