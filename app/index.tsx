import { Button, StyleSheet, Text, View } from "react-native";
import React from "react";
import { Link, router } from "expo-router";
import { useUser } from "../contexts/user-context";
import "../global.css";
import { Heading } from "@/components/ui/heading";

const Home = () => {
    const { user, signOut } = useUser();

    return (
        <View className='flex-1 justify-center items-center bg-background-0'>
            <Heading
                size='2xl'
                className='font-latoBold leading-snug text-slate-950'
            >
                {user?.name ? `Welcome, ${user.name}` : "Welcome"}
            </Heading>

            {user ? (
                <Button title='Sign Out' onPress={signOut} />
            ) : (
                <Button
                    title='Sign In'
                    onPress={() => router.push("/signin")}
                />
            )}

            <Link href='/about' className='my-3 underline'>
                About page
            </Link>

            <Link href='/contact' className='my-3 underline'>
                Contact page
            </Link>

            <Link href='/otp' className='my-3 underline'>
                OTP page
            </Link>

            <Link href='/set-name' className='my-3 underline'>
                Set name view
            </Link>

            <Link href='/signin' className='my-3 underline'>
                Forced sign in
            </Link>
        </View>
    );
};

export default Home;
