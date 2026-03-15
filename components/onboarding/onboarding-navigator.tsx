import React from "react";
import {
    NavigationContainer,
    NavigationIndependentTree,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useSharedValue } from "react-native-reanimated";
import {
    WelcomeScreen,
    ClubsScreen,
    TeamsScreen,
    PlayersScreen,
} from "./onboarding-screens";
import { OnboardingSearchScreen } from "./onboarding-search-screen";
import { OnboardingProgressProvider } from "@/contexts/onboarding-progress-context";

export type OnboardingStackParamList = {
    welcome: undefined;
    clubs: undefined;
    teams: undefined;
    players: undefined;
    search: { segment: "clubs" | "teams" | "players" };
};

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export function OnboardingNavigator({
    onComplete,
}: {
    onComplete?: () => void;
}) {
    const fillWidth = useSharedValue(0);

    return (
        <NavigationIndependentTree>
            <NavigationContainer>
                <OnboardingProgressProvider fillWidth={fillWidth}>
                    <Stack.Navigator
                        screenOptions={{
                            headerShown: false,
                            animation: "slide_from_right",
                            contentStyle: { backgroundColor: "#FFFFFF" },
                        }}
                    >
                        <Stack.Screen name="welcome" component={WelcomeScreen} />
                        <Stack.Screen name="clubs" component={ClubsScreen} />
                        <Stack.Screen name="teams" component={TeamsScreen} />
                        <Stack.Screen name="players">
                            {(props) => (
                                <PlayersScreen
                                    {...props}
                                    onComplete={onComplete}
                                />
                            )}
                        </Stack.Screen>
                        <Stack.Screen
                            name="search"
                            component={OnboardingSearchScreen}
                            options={{ animation: "slide_from_right" }}
                        />
                    </Stack.Navigator>
                </OnboardingProgressProvider>
            </NavigationContainer>
        </NavigationIndependentTree>
    );
}
