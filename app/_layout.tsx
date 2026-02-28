import { useFonts } from "expo-font";
import { useLocalSearchParams } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { UserProvider } from "../contexts/user-context";

import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";
import { Lato_400Regular, Lato_700Bold } from "@expo-google-fonts/lato";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
SplashScreen.setOptions({
    duration: 600,
    fade: true,
});
import * as Colors from "@bacons/apple-colors";

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
                    <NativeTabs tintColor={Colors.systemGray2}>
                        <NativeTabs.Trigger name='(home)'>
                            <Label hidden>Home</Label>
                            <Icon sf='house.fill' />
                        </NativeTabs.Trigger>
                        <NativeTabs.Trigger name='tournaments'>
                            <Label hidden>Tournaments</Label>
                            <Icon sf={"trophy.fill"} />
                        </NativeTabs.Trigger>
                        <NativeTabs.Trigger name='(account)'>
                            <Label hidden>Account</Label>
                            <Icon sf={"person.fill"} />
                        </NativeTabs.Trigger>
                        <NativeTabs.Trigger name='(search)' role='search'>
                            <Label hidden>Search</Label>
                        </NativeTabs.Trigger>
                    </NativeTabs>
                </UserProvider>
            </GluestackUIProvider>
        </SafeAreaProvider>
    );
};

export default RootLayout;
