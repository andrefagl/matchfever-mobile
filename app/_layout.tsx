import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Stack } from "expo-router";

const RootLayout = () => {
    return (
        <Stack>
            <Stack.Screen name='index' options={{ title: "Home" }} />
            <Stack.Screen name='about' options={{ title: "About" }} />
            <Stack.Screen name='contact' options={{ title: "Contact" }} />
        </Stack>
    );
};

export default RootLayout;
