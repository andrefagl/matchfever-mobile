# Matchfever MVP Plan

## Vision & product goal

- **Goal:** Assist football formation clubs to create and participate in football tournaments. In practice: a **Flashscore for youth tournaments**.
- **Two-sided value:**
    - **Clubs:** Create and manage tournaments; real-time game sheets; multiple formats; staff; invitations.
    - **General users:** Real-time classification tables, live scores, clubs/teams/players data and statistics.

**Risks to solve early:** Data quality in real time; low friction for match reporting; cold start (no tournaments = weak value).

---

## Cold start strategy

- **Preloaded data:** Portuguese football federation (FPF) data already scraped and imported: Clubs, Teams, Players. Teams are available for tournament creation.
- **Launch wedge:** Kids’ team director runs real yearly tournaments → create real tournaments before public release → immediate real data, organizer feedback, low cold-start risk, social proof.

---

## Product decisions

### Shared Tournaments view for everyone

- **Decision:** One Tournaments screen for all users (no separate “organizer view”). A user becomes an organizer when they create a tournament.
- **Rationale:** Single surface, no role switching, better discoverability, simpler IA for V1.
- **Caveat:** Organizer actions (Create, Manage, control sheet) must be **capability-based**: only show when the user owns or staffs the tournament. Avoid mixing generic and organizer CTAs in the same card without context.
- **Segments:** In Tournaments, use **All | Following | Mine** so “my tournaments” is reachable from the main screen without hiding it only in profile.

---

## Tournament prioritization (what to show first)

When many tournaments exist, **never show an unfiltered dump**. Apply this order:

1. **Live + user connection** — Tournaments where the user is organizer/staff/following **and** they’re live now.
2. **Live + near me** — Live tournaments geographically close.
3. **Live + any** — Any other live tournaments.
4. **Happening today (upcoming)** — By proximity, then following.
5. **Following (future)** — Bookmarked tournaments, by start date.
6. **Rest** — Upcoming by start date + proximity.

**Rule:** `live > personal connection > proximity > recency`.

**Featured game on live cards:** Prefer (1) game where user’s team plays, (2) most recent event, (3) closest score, (4) earliest kick-off.

---

## Tournaments screen structure (what to show)

1. **Live** — Always at top if there are live tournaments. Horizontal carousel; each card: tournament name, organizer, featured game (teams, score, minute), “X games live”.
2. **Today** — Tournaments starting today. List or compact cards. If none, show “Nothing today” or hide section and lead with Upcoming.
3. **Upcoming** — Next days/weeks. List; badge = start date (consistent).
4. **Near me** — By distance. Carousel or list; distance + date range + team count.
5. **Following** — Only when user has followed items. Silent when empty.

**Top half of the screen:** Answer “what’s happening right now?” in under ~2 seconds (live strip + one featured card). Rest is discovery below.

---

## V1 execution plan

### Phase 0 — Foundations (1–2 days)

- Define shared domain contracts (mobile + API): `Tournament`, `TournamentTeam`, `Match`, `MatchEvent`, `Standing`, `TournamentFormat`, `MatchStatus`.
- Add typed API client in mobile (`lib/api-client.ts` or similar).
- Env: API base URL, auth cookie/session handling.

### Phase 1 — API surface for V1 (4–6 days)

Implement in `matchfever-api`:

- `POST /tournaments`
- `GET /tournaments` (filters: `status`, `nearMe`, `live`)
- `GET /tournaments/:id`
- `POST /tournaments/:id/teams`
- `POST /tournaments/:id/fixtures:generate`
- `GET /tournaments/:id/matches`
- `PATCH /matches/:id/status`
- `POST /matches/:id/events`
- `GET /matches/:id/events`
- `GET /tournaments/:id/standings`

### Phase 2 — Fixture & standings logic (2–4 days)

- Fixture generators: `ROUND_ROBIN`, `KNOCKOUT`, `GROUPS` (single round within groups for V1).
- Standings: source of truth = finished `matches`; tiebreakers V1: `points > gd > gf`.

### Phase 3 — Mobile organizer flow (4–6 days)

- Tournaments hub (live / near me / promoted).
- Create tournament.
- Select teams.
- Generate fixtures.
- Match control sheet (start/pause/end, goals, cards, score).

### Phase 4 — Mobile public flow (3–5 days)

- Tournament detail: tabs **Matches**, **Standings**, **Teams**.
- Live match card updates (polling first; WebSocket in V1.1).

---

## Schema tweaks (API repo)

- Add `stageId` + `roundNumber` + `displayOrder` to `matches`.
- Add `stage` table (`GROUP`, `KNOCKOUT`, `LEAGUE`).
- Standings uniqueness: e.g. `(tournament_id, team_id, group_label)`.

---

## Data model (high level)

- **Backend (matchfever-api):** Drizzle + Postgres/PostGIS. Tables: `tournaments`, `tournament_teams`, `matches`, `match_events`, `standings`, `match_players`, `match_stats`, `tournament_change_requests`, social follow tables. Enums: `tournament_status`, `match_status`, `match_event_type`, formats. Seed imports FPF data (clubs, teams, players).

---

## Current state (as of this plan)

- **Mobile:** Auth (better-auth, email OTP, set name). App shell with native tabs (Home, Tournaments, Account, Search). **Tournaments screen implemented** with mock data: segments All | Following | Mine; sections Live (carousel), Today, Upcoming, Near Me, Following; light theme; design in `design/ideation.pen` and theme variables in `components/ui/gluestack-ui-provider/config.ts`.
- **API:** Schema and seed in place; API routes for V1 still to be implemented and wired to mobile.

---

## Design references

- **Design file:** `design/ideation.pen` (Pencil). Variables and themes for light/dark; Tournaments screen (All), plus variants for Following and Mine tabs.
- **Theme (mobile):** `components/ui/gluestack-ui-provider/config.ts` — coral accent, neutrals, semantic colors for badges and states.
