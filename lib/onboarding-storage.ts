import * as SecureStore from "expo-secure-store";

const KEY_PREFIX = "onboarding_completed_";
const KEY_DEVICE_COMPLETED = "onboarding_device_completed";
const KEY_PENDING_SELECTIONS = "onboarding_pending_selections";

export interface OnboardingSelections {
    clubs: string[];
    teams: string[];
    players: string[];
}

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

/** Device-level: has onboarding been completed on this device (any user or no user). */
export async function getOnboardingCompletedDevice(): Promise<boolean> {
    try {
        const value = await SecureStore.getItemAsync(KEY_DEVICE_COMPLETED);
        return value === "true";
    } catch {
        return false;
    }
}

/** Mark onboarding as completed at device level (used when completing without a user). */
export async function setOnboardingCompletedDevice(): Promise<void> {
    try {
        await SecureStore.setItemAsync(KEY_DEVICE_COMPLETED, "true");
    } catch {
        // Ignore
    }
}

/** Get pending onboarding selections (saved when user completed onboarding before sign-in). */
export async function getPendingOnboardingSelections(): Promise<OnboardingSelections | null> {
    try {
        const raw = await SecureStore.getItemAsync(KEY_PENDING_SELECTIONS);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as OnboardingSelections;
        if (
            Array.isArray(parsed.clubs) &&
            Array.isArray(parsed.teams) &&
            Array.isArray(parsed.players)
        ) {
            return parsed;
        }
        return null;
    } catch {
        return null;
    }
}

/** Save onboarding selections for later sync when user signs in. */
export async function setPendingOnboardingSelections(
    selections: OnboardingSelections
): Promise<void> {
    try {
        await SecureStore.setItemAsync(
            KEY_PENDING_SELECTIONS,
            JSON.stringify(selections)
        );
    } catch {
        // Ignore
    }
}

/** Clear pending selections after they have been synced to the user. */
export async function clearPendingOnboardingSelections(): Promise<void> {
    try {
        await SecureStore.deleteItemAsync(KEY_PENDING_SELECTIONS);
    } catch {
        // Ignore
    }
}

/**
 * Reset all onboarding data (dev only). Clears device completion, pending
 * selections, and per-user completion if userId is provided.
 * Call this to test the onboarding flow again.
 */
export async function resetOnboardingData(userId?: string): Promise<void> {
    try {
        await SecureStore.deleteItemAsync(KEY_DEVICE_COMPLETED);
        await SecureStore.deleteItemAsync(KEY_PENDING_SELECTIONS);
        if (userId) {
            await SecureStore.deleteItemAsync(KEY_PREFIX + userId);
        }
    } catch {
        // Ignore
    }
}
