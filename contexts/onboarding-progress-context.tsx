import React, {
    createContext,
    useContext,
    useRef,
    type MutableRefObject,
} from "react";
import type { SharedValue } from "react-native-reanimated";

type OnboardingProgressContextValue = {
    fillWidth: SharedValue<number>;
    shouldResetProgressRef: MutableRefObject<boolean>;
};

const OnboardingProgressContext =
    createContext<OnboardingProgressContextValue | null>(null);

export function OnboardingProgressProvider({
    children,
    fillWidth,
}: {
    children: React.ReactNode;
    fillWidth: SharedValue<number>;
}) {
    const shouldResetProgressRef = useRef(true);

    return (
        <OnboardingProgressContext.Provider
            value={{ fillWidth, shouldResetProgressRef }}
        >
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
