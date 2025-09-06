import { Button, StyleSheet, Text, View } from "react-native";
import React from "react";
import { Link, router } from "expo-router";
import { useUser } from "../contexts/user-context";
import "../global.css";

const Home = () => {
    const { user, signOut } = useUser();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                {user?.name ? `Welcome, ${user.name}` : "Welcome"}
            </Text>

            {user ? (
                <Button title='Sign Out' onPress={signOut} />
            ) : (
                <Button
                    title='Sign In'
                    onPress={() => router.push("/signin")}
                />
            )}

            <Link href='/about' style={styles.link}>
                About page
            </Link>

            <Link href='/contact' style={styles.link}>
                Contact page
            </Link>

            <Link href='/signin' style={styles.link}>
                Login page
            </Link>
        </View>
    );
};

export default Home;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 30,
        fontWeight: "semibold",
        fontFamily: "MuseoModerno",
    },
    link: {
        marginVertical: 10,
        textDecorationLine: "underline",
    },
});
