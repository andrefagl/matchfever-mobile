import { Stack } from "expo-router";

export default function HomeLayout() {
    return (
        <Stack>
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
