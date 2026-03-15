import React, { useState } from "react";
import { useUser } from "@/contexts/user-context";
import {
    setOnboardingCompleted,
    setOnboardingCompletedDevice,
    setPendingOnboardingSelections,
    type OnboardingSelections,
} from "@/lib/onboarding-storage";
import { OnboardingProvider } from "@/contexts/onboarding-context";
import { OnboardingNavigator } from "@/components/onboarding/onboarding-navigator";

export default function OnboardingScreen({
    onComplete,
}: {
    onComplete?: () => void;
}) {
    const { user } = useUser();
    const [isCompleting, setIsCompleting] = useState(false);

    const handleComplete = async (selections: OnboardingSelections) => {
        setIsCompleting(true);
        await setOnboardingCompletedDevice();
        await setPendingOnboardingSelections(selections);
        if (user) {
            await setOnboardingCompleted(user.id);
        }
        onComplete?.();
    };

    return (
        <OnboardingProvider>
            <OnboardingNavigator onComplete={handleComplete} />
        </OnboardingProvider>
    );
}
