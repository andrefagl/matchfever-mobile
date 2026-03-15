import { apiClient } from "@/lib/api-client";

export interface ListTeamsParams {
    q?: string;
    limit?: number;
}

export interface ApiTeam {
    id: string;
    name: string;
    /** Full display: "Club - Escalão". If missing, derived from club + escalao. */
    acronym?: string | null;
    clubId?: string;
    /** Age group / level only (e.g. "Sub-15"). From API as escalao or team_escalao. */
    escalao?: string | null;
    /** Logo/avatar URL for display */
    logo?: string | null;
}

export function listTeams(params?: ListTeamsParams) {
    return apiClient
        .get<ApiTeam[]>("/teams", { params })
        .then((r) => {
            const data = (r.data ?? []) as Array<
                ApiTeam & {
                    team_escalao?: string;
                    escalao?: string;
                    logo?: string;
                    team_logo?: string;
                }
            >;
            return data.map((t) => ({
                ...t,
                escalao: t.escalao ?? t.team_escalao ?? undefined,
                logo: t.logo ?? t.team_logo ?? undefined,
            })) as ApiTeam[];
        });
}
