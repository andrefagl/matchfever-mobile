import React, { useState } from "react";
import { useUser } from "@/contexts/user-context";
import { setOnboardingCompleted } from "@/lib/onboarding-storage";
import { OnboardingProvider } from "@/contexts/onboarding-context";
import { OnboardingNavigator } from "@/components/onboarding/onboarding-navigator";

export default function OnboardingScreen({
    onComplete,
}: {
    onComplete?: () => void;
}) {
    const { user } = useUser();
    const [isCompleting, setIsCompleting] = useState(false);

    const handleComplete = async () => {
        if (!user) return;
        setIsCompleting(true);
        await setOnboardingCompleted(user.id);
        onComplete?.();
    };

    return (
        <OnboardingProvider>
            <OnboardingNavigator onComplete={handleComplete} />
        </OnboardingProvider>
    );
}
