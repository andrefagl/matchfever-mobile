import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Link } from "expo-router";

const About = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>About</Text>
            <Link href='/' style={styles.link}>
                Home page
            </Link>
        </View>
    );
};

export default About;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
    },
    link: {
        marginVertical: 10,
        textDecorationLine: "underline",
    },
});
