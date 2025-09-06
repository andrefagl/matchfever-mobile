import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import React from "react";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { UserProvider } from "../contexts/user-context";

import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { SafeAreaProvider } from "react-native-safe-area-context";

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
        <SafeAreaProvider>
            <GluestackUIProvider mode='light'>
                <UserProvider>
                    <Stack>
                        <Stack.Screen
                            name='index'
                            options={{ title: "Home" }}
                        />
                        <Stack.Screen
                            name='about'
                            options={{ title: "About" }}
                        />
                        <Stack.Screen
                            name='contact'
                            options={{ title: "Contact" }}
                        />
                        <Stack.Screen
                            name='signin'
                            options={{
                                title: "",
                                headerBackButtonDisplayMode: "minimal",
                                headerShadowVisible: false,
                                headerTintColor: "#222",
                                headerTransparent: true,
                            }}
                        />
                        <Stack.Screen
                            name='signup'
                            options={{
                                title: "",
                                headerBackButtonDisplayMode: "minimal",
                                headerShadowVisible: false,
                                headerTintColor: "#222",
                                headerTransparent: true,
                            }}
                        />
                    </Stack>
                </UserProvider>
            </GluestackUIProvider>
        </SafeAreaProvider>
    );
};

export default RootLayout;
