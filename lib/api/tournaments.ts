import { apiClient } from "@/lib/api-client";

export interface ListTournamentsParams {
    status?: string;
    live?: boolean;
    nearMe?: boolean;
    lat?: number;
    lon?: number;
}

export interface CreateTournamentBody {
    name: string;
    formatType: string;
    halfDurationMinutes?: number;
    numberOfHalves?: number;
    location?: string;
    lat?: number;
    lon?: number;
    season?: string;
    startDate?: string;
    endDate?: string;
}

export interface AddTeamsBody {
    teamIds?: string[];
    teamId?: string;
    groupLabel?: string;
}

export function listTournaments(params?: ListTournamentsParams) {
    return apiClient.get("/tournaments", { params }).then((r) => r.data);
}

export function getTournament(id: string) {
    return apiClient.get(`/tournaments/${id}`).then((r) => r.data);
}

export function createTournament(body: CreateTournamentBody) {
    return apiClient.post("/tournaments", body).then((r) => r.data);
}

export function listTournamentMatches(tournamentId: string) {
    return apiClient
        .get(`/tournaments/${tournamentId}/matches`)
        .then((r) => r.data);
}

export function listTournamentStandings(tournamentId: string) {
    return apiClient
        .get(`/tournaments/${tournamentId}/standings`)
        .then((r) => r.data);
}

export function listTournamentTeams(tournamentId: string) {
    return apiClient
        .get(`/tournaments/${tournamentId}/teams`)
        .then((r) => r.data);
}

export function addTeamsToTournament(
    tournamentId: string,
    body: AddTeamsBody
) {
    return apiClient
        .post(`/tournaments/${tournamentId}/teams`, body)
        .then((r) => r.data);
}

export function generateTournamentFixtures(tournamentId: string) {
    return apiClient
        .post(`/tournaments/${tournamentId}/fixtures:generate`)
        .then((r) => r.data);
}

/** Response shape from GET /tournaments/hot-live-matches (one featured live match per tournament). */
export interface HotLiveGameItem {
    tournament: {
        id: string;
        name: string;
        status?: string;
        startDate?: string;
        endDate?: string;
        location?: string;
        ownerUserId?: string;
        ownerOrganizationId?: string | null;
        liveMatchesCount?: number;
        /** Duration of one half in minutes (e.g. 45). API may send snake_case or camelCase. */
        half_duration_minutes?: number;
        halfDurationMinutes?: number;
        /** Number of halves (e.g. 2). Total regulation = half_duration_minutes * number_of_halves. */
        number_of_halves?: number;
        numberOfHalves?: number;
        [key: string]: unknown;
    };
    match: {
        id: string;
        tournamentId: string;
        homeTeamId: string;
        awayTeamId: string;
        status: string;
        startTime?: string;
        minute: number | null;
        /** Stoppage/added minutes after 90 (e.g. 3 for "90+3'"). */
        extraMinute?: number | null;
        scoreHome: number | null;
        scoreAway: number | null;
        homeTeamAcronym?: string;
        awayTeamAcronym?: string;
        homeTeamName?: string;
        awayTeamName?: string;
        [key: string]: unknown;
    };
}

export function listHotLiveGames() {
    return apiClient
        .get<HotLiveGameItem[]>("/tournaments/hot-live-matches")
        .then((r) => r.data);
}
