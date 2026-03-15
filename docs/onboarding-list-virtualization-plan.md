# Onboarding List Virtualization Plan

## Overview

Several onboarding screens render large lists (clubs, teams, players) using `ScrollView` + `.map()`. As datasets grow, this can cause:
- **UI blocking** – All items mount at once, heavy initial render
- **Memory pressure** – Every item stays in memory
- **Scroll jank** – Layout calculations for hundreds of nodes

Virtualization renders only visible items (plus a small buffer), keeping the UI responsive.

---

## Current State

### Lists to Virtualize

| Location | List Type | Structure | Data Source | Est. Size |
|----------|-----------|-----------|--------------|-----------|
| `ClubsScreen` | Flat | Single list | `listClubs({ limit: 50 })` | 50 |
| `TeamsScreen` | Flat × 2 | Two tabs, each flat | `listTeams({ limit: 50 })` | 50 each |
| `PlayersScreen` | **Sectioned** × 2 | Tab 1: by team, Tab 2: by position | `listPlayers(...)` | 50+ each |
| `OnboardingSearchView` | Flat | Single list per segment | clubs/teams/players APIs | 50 each |

### Current Implementation

- **Flat lists**: `ScrollView` + `{data.map(item => <View key={...}>)}`
- **Sectioned lists** (Players): Nested `.map()` – outer over sections, inner over items
- **API limits**: 50 items per request (no pagination yet)

---

## Recommended Approach

### 1. Use `@shopify/flash-list`

**Why FlashList over FlatList:**
- Better performance on React Native (recycler-based)
- Works well with Expo
- Supports both flat and sectioned lists
- Widely used, well maintained

**Install:**
```bash
npx expo install @shopify/flash-list
```

### 2. Component Strategy

| List Type | Component | Notes |
|-----------|-----------|-------|
| Flat (clubs, teams, single-segment search) | `FlashList` | Replace ScrollView + map |
| Sectioned (players by team, players by position) | `FlashList` with `sections` prop | Use `FlashList`'s section API |

### 3. Implementation Order

1. **Extract reusable list item components** – Single source of truth for club/team/player row UI
2. **Virtualize `OnboardingSearchView`** – Simplest case (flat lists, one at a time)
3. **Virtualize `ClubsScreen`** – Flat list
4. **Virtualize `TeamsScreen`** – Two flat lists (one per tab)
5. **Virtualize `PlayersScreen`** – Sectioned lists (most complex)

---

## Detailed Implementation

### Phase 1: Shared List Item Components

Create `components/onboarding/list-items.tsx`:

- `ClubListItem` – avatar, name, follow button
- `TeamListItem` – avatar, name + acronym, follow button  
- `PlayerListItem` – avatar, name, follow button

These will be used by both `FlashList` and any non-virtualized fallbacks. Each must accept `item` and callbacks.

### Phase 2: OnboardingSearchView

**Before:** `ScrollView` with conditional `clubsData.map`, `teamsData.map`, `playersData.map`

**After:** Single `FlashList` that switches `data` / `renderItem` based on `segment`:

```tsx
<FlashList
  data={segment === "clubs" ? clubsData : segment === "teams" ? teamsData : playersData}
  renderItem={({ item }) => <...ListItem item={item} ... />}
  estimatedItemSize={64}
  keyExtractor={(item) => item.id}
/>
```

- Use `estimatedItemSize` ~64 (avatar 40 + padding) for consistent scroll performance
- Empty/loading states: `ListEmptyComponent`

### Phase 3: ClubsScreen

Replace `ScrollView` + `clubs.map` with:

```tsx
<FlashList
  data={clubs}
  renderItem={({ item }) => <ClubListItem item={item} ... />}
  estimatedItemSize={64}
  ListEmptyComponent={...}
  ListHeaderComponent={...} // "Suggested" label
/>
```

### Phase 4: TeamsScreen

Each tab content uses its own `FlashList`:

- Tab "From your clubs": `data={teamsFromClubs}`
- Tab "Other teams": `data={teamsOther}`

`AnimatedTabContent` already switches between two children; each child becomes a `FlashList` instead of `ScrollView`.

### Phase 5: PlayersScreen (Sectioned)

**Tab 1 – From your teams**

Data shape: `[ { teamId, teamName, players: ApiPlayer[] }, ... ]`

```tsx
const sections = playersByTeam(...).map(([teamId, teamName, list]) => ({
  title: teamName,
  data: list,
}));

<FlashList
  sections={sections}
  renderItem={...}
  renderSectionHeader={({ section }) => <SectionHeader title={section.title} />}
  estimatedItemSize={64}
/>
```

**Tab 2 – Other players**

Data shape: `[ { position, players: ApiPlayer[] }, ... ]`

Same pattern with `playersByPosition()`.

---

## FlashList API Notes

- **`estimatedItemSize`** – Not used in FlashList 2.x (auto-measures).
- **`keyExtractor`** – Use `item.id` for clubs/teams/players.
- **`ListEmptyComponent`** – "No clubs found", loading spinner, etc.
- **`ListHeaderComponent`** – Section labels like "Suggested", "Trending".
- **`contentContainerStyle`** – Same padding as current `scrollContent`.
- **`drawDistance`** – Optional; default is fine for most cases.

---

## API / Data Considerations

- **Current limit: 50** – Virtualization helps even at 50 items; more important when limits increase.
- **Future pagination** – If you add infinite scroll, `FlashList` supports `onEndReached` / `onEndReachedThreshold` like `FlatList`.
- **Search** – `OnboardingSearchView` already fetches on debounced search; no change needed for virtualization.

---

## Design File (onboarding.pen)

The `.pen` design file describes the **visual** layout of list items (avatar, text, button). Virtualization is a **runtime** concern in the React Native code. No changes to the design file are required for virtualization itself.

If you want the design to explicitly call out "virtualized list" for documentation, you could add a note/context on the list container frames, but it's optional.

---

## Testing Checklist

- [ ] Clubs list scrolls smoothly with 50+ items
- [ ] Teams tabs both scroll smoothly
- [ ] Players "From your teams" sections render correctly, scroll smoothly
- [ ] Players "Other players" sections render correctly, scroll smoothly
- [ ] Search view (clubs/teams/players) scrolls smoothly
- [ ] Empty states show correctly
- [ ] Loading states show correctly
- [ ] Follow button works on virtualized items
- [ ] Keyboard + search input behavior unchanged

---

## Rollback

If issues arise, each screen can be reverted to `ScrollView` + `.map()` independently. The shared list item components remain useful either way.
