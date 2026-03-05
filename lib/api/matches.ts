import { apiClient } from "@/lib/api-client";

export type MatchStatus = "SCHEDULED" | "LIVE" | "PAUSED" | "FINISHED";

export interface UpdateMatchStatusBody {
    status: MatchStatus;
}

export interface AddMatchEventBody {
    type: string;
    minute?: number;
    extraMinute?: number;
    teamId?: string;
    playerId?: string;
    secondaryPlayerId?: string;
    createdByUserId?: string;
}

export function updateMatchStatus(matchId: string, body: UpdateMatchStatusBody) {
    return apiClient
        .patch(`/matches/${matchId}/status`, body)
        .then((r) => r.data);
}

export function listMatchEvents(matchId: string) {
    return apiClient.get(`/matches/${matchId}/events`).then((r) => r.data);
}

export function addMatchEvent(matchId: string, body: AddMatchEventBody) {
    return apiClient
        .post(`/matches/${matchId}/events`, body)
        .then((r) => r.data);
}
