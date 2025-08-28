import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import React from "react";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

SplashScreen.setOptions({
    duration: 1000,
    fade: true,
});

SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
    const [loaded, error] = useFonts({
        MuseoModerno: require("../assets/fonts/MuseoModerno-SemiBold.ttf"),
    });

    useEffect(() => {
        if (loaded || error) {
            SplashScreen.hide();
        }
    }, [loaded, error]);

    if (!loaded && !error) {
        return null;
    }

    return (
        <Stack>
            <Stack.Screen name='index' options={{ title: "Home" }} />
            <Stack.Screen name='about' options={{ title: "About" }} />
            <Stack.Screen name='contact' options={{ title: "Contact" }} />
        </Stack>
    );
};

export default RootLayout;
