import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Link } from "expo-router";

const Home = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome Home</Text>

            <Link href='/about' style={styles.link}>
                About page
            </Link>

            <Link href='/contact' style={styles.link}>
                Contact page
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
