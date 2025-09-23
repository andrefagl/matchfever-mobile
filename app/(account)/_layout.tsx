import { useUser } from "@/contexts/user-context";
import { Stack } from "expo-router";

export default function AuthLayout() {
    const { user } = useUser();
    const isLoggedIn = !!user;

    return (
        <Stack>
            <Stack.Protected guard={!isLoggedIn}>
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
                    }}
                />
            </Stack.Protected>
            <Stack.Protected guard={isLoggedIn}>
                <Stack.Screen
                    name='profile'
                    options={{
                        title: "",
                        headerBackButtonDisplayMode: "minimal",
                        headerShadowVisible: false,
                        headerTintColor: "#222",
                        headerTransparent: true,
                    }}
                />
                <Stack.Screen
                    name='set-name'
                    options={{
                        title: "",
                        headerBackButtonDisplayMode: "minimal",
                        headerShadowVisible: false,
                        headerTintColor: "#222",
                        headerTransparent: true,
                    }}
                />
            </Stack.Protected>
        </Stack>
    );
}
