import { apiClient } from "@/lib/api-client";

export interface ListPlayersParams {
    q?: string;
    limit?: number;
    /** Only players in these teams (for "From your teams" tab) */
    teamIds?: string[];
    /** Exclude players in these teams (for "Other players" tab) */
    excludeTeamIds?: string[];
}

export interface ApiPlayer {
    id: string;
    name: string;
    /** Team this player belongs to (when fetched with teamIds) */
    teamId?: string | null;
    /** Avatar/photo URL for display */
    avatarUrl?: string | null;
    /** Optional: if API returns separate fields, used for display */
    firstName?: string | null;
    lastName?: string | null;
    position?: string | null;
    dob?: string | null;
}

export function listPlayers(params?: ListPlayersParams) {
    const { teamIds, excludeTeamIds, ...rest } = params ?? {};
    const apiParams: Record<string, unknown> = { ...rest };
    if (teamIds?.length) {
        apiParams.teamIds = teamIds.join(",");
    }
    if (excludeTeamIds?.length) {
        apiParams.excludeTeamIds = excludeTeamIds.join(",");
    }
    return apiClient
        .get<ApiPlayer[]>("/players", { params: apiParams })
        .then((r) => {
            const data = (r.data ?? []) as Array<
                ApiPlayer & {
                    first_name?: string;
                    last_name?: string;
                    team_id?: string;
                    avatar_url?: string;
                    photo_url?: string;
                }
            >;
            return data.map((p) => {
                const firstName = p.firstName ?? p.first_name;
                const lastName = p.lastName ?? p.last_name;
                return {
                    ...p,
                    teamId: p.teamId ?? p.team_id ?? undefined,
                    avatarUrl: p.avatarUrl ?? p.avatar_url ?? p.photo_url ?? undefined,
                    firstName: firstName ?? undefined,
                    lastName: lastName ?? undefined,
                    name: p.name ?? [firstName, lastName].filter(Boolean).join(" "),
                } as ApiPlayer;
            });
        });
}
