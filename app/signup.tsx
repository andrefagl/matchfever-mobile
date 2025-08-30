import React, { useState } from "react";
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    SafeAreaView,
    TouchableWithoutFeedback,
    Keyboard,
} from "react-native";
import { router } from "expo-router";
import { useUser } from "../contexts/user-context";

const Signup = () => {
    const { user, signUp } = useUser();
    console.log(user);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSignup = async () => {
        if (
            !firstName.trim() ||
            !lastName.trim() ||
            !email.trim() ||
            !password.trim() ||
            !confirmPassword.trim()
        ) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        if (password.length < 6) {
            Alert.alert("Error", "Password must be at least 6 characters");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }

        setIsLoading(true);

        try {
            await signUp(email, password);
            // router.push("/");
        } catch (error) {
            Alert.alert("Error", "Signup failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={styles.keyboardView}
                    >
                        <ScrollView
                            contentContainerStyle={styles.scrollContainer}
                        >
                            <View style={styles.header}>
                                <Text style={styles.title}>Create Account</Text>
                                <Text style={styles.subtitle}>
                                    Sign up to get started
                                </Text>
                            </View>

                            <View style={styles.form}>
                                <View style={styles.nameRow}>
                                    <View
                                        style={[
                                            styles.inputContainer,
                                            styles.halfWidth,
                                        ]}
                                    >
                                        <Text style={styles.label}>
                                            First Name
                                        </Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder='Enter your first name'
                                            placeholderTextColor='#999'
                                            value={firstName}
                                            onChangeText={setFirstName}
                                            autoCapitalize='words'
                                            autoCorrect={false}
                                        />
                                    </View>
                                    <View
                                        style={[
                                            styles.inputContainer,
                                            styles.halfWidth,
                                        ]}
                                    >
                                        <Text style={styles.label}>
                                            Last Name
                                        </Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder='Enter your last name'
                                            placeholderTextColor='#999'
                                            value={lastName}
                                            onChangeText={setLastName}
                                            autoCapitalize='words'
                                            autoCorrect={false}
                                        />
                                    </View>
                                </View>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>Email</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder='Enter your email'
                                        placeholderTextColor='#999'
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType='email-address'
                                        autoCapitalize='none'
                                        autoCorrect={false}
                                    />
                                </View>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>Password</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder='Enter your password'
                                        placeholderTextColor='#999'
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry
                                        autoCapitalize='none'
                                    />
                                </View>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>
                                        Confirm Password
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder='Confirm your password'
                                        placeholderTextColor='#999'
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        secureTextEntry
                                        autoCapitalize='none'
                                    />
                                </View>

                                <TouchableOpacity
                                    style={[
                                        styles.signupButton,
                                        isLoading &&
                                            styles.signupButtonDisabled,
                                    ]}
                                    onPress={handleSignup}
                                    disabled={isLoading}
                                >
                                    <Text style={styles.signupButtonText}>
                                        {isLoading
                                            ? "Creating Account..."
                                            : "Create Account"}
                                    </Text>
                                </TouchableOpacity>

                                <View style={styles.divider}>
                                    <View style={styles.dividerLine} />
                                    <Text style={styles.dividerText}>or</Text>
                                    <View style={styles.dividerLine} />
                                </View>

                                <TouchableOpacity style={styles.socialButton}>
                                    <Text style={styles.socialButtonText}>
                                        Continue with Google
                                    </Text>
                                </TouchableOpacity>

                                <View style={styles.footer}>
                                    <Text style={styles.footerText}>
                                        Already have an account?{" "}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => router.push("/signin")}
                                    >
                                        <Text style={styles.signInText}>
                                            Sign In
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </View>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
};

export default Signup;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
    },
    keyboardView: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 40,
        paddingBottom: 20,
    },
    header: {
        alignItems: "center",
        marginBottom: 40,
    },
    title: {
        fontSize: 32,
        fontFamily: "MuseoModerno",
        color: "#1a1a1a",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
    },
    form: {
        flex: 1,
    },
    nameRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    halfWidth: {
        width: "48%",
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1a1a1a",
        marginBottom: 8,
    },
    input: {
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#e1e5e9",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 16,
        color: "#1a1a1a",
    },
    signupButton: {
        backgroundColor: "#007AFF",
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: "center",
        marginBottom: 24,
        shadowColor: "#007AFF",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    signupButtonDisabled: {
        backgroundColor: "#ccc",
        shadowOpacity: 0,
        elevation: 0,
    },
    signupButtonText: {
        color: "#ffffff",
        fontSize: 18,
        fontWeight: "600",
    },
    divider: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: "#e1e5e9",
    },
    dividerText: {
        marginHorizontal: 16,
        color: "#666",
        fontSize: 14,
    },
    socialButton: {
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#e1e5e9",
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: "center",
        marginBottom: 32,
    },
    socialButtonText: {
        color: "#1a1a1a",
        fontSize: 16,
        fontWeight: "500",
    },
    footer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    footerText: {
        color: "#666",
        fontSize: 14,
    },
    signInText: {
        color: "#007AFF",
        fontSize: 14,
        fontWeight: "600",
    },
});
