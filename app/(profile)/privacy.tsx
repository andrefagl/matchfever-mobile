import React from "react";
import { ScrollView } from "react-native";
import { Stack } from "expo-router";
import { Text as GluestackText } from "@/components/ui/text";

export default function PrivacyScreen() {
    return (
        <>
            <Stack.Screen
                options={{
                    title: "Privacy Policy",
                    headerBackButtonDisplayMode: "minimal",
                    headerShadowVisible: false,
                }}
            />
            <ScrollView
                className="flex-1 bg-background-0"
                contentContainerStyle={{ padding: 24, paddingBottom: 48 }}
                contentInsetAdjustmentBehavior="automatic"
            >
                <GluestackText className="text-typography-900 text-base leading-6">
                    Privacy Policy content to be defined.
                </GluestackText>
            </ScrollView>
        </>
    );
}
