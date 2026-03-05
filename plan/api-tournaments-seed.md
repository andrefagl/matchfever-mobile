# API contract & seed data for Tournaments (mobile)

The mobile app expects the following from `GET /tournaments` and `GET /tournaments?live=true`.

## When to show "Live" section

The **Live** section is only shown when the API returns tournaments that have **real live match data**:

- `featuredGame` must be present with:
  - Both teams: `homeTeamAbbr` + `awayTeamAbbr` (or `homeTeamName` + `awayTeamName`)
  - At least one of: `scoreHome`/`scoreAway` or `minute`

If a tournament has `live: true` but no `featuredGame` (or missing teams/scores), it **will not** appear in the Live section; it can still appear in Today/Upcoming if returned by `GET /tournaments` (all).

---

## Recommended tournament payload (for list + live)

Use this shape so the app can show organizer, featured game, and live state correctly.

```json
{
  "id": "tournament-uuid",
  "name": "Academy Trophy U15",
  "live": true,
  "startDate": "2025-03-02T09:00:00.000Z",
  "endDate": "2025-03-02T18:00:00.000Z",
  "location": "Lisboa",
  "teamCount": 8,
  "organizerName": "Sport Lisboa FC",
  "organizer": {
    "id": "org-uuid",
    "name": "Sport Lisboa FC"
  },
  "featuredGame": {
    "homeTeamAbbr": "SLB",
    "awayTeamAbbr": "FCP",
    "homeTeamName": "Sport Lisboa Benfica",
    "awayTeamName": "FC Porto",
    "scoreHome": 2,
    "scoreAway": 1,
    "minute": 45,
    "gamesLiveInTournament": 6
  }
}
```

- **organizerName** or **organizer.name**: shown on the card as the creator/organizer.
- **featuredGame**: required for the Live section.
  - **homeTeamAbbr** / **awayTeamAbbr**: short labels (e.g. SLB, FCP). If omitted, the app falls back to the first 4 characters of `homeTeamName`/`awayTeamName`.
  - **scoreHome**, **scoreAway**, **minute**, **gamesLiveInTournament**: used on the live card.

---

## Example seed (live tournament)

```json
{
  "id": "live-1",
  "name": "Academy Trophy U15",
  "live": true,
  "startDate": "2025-03-02T09:00:00.000Z",
  "endDate": "2025-03-02T18:00:00.000Z",
  "organizerName": "Sport Lisboa FC",
  "organizer": { "id": "org-1", "name": "Sport Lisboa FC" },
  "featuredGame": {
    "homeTeamAbbr": "SLB",
    "awayTeamAbbr": "FCP",
    "scoreHome": 2,
    "scoreAway": 1,
    "minute": 45,
    "gamesLiveInTournament": 6
  }
}
```

---

## Example seed (upcoming tournament, no live)

```json
{
  "id": "upcoming-1",
  "name": "Liga Juvenil – Fase Final",
  "live": false,
  "startDate": "2025-03-10T10:00:00.000Z",
  "endDate": "2025-03-15T18:00:00.000Z",
  "organizerName": "FC Porto Academy",
  "teamCount": 12
}
```

No `featuredGame` → will not appear in the Live section; it will appear in Today or Upcoming depending on `startDate`.

---

## Summary

| Field | Used for | Required for Live section |
|-------|----------|----------------------------|
| `id`, `name` | All cards | ✓ |
| `organizerName` or `organizer.name` | Organizer on card | Recommended |
| `featuredGame` | Live card only | ✓ |
| `featuredGame.homeTeamAbbr` / `awayTeamAbbr` (or names) | Team initials on live card | ✓ |
| `featuredGame.scoreHome` / `scoreAway` / `minute` | Score and minute on live card | At least one of score or minute |
| `featuredGame.gamesLiveInTournament` | "X games live" on live card | Optional |

If there are no tournaments with valid live data, the mobile app does **not** show the Live section and shows Today/Upcoming as normal.
