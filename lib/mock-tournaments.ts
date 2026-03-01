export type TabId = "all" | "following" | "mine";

export interface LiveGame {
    homeTeamAbbr: string;
    awayTeamAbbr: string;
    scoreHome: number;
    scoreAway: number;
    minute: number;
    gamesLiveInTournament: number;
}

export interface LiveTournament {
    id: string;
    name: string;
    organizerName: string;
    featuredGame: LiveGame;
}

export interface TodayTournament {
    id: string;
    name: string;
    organizerName: string;
    startTime: string;
    badge: "today" | "starting_soon";
}

export interface UpcomingTournament {
    id: string;
    name: string;
    organizerName: string;
    dateRange: string;
    badgeLabel?: string;
    badgeVariant?: "date" | "teams";
}

export interface NearMeTournament {
    id: string;
    name: string;
    distance: string;
    dateRange: string;
    teamCount: number;
}

export interface FollowingTournament {
    id: string;
    name: string;
    organizerName: string;
    dateRange: string;
    teamCount: number;
}

export interface TournamentsMockData {
    live: LiveTournament[];
    today: TodayTournament[];
    upcoming: UpcomingTournament[];
    nearMe: NearMeTournament[];
    following: FollowingTournament[];
}

export const MOCK_TOURNAMENTS: TournamentsMockData = {
    live: [
        {
            id: "live-1",
            name: "Academy Trophy U15",
            organizerName: "Sport Lisboa FC",
            featuredGame: {
                homeTeamAbbr: "SLB",
                awayTeamAbbr: "FCP",
                scoreHome: 2,
                scoreAway: 1,
                minute: 45,
                gamesLiveInTournament: 6,
            },
        },
        {
            id: "live-2",
            name: "Liga Juvenil do Porto e Região Norte – Fase Final",
            organizerName: "FC Porto Academy",
            featuredGame: {
                homeTeamAbbr: "BFC",
                awayTeamAbbr: "GDC",
                scoreHome: 0,
                scoreAway: 0,
                minute: 32,
                gamesLiveInTournament: 8,
            },
        },
    ],
    today: [
        {
            id: "today-1",
            name: "Torneio de Verão Sub-14",
            organizerName: "GD Estoril",
            startTime: "15:00",
            badge: "today",
        },
        {
            id: "today-2",
            name: "II Open do Mar Sub-12",
            organizerName: "SL Benfica",
            startTime: "10:30",
            badge: "starting_soon",
        },
    ],
    upcoming: [
        {
            id: "up-1",
            name: "Torneio Internacional de Páscoa",
            organizerName: "Sporting CP",
            dateRange: "Apr 12–Apr 13",
            badgeLabel: "Apr 12",
            badgeVariant: "date",
        },
        {
            id: "up-2",
            name: "Taça Cidade Lisboa Sub-16",
            organizerName: "Associação Lisboa",
            dateRange: "Mar 8–Mar 9",
            badgeLabel: "Mar 8",
            badgeVariant: "date",
        },
    ],
    nearMe: [
        {
            id: "near-1",
            name: "Taça Cidade de Lisboa e Vale do Tejo Sub-16",
            distance: "1.4 km away",
            dateRange: "Mar 8–Mar 9",
            teamCount: 12,
        },
        {
            id: "near-2",
            name: "Torneio Benfiquista",
            distance: "3.2 km away",
            dateRange: "Mar 15",
            teamCount: 8,
        },
    ],
    following: [
        {
            id: "fol-1",
            name: "Torneio Internacional de Páscoa",
            organizerName: "Sporting CP",
            dateRange: "Apr 12–Apr 13",
            teamCount: 16,
        },
        {
            id: "fol-2",
            name: "Academy Trophy U15",
            organizerName: "Sport Lisboa FC",
            dateRange: "Mar 20–Mar 22",
            teamCount: 12,
        },
    ],
};
