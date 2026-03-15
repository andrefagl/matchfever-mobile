import * as SecureStore from "expo-secure-store";

const KEY_PREFIX = "onboarding_completed_";

export async function getOnboardingCompleted(userId: string): Promise<boolean> {
    try {
        const value = await SecureStore.getItemAsync(KEY_PREFIX + userId);
        return value === "true";
    } catch {
        return false;
    }
}

export async function setOnboardingCompleted(userId: string): Promise<void> {
    try {
        await SecureStore.setItemAsync(KEY_PREFIX + userId, "true");
    } catch {
        // Ignore
    }
}
