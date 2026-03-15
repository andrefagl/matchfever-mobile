import React, { createContext, useContext, useState, useCallback } from "react";

interface OnboardingContextValue {
    followedClubs: Set<string>;
    followedTeams: Set<string>;
    followedPlayers: Set<string>;
    toggleFollowClub: (id: string) => void;
    toggleFollowTeam: (id: string) => void;
    toggleFollowPlayer: (id: string) => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
    const [followedClubs, setFollowedClubs] = useState<Set<string>>(new Set());
    const [followedTeams, setFollowedTeams] = useState<Set<string>>(new Set());
    const [followedPlayers, setFollowedPlayers] = useState<Set<string>>(new Set());

    const toggleFollowClub = useCallback((id: string) => {
        setFollowedClubs((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const toggleFollowTeam = useCallback((id: string) => {
        setFollowedTeams((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const toggleFollowPlayer = useCallback((id: string) => {
        setFollowedPlayers((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const value: OnboardingContextValue = {
        followedClubs,
        followedTeams,
        followedPlayers,
        toggleFollowClub,
        toggleFollowTeam,
        toggleFollowPlayer,
    };

    return (
        <OnboardingContext.Provider value={value}>
            {children}
        </OnboardingContext.Provider>
    );
}

export function useOnboarding() {
    const ctx = useContext(OnboardingContext);
    if (!ctx) throw new Error("useOnboarding must be used within OnboardingProvider");
    return ctx;
}
