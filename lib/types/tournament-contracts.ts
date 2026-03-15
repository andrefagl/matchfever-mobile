/**
 * Canonical tournament UI and API contracts for mobile + API alignment.
 * Re-export from single source of truth; avoid ad-hoc shapes in components.
 */

export type {
    TabId,
    LiveTournament,
    LiveGame,
    TodayTournament,
    UpcomingTournament,
    NearMeTournament,
    FollowingTournament,
    TournamentsMockData,
} from "@/lib/mock-tournaments";

export type {
    ListTournamentsParams,
    CreateTournamentBody,
    AddTeamsBody,
    HotLiveGameItem,
} from "@/lib/api/tournaments";

export type {
    ApiTournament,
    ApiOrganizer,
    ApiFeaturedGame,
} from "@/lib/api/map-tournaments";
