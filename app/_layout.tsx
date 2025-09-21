import { useFonts } from "expo-font";
import { Stack, useLocalSearchParams, router } from "expo-router";
import React from "react";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { UserProvider } from "../contexts/user-context";
import { Pressable, Text } from "react-native";

import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Lato_400Regular, Lato_700Bold } from "@expo-google-fonts/lato";
import { StackAnimationTypes } from "react-native-screens";
import { X } from "lucide-react-native";
SplashScreen.setOptions({
    duration: 1000,
    fade: true,
});

SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
    const params = useLocalSearchParams();
    const [loaded, error] = useFonts({
        Lato_400Regular,
        Lato_700Bold,
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
                            options={{ headerShown: false }}
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
                            name='otp'
                            options={{
                                title: "",
                                headerBackButtonDisplayMode: "minimal",
                                headerShadowVisible: false,
                                headerTintColor: "#222",
                                headerTransparent: true,
                                animation:
                                    params.animation as StackAnimationTypes,
                                // animation: "slide_from_bottom",
                            }}
                        />
                        <Stack.Screen
                            name='set-name'
                            options={{
                                title: "",
                                headerBackVisible: false,
                                headerShadowVisible: false,
                                headerTintColor: "#222",
                                headerTransparent: true,
                                gestureEnabled: false,
                                animation: "slide_from_bottom",
                                headerLeft: () => (
                                    <Pressable
                                        onPress={() => {
                                            router.dismissAll();
                                        }}
                                        className='p-2'
                                    >
                                        <X size={24} />
                                    </Pressable>
                                ),
                            }}
                        />
                    </Stack>
                </UserProvider>
            </GluestackUIProvider>
        </SafeAreaProvider>
    );
};

export default RootLayout;
