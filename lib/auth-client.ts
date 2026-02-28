import { createAuthClient } from "better-auth/react";
import { emailOTPClient, organizationClient } from "better-auth/client/plugins";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";

const baseURL = process.env.EXPO_PUBLIC_AUTH_BASE_URL;

if (!baseURL) {
    throw new Error("Missing EXPO_PUBLIC_AUTH_BASE_URL");
}

export const authClient = createAuthClient({
    baseURL,
    plugins: [
        expoClient({
            scheme: "matchfever",
            storagePrefix: "matchfever",
            storage: SecureStore,
        }),
        emailOTPClient(),
        organizationClient(),
    ],
});
