import { Button, StyleSheet, Text, View } from "react-native";
import React from "react";
import { Heading } from "@/components/ui/heading";
import { useUser } from "@/contexts/user-context";
import { router } from "expo-router";
import { UserRoleDemo } from "@/components/user-role-demo";

const Profile = () => {
    const { user, signOut } = useUser();

    return (
        <View style={styles.container}>
            <Text
                className='font-latoBold leading-snug text-slate-950'
                style={styles.title}
            >
                Profile view
            </Text>

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
            <UserRoleDemo />
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
