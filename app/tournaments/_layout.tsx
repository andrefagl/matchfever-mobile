import { Stack } from "expo-router";

const screenOptions = {
    headerShown: false,
    animation: "none" as const,
};

export default function TournamentsLayout() {
    return (
        <Stack screenOptions={screenOptions}>
            <Stack.Screen name='index' />
            <Stack.Screen
                name='create'
                options={{
                    headerShown: true,
                    title: "Create tournament",
                    animation: "slide_from_right",
                    headerShadowVisible: false,
                    headerBackButtonDisplayMode: "minimal",
                    headerTintColor: "#222",
                }}
            />
            <Stack.Screen
                name='add-teams'
                options={{
                    headerShown: true,
                    title: "Add teams",
                    animation: "slide_from_right",
                    headerShadowVisible: false,
                    headerBackButtonDisplayMode: "minimal",
                    headerTintColor: "#222",
                }}
            />
            <Stack.Screen
                name='[id]'
                options={{
                    headerShown: true,
                    title: "Tournament",
                    animation: "slide_from_right",
                    headerShadowVisible: false,
                    headerBackButtonDisplayMode: "minimal",
                    headerTintColor: "#222",
                }}
            />
        </Stack>
    );
}
