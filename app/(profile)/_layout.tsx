import { useUser } from "@/contexts/user-context";
import { router, Stack } from "expo-router";
import { X } from "lucide-react-native";
import { Pressable } from "react-native";

export default function AuthLayout() {
    const { user } = useUser();
    const isLoggedIn = !!user;

    return (
        <Stack screenOptions={{ animation: "none" }}>
            <Stack.Screen
                name="index"
                options={{ headerShown: false }}
            />
            <Stack.Protected guard={!isLoggedIn}>
                <Stack.Screen name='terms' />
                <Stack.Screen name='privacy' />
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
            </Stack.Protected>
        </Stack>
    );
}
