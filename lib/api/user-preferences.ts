import { apiClient } from "@/lib/api-client";
import type { OnboardingSelections } from "@/lib/onboarding-storage";

/**
 * Sync onboarding selections (followed clubs, teams, players) to the user's
 * preferences in the database. Called after sign-in when there are pending
 * selections from onboarding completed before authentication.
 *
 * Backend should have endpoints like:
 * - POST /user/preferences/followed-clubs
 * - POST /user/preferences/followed-teams
 * - POST /user/preferences/followed-players
 *
 * Or a single: POST /user/preferences/onboarding { clubs, teams, players }
 */
export async function syncOnboardingSelectionsToUser(
    selections: OnboardingSelections
): Promise<void> {
    try {
        await apiClient.post("/user/preferences/onboarding", selections);
    } catch (err) {
        // If endpoint doesn't exist yet (404) or other error, log and continue.
        // Pending selections will be cleared anyway to avoid repeated attempts.
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status !== 404 && status !== 501) {
            console.warn("[user-preferences] Failed to sync onboarding:", err);
        }
    }
}
