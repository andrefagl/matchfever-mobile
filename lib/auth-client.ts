import { createAuthClient } from "better-auth/react";
import { emailOTPClient, organizationClient } from "better-auth/client/plugins";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
import { resolveBaseUrl } from "@/lib/dev-base-url";

const raw = process.env.EXPO_PUBLIC_AUTH_BASE_URL;
if (!raw) {
    throw new Error("Missing EXPO_PUBLIC_AUTH_BASE_URL");
}
const baseURL = resolveBaseUrl(raw);

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
