import { Stack } from "expo-router";

export default function SearchLayout() {
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
                    headerSearchBarOptions: {
                        placement: "automatic",
                        placeholder: "Search",
                        onChangeText: () => {},
                    },
                }}
            />
        </Stack>
    );
}
