import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    listTournaments,
    listHotLiveGames,
    getTournament,
    createTournament,
    listTournamentMatches,
    listTournamentStandings,
    type ListTournamentsParams,
    type CreateTournamentBody,
} from "@/lib/api/tournaments";
import {
    mapApiTournamentsToSections,
    mapHotLiveGamesToLiveList,
} from "@/lib/api/map-tournaments";
import type { TournamentsMockData } from "@/lib/mock-tournaments";

const tournamentKeysBase = ["tournaments"] as const;
export const tournamentKeys = {
    all: tournamentKeysBase,
    list: (params?: ListTournamentsParams) =>
        [...tournamentKeysBase, "list", params] as const,
    hotLiveGames: [...tournamentKeysBase, "hot-live-matches"] as const,
    detail: (id: string) => [...tournamentKeysBase, "detail", id] as const,
    matches: (id: string) =>
        [...tournamentKeysBase, "detail", id, "matches"] as const,
    standings: (id: string) =>
        [...tournamentKeysBase, "detail", id, "standings"] as const,
};

export function useTournaments(
    params?: ListTournamentsParams,
    enabled = true
) {
    return useQuery({
        queryKey: tournamentKeys.list(params),
        queryFn: () => listTournaments(params),
        enabled,
    });
}

export function useHotLiveGames(enabled = true) {
    return useQuery({
        queryKey: tournamentKeys.hotLiveGames,
        queryFn: () => listHotLiveGames(),
        enabled,
    });
}

/** Fetches live + all (and optionally nearMe) and returns UI section data. */
export function useTournamentsSections(options?: {
    /** When false, no requests are made (e.g. until tab is focused). */
    enabled?: boolean;
    nearMe?: boolean;
    lat?: number;
    lon?: number;
}): {
    data: TournamentsMockData;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => void;
} {
    const enabled = options?.enabled !== false;
    const useNearMe =
        Boolean(options?.nearMe && options?.lat != null && options?.lon != null);
    const hotLiveQuery = useHotLiveGames(enabled);
    const allQuery = useTournaments(undefined, enabled);
    const nearMeQuery = useTournaments(
        useNearMe
            ? { nearMe: true, lat: options!.lat!, lon: options!.lon! }
            : undefined,
        enabled && useNearMe
    );

    const liveListMapped = hotLiveQuery.data
        ? mapHotLiveGamesToLiveList(hotLiveQuery.data)
        : undefined;

    const data: TournamentsMockData = mapApiTournamentsToSections({
        liveList: liveListMapped,
        allList: allQuery.data,
        nearMeList: useNearMe ? nearMeQuery.data : undefined,
    });
    const isLoading =
        hotLiveQuery.isLoading ||
        allQuery.isLoading ||
        (useNearMe && nearMeQuery.isLoading);
    const isError = hotLiveQuery.isError || allQuery.isError;
    const error = hotLiveQuery.error ?? allQuery.error ?? null;

    const refetch = () => {
        hotLiveQuery.refetch();
        allQuery.refetch();
        if (useNearMe) nearMeQuery.refetch();
    };

    return { data, isLoading, isError, error: error as Error | null, refetch };
}

export function useTournament(id: string | undefined, enabled = true) {
    return useQuery({
        queryKey: tournamentKeys.detail(id ?? ""),
        queryFn: () => getTournament(id!),
        enabled: Boolean(id) && enabled,
    });
}

export function useTournamentMatches(tournamentId: string | undefined) {
    return useQuery({
        queryKey: tournamentKeys.matches(tournamentId ?? ""),
        queryFn: () => listTournamentMatches(tournamentId!),
        enabled: Boolean(tournamentId),
    });
}

export function useTournamentStandings(tournamentId: string | undefined) {
    return useQuery({
        queryKey: tournamentKeys.standings(tournamentId ?? ""),
        queryFn: () => listTournamentStandings(tournamentId!),
        enabled: Boolean(tournamentId),
    });
}

export function useCreateTournament() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (body: CreateTournamentBody) => createTournament(body),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: tournamentKeysBase });
        },
    });
}
