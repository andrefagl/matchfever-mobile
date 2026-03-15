import { Alert, Button, StyleSheet, View } from "react-native";
import React from "react";
import { Heading } from "@/components/ui/heading";
import { useUser } from "@/contexts/user-context";
import { router } from "expo-router";
import { resetOnboardingData } from "@/lib/onboarding-storage";

const Profile = () => {
    const { user, signOut } = useUser();

    const handleResetOnboarding = async () => {
        await resetOnboardingData(user?.id);
        Alert.alert(
            "Onboarding reset",
            "Reload the app to see the onboarding flow again.",
            [{ text: "OK" }]
        );
    };

    return (
        <View style={styles.container}>
            <Heading
                size='2xl'
                className='font-latoBold leading-snug text-slate-950'
            >
                {`Welcome ${user?.name ? ", " + user.name : "back"}`}
            </Heading>

            <Button
                title='Sign Out'
                onPress={() => {
                    signOut();
                    router.back();
                }}
            />

            {__DEV__ && (
                <Button
                    title='Reset onboarding (dev)'
                    onPress={handleResetOnboarding}
                />
            )}
        </View>
    );
};

export default Profile;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});
