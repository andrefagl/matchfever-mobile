import React from "react";
import { useLocalSearchParams } from "expo-router";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";

export default function TournamentDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();

    return (
        <Box className="flex-1 bg-background-0 p-6 justify-center">
            <Text className="text-typography-900 text-xl font-bold mb-2">
                Tournament detail
            </Text>
            <Text className="text-typography-500">
                ID: {id ?? "—"}
            </Text>
            <Text className="text-typography-500 mt-4 text-sm">
                Screen content and design to be defined.
            </Text>
        </Box>
    );
}
