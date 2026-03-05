import type { HotLiveGameItem } from "@/lib/api/tournaments";
import type {
    LiveTournament,
    TodayTournament,
    UpcomingTournament,
    NearMeTournament,
    FollowingTournament,
    TournamentsMockData,
} from "@/lib/mock-tournaments";

/** Organizer/creator entity (club or user). API can send this instead of or in addition to organizerName. */
export interface ApiOrganizer {
    id?: string;
    name: string;
}

/** Featured live match for the tournament card. */
export interface ApiFeaturedGame {
    homeTeamAbbr?: string;
    awayTeamAbbr?: string;
    homeTeamName?: string;
    awayTeamName?: string;
    scoreHome?: number;
    scoreAway?: number;
    minute?: number;
    gamesLiveInTournament?: number;
}

/** Permissive type for tournament objects returned by the API. */
export interface ApiTournament {
    id: string;
    name: string;
    status?: string;
    live?: boolean;
    startDate?: string;
    endDate?: string;
    location?: string;
    lat?: number;
    lon?: number;
    /** Display name of the organizer (club/user). Prefer this if API only sends a string. */
    organizerName?: string;
    /** Full organizer entity. If present, organizerName is derived from organizer.name. */
    organizer?: ApiOrganizer;
    teamCount?: number;
    distance?: string | number;
    featuredGame?: ApiFeaturedGame;
}

function formatDateRange(start?: string, end?: string): string {
    if (!start) return "—";
    if (!end || start === end) return start;
    return `${start} – ${end}`;
}

function getOrganizerName(t: ApiTournament): string {
    if (t.organizer?.name) return t.organizer.name;
    return t.organizerName ?? "—";
}

/**
 * For LIVE matches, compute current minute from elapsed time (now - startTime).
 * If elapsed > 90 minutes, use the API's minute (e.g. extra time, stoppages).
 * Otherwise use the API's minute when status is not LIVE.
 */
function getDisplayMinute(
    status: string,
    startTime: string | undefined,
    apiMinute: number | null
): number {
    if (status === "LIVE" && startTime) {
        const start = new Date(startTime).getTime();
        const elapsedMs = Date.now() - start;
        const elapsedMinutes = Math.floor(elapsedMs / (60 * 1000));
        if (elapsedMinutes <= 90) {
            return Math.max(0, elapsedMinutes);
        }
        return apiMinute ?? 90;
    }
    return apiMinute ?? 0;
}

/**
 * Maps GET /tournaments/hot-live-matches response to the format used for the Live section.
 * Each item is one tournament + one featured match, ready for the carousel.
 */
export function mapHotLiveGamesToLiveList(
    raw: HotLiveGameItem[] | undefined
): ApiTournament[] {
    if (!Array.isArray(raw)) return [];
    return raw.map(({ tournament, match }) => ({
        id: tournament.id,
        name: tournament.name,
        organizerName: undefined,
        featuredGame: {
            homeTeamAbbr: match.homeTeamAcronym ?? match.homeTeamName,
            awayTeamAbbr: match.awayTeamAcronym ?? match.awayTeamName,
            homeTeamName: match.homeTeamName,
            awayTeamName: match.awayTeamName,
            scoreHome: match.scoreHome ?? 0,
            scoreAway: match.scoreAway ?? 0,
            minute: getDisplayMinute(
                match.status,
                match.startTime,
                match.minute
            ),
            gamesLiveInTournament: tournament.liveMatchesCount ?? 1,
        },
    }));
}

function toLiveTournament(t: ApiTournament): LiveTournament {
    const g = t.featuredGame;
    const abbr = (s: string | undefined) => (s?.trim() ? s : "—");
    return {
        id: t.id,
        name: t.name ?? "—",
        organizerName: getOrganizerName(t),
        featuredGame: {
            homeTeamAbbr: abbr(g?.homeTeamAbbr ?? g?.homeTeamName),
            awayTeamAbbr: abbr(g?.awayTeamAbbr ?? g?.awayTeamName),
            scoreHome: g?.scoreHome ?? 0,
            scoreAway: g?.scoreAway ?? 0,
            minute: g?.minute ?? 0,
            gamesLiveInTournament: g?.gamesLiveInTournament ?? 0,
        },
    };
}

function toTodayTournament(t: ApiTournament): TodayTournament {
    const start = t.startDate;
    const isToday = start?.startsWith(new Date().toISOString().slice(0, 10));
    return {
        id: t.id,
        name: t.name ?? "—",
        organizerName: getOrganizerName(t),
        startTime: start ?? "—",
        badge: isToday ? "today" : "starting_soon",
    };
}

function toUpcomingTournament(t: ApiTournament): UpcomingTournament {
    return {
        id: t.id,
        name: t.name ?? "—",
        organizerName: getOrganizerName(t),
        dateRange: formatDateRange(t.startDate, t.endDate),
    };
}

function toNearMeTournament(t: ApiTournament): NearMeTournament {
    const distance =
        typeof t.distance === "number"
            ? `${t.distance} km`
            : t.distance ?? "—";
    return {
        id: t.id,
        name: t.name ?? "—",
        distance: String(distance),
        dateRange: formatDateRange(t.startDate, t.endDate),
        teamCount: t.teamCount ?? 0,
    };
}

function toFollowingTournament(t: ApiTournament): FollowingTournament {
    return {
        id: t.id,
        name: t.name ?? "—",
        organizerName: getOrganizerName(t),
        dateRange: formatDateRange(t.startDate, t.endDate),
        teamCount: t.teamCount ?? 0,
    };
}

function ensureArray(value: unknown): ApiTournament[] {
    if (Array.isArray(value)) {
        return value.filter(
            (x): x is ApiTournament =>
                x != null && typeof x === "object" && "id" in x && "name" in x
        );
    }
    if (value && typeof value === "object" && "data" in value) {
        return ensureArray((value as { data: unknown }).data);
    }
    if (value && typeof value === "object" && "tournaments" in value) {
        return ensureArray((value as { tournaments: unknown }).tournaments);
    }
    return [];
}

const todayStart = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString().slice(0, 10);
};
const todayEnd = () => {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return d.toISOString().slice(0, 10);
};

/**
 * Maps raw API list responses into the UI section shape (live, today, upcoming, nearMe, following).
 * Pass the response from listTournaments() as-is; supports array or { data: [] } / { tournaments: [] }.
 */
export function mapApiTournamentsToSections(options: {
    liveList?: unknown;
    allList?: unknown;
    nearMeList?: unknown;
    followingList?: unknown;
}): TournamentsMockData {
    const liveRaw = ensureArray(options.liveList);
    const live = liveRaw.map(toLiveTournament);
    const all = ensureArray(options.allList);
    const nearMe = ensureArray(options.nearMeList).map(toNearMeTournament);
    const following = ensureArray(options.followingList).map(
        toFollowingTournament
    );

    const start = todayStart();
    const end = todayEnd();
    const today: TodayTournament[] = [];
    const upcoming: UpcomingTournament[] = [];

    for (const t of all) {
        const date = t.startDate?.slice(0, 10);
        if (!date) {
            upcoming.push(toUpcomingTournament(t));
            continue;
        }
        if (date >= start && date <= end) {
            today.push(toTodayTournament(t));
        } else if (date > end) {
            upcoming.push(toUpcomingTournament(t));
        }
    }

    return {
        live,
        today,
        upcoming,
        nearMe,
        following,
    };
}
