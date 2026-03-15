import React, { createContext, useContext } from "react";
import type { SharedValue } from "react-native-reanimated";

const OnboardingProgressContext = createContext<SharedValue<number> | null>(
    null
);

export function OnboardingProgressProvider({
    children,
    fillWidth,
}: {
    children: React.ReactNode;
    fillWidth: SharedValue<number>;
}) {
    return (
        <OnboardingProgressContext.Provider value={fillWidth}>
            {children}
        </OnboardingProgressContext.Provider>
    );
}

export function useOnboardingProgress() {
    const ctx = useContext(OnboardingProgressContext);
    if (!ctx)
        throw new Error(
            "useOnboardingProgress must be used within OnboardingProgressProvider"
        );
    return ctx;
}
