import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Link } from "expo-router";

const Search = () => {
    return (
        <View style={styles.container}>
            <Text
                className='font-latoBold leading-snug text-slate-950'
                style={styles.title}
            >
                Search view
            </Text>
        </View>
    );
};

export default Search;

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
