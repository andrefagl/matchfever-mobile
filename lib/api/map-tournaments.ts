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
    /** Display string for match time (e.g. "45'", "90+3'"). */
    minuteDisplay?: string;
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
 * Total regulation duration in minutes (number_of_halves * half_duration_minutes).
 * Reads snake_case (half_duration_minutes, number_of_halves) or camelCase (halfDurationMinutes, numberOfHalves).
 * Defaults to 90 only when the API omits both forms of these fields.
 */
function getTotalDurationMinutes(tournament: {
    half_duration_minutes?: number;
    halfDurationMinutes?: number;
    number_of_halves?: number;
    numberOfHalves?: number;
}): number {
    const hasHalf =
        tournament.half_duration_minutes != null ||
        tournament.halfDurationMinutes != null;
    const hasHalves =
        tournament.number_of_halves != null ||
        tournament.numberOfHalves != null;
    const half =
        tournament.half_duration_minutes ??
        tournament.halfDurationMinutes ??
        45;
    const halves =
        tournament.number_of_halves ?? tournament.numberOfHalves ?? 2;
    if (__DEV__ && (!hasHalf || !hasHalves)) {
        console.warn(
            "[map-tournaments] Tournament missing half_duration_minutes or number_of_halves, using default 90 min. " +
                "Ensure GET /tournaments/hot-live-matches returns these fields on each tournament."
        );
    }
    return half * halves;
}

/**
 * Format match minute for UI. Extra minutes (e.g. "90+3'") are shown only when the API returns extraMinute.
 * - If API sends extraMinute (e.g. 3), show "{regulation}+3'".
 * - Otherwise show "{minute}'" (or "{regulation}'" when minute > regulation but no extraMinute from API).
 */
function formatMinuteDisplay(
    minute: number,
    extraMinute: number | null | undefined,
    regulationMinutes: number
): string {
    if (extraMinute != null && extraMinute > 0) {
        return `${regulationMinutes}+${extraMinute}'`;
    }
    if (minute > regulationMinutes) {
        return `${regulationMinutes}'`;
    }
    return `${minute}'`;
}

/**
 * For LIVE matches, compute current minute from elapsed time (now - startTime).
 * If elapsed > regulation duration, use the API's minute (e.g. extra time, stoppages).
 * Otherwise use the API's minute when status is not LIVE.
 */
function getDisplayMinute(
    status: string,
    startTime: string | undefined,
    apiMinute: number | null,
    totalDurationMinutes: number
): number {
    if (status === "LIVE" && startTime) {
        const start = new Date(startTime).getTime();
        const elapsedMs = Date.now() - start;
        const elapsedMinutes = Math.floor(elapsedMs / (60 * 1000));
        if (elapsedMinutes <= totalDurationMinutes) {
            return Math.max(0, elapsedMinutes);
        }
        return apiMinute ?? totalDurationMinutes;
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
    return raw.map(({ tournament, match }) => {
        const totalDuration = getTotalDurationMinutes(tournament);
        const minute = getDisplayMinute(
            match.status,
            match.startTime,
            match.minute,
            totalDuration
        );
        return {
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
                minute,
                minuteDisplay: formatMinuteDisplay(
                    minute,
                    match.extraMinute,
                    totalDuration
                ),
                gamesLiveInTournament: tournament.liveMatchesCount ?? 1,
            },
        };
    });
}

function toLiveTournament(t: ApiTournament): LiveTournament {
    const g = t.featuredGame;
    const abbr = (s: string | undefined) => (s?.trim() ? s : "—");
    const minute = g?.minute ?? 0;
    return {
        id: t.id,
        name: t.name ?? "—",
        organizerName: getOrganizerName(t),
        featuredGame: {
            homeTeamAbbr: abbr(g?.homeTeamAbbr ?? g?.homeTeamName),
            awayTeamAbbr: abbr(g?.awayTeamAbbr ?? g?.awayTeamName),
            scoreHome: g?.scoreHome ?? 0,
            scoreAway: g?.scoreAway ?? 0,
            minute,
            minuteDisplay:
                g?.minuteDisplay ??
                formatMinuteDisplay(minute, null, 90),
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
