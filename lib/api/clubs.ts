import { apiClient } from "@/lib/api-client";

export interface ListClubsParams {
    q?: string;
    limit?: number;
}

export interface ApiClub {
    id: string;
    name: string;
    shortName?: string | null;
    logo?: string | null;
}

export function listClubs(params?: ListClubsParams) {
    return apiClient
        .get<ApiClub[]>("/clubs", { params })
        .then((r) => r.data);
}
