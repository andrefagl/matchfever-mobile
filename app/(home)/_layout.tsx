import { Stack } from "expo-router";

const screenOptions = { animation: "none" as const };

export default function HomeLayout() {
    return (
        <Stack screenOptions={screenOptions}>
            <Stack.Screen
                name='index'
                options={{
                    title: "",
                    headerBackButtonDisplayMode: "minimal",
                    headerShadowVisible: false,
                    headerTintColor: "#222",
                    headerTransparent: true,
                }}
            />
        </Stack>
    );
}
