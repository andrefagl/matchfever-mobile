import { Button, StyleSheet, Text, View } from "react-native";
import React from "react";
import { Heading } from "@/components/ui/heading";
import { useUser } from "@/contexts/user-context";
import { router } from "expo-router";

const Profile = () => {
    const { user, signOut } = useUser();

    // if (!user) {
    //     <Redirect href='/signin' />;
    // }

    return (
        <View style={styles.container}>
            <Heading
                size='2xl'
                className='font-latoBold leading-snug text-slate-950'
            >
                {`Welcome, ${user?.name}`}
            </Heading>

            <Text
                className='font-latoBold leading-snug text-slate-950'
                style={styles.title}
            >
                Profile view
            </Text>

            <Button
                title='Sign Out'
                onPress={() => {
                    signOut();
                    router.back();
                }}
            />
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
    title: {
        fontSize: 30,
        fontWeight: "semibold",
    },
    link: {
        marginVertical: 10,
        textDecorationLine: "underline",
    },
});
