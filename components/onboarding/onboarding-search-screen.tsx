import React from "react";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { OnboardingSearchView } from "./onboarding-search-view";
import { useOnboarding } from "@/contexts/onboarding-context";
import { useQuery } from "@tanstack/react-query";
import { listClubs } from "@/lib/api/clubs";
import type { OnboardingStackParamList } from "./onboarding-navigator";

export function OnboardingSearchScreen() {
    const navigation = useNavigation();
    const route =
        useRoute<RouteProp<OnboardingStackParamList, "search">>();
    const { segment } = route.params;

    const {
        followedClubs,
        followedTeams,
        followedPlayers,
        toggleFollowClub,
        toggleFollowTeam,
        toggleFollowPlayer,
    } = useOnboarding();

    const clubsQuery = useQuery({
        queryKey: ["clubs"],
        queryFn: () => listClubs({ limit: 50 }),
    });
    const clubs = clubsQuery.data ?? [];

    const followedIds =
        segment === "clubs"
            ? followedClubs
            : segment === "teams"
              ? followedTeams
              : followedPlayers;

    const onToggleFollow =
        segment === "clubs"
            ? toggleFollowClub
            : segment === "teams"
              ? toggleFollowTeam
              : toggleFollowPlayer;

    const onBack = () => navigation.goBack();

    return (
        <OnboardingSearchView
            segment={segment}
            followedIds={followedIds}
            onToggleFollow={onToggleFollow}
            onBack={onBack}
            clubs={clubs}
        />
    );
}
