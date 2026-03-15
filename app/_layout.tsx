import { useFonts } from "expo-font";
import { useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { UserProvider, useUser } from "../contexts/user-context";

import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { queryClient } from "@/lib/query-client";
import "@/global.css";
import { Lato_400Regular, Lato_700Bold } from "@expo-google-fonts/lato";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
    getOnboardingCompleted,
    getOnboardingCompletedDevice,
} from "@/lib/onboarding-storage";
import OnboardingScreen from "./onboarding";
SplashScreen.setOptions({
    duration: 600,
    fade: true,
});
import * as Colors from "@bacons/apple-colors";

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
    initialRouteName: "(home)",
};

function MainContent() {
    const router = useRouter();
    const { user, authChecked } = useUser();
    const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);
    const hasRedirectedToHomeRef = useRef(false);

    useEffect(() => {
        if (!authChecked) return;

        if (user) {
            // Logged in: use per-user onboarding status
            getOnboardingCompleted(user.id).then((done) => {
                setShowOnboarding(!done);
            });
        } else {
            // Logged out: use device-level onboarding status
            // User who completed onboarding goes to Home; otherwise onboarding
            getOnboardingCompletedDevice().then((done) => {
                setShowOnboarding(!done);
            });
        }
    }, [user, authChecked]);

    // When logged out and completed onboarding: redirect to Home once on initial load.
    // Only run once per session so user can still tap Account to sign in later.
    // Run immediately and again after a short delay to handle route restoration timing.
    useEffect(() => {
        if (
            showOnboarding === false &&
            !user &&
            !hasRedirectedToHomeRef.current
        ) {
            hasRedirectedToHomeRef.current = true;
            router.replace("/(home)");
            const t = setTimeout(() => router.replace("/(home)"), 100);
            return () => clearTimeout(t);
        }
    }, [showOnboarding, user, router]);

    const handleOnboardingComplete = () => {
        setShowOnboarding(false);
        setTimeout(() => router.replace("/(home)"), 0);
    };

    if (showOnboarding === true) {
        return (
            <OnboardingScreen onComplete={handleOnboardingComplete} />
        );
    }

    if (showOnboarding === null) {
        return null;
    }

    return (
        <NativeTabs tintColor={Colors.systemGray2}>
            <NativeTabs.Trigger name="(home)">
                <Label hidden>Home</Label>
                <Icon sf="house.fill" />
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="tournaments">
                <Label hidden>Tournaments</Label>
                <Icon sf="trophy.fill" />
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="(profile)">
                <Label hidden>Account</Label>
                <Icon sf="person.fill" />
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="(search)" role="search">
                <Label hidden>Search</Label>
            </NativeTabs.Trigger>
        </NativeTabs>
    );
}

const RootLayout = () => {
    const [loaded, error] = useFonts({
        Lato_400Regular,
        Lato_700Bold,
        MuseoModernoSemiBold: require("../assets/fonts/MuseoModerno-SemiBold.ttf"),
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
            <QueryClientProvider client={queryClient}>
                <GluestackUIProvider mode="light">
                    <UserProvider>
                        <MainContent />
                    </UserProvider>
                </GluestackUIProvider>
            </QueryClientProvider>
        </SafeAreaProvider>
    );
};

export default RootLayout;
