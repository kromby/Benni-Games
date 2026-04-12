# Klesstann Rally

## What This Is

A browser-based turn-based rally racing game with pixel art visuals. Four competitors (one human, three AI) race around a 20-space square track, rolling dice for movement and navigating corners. Players earn prize money based on finishing position and spend it on engine and tire upgrades between races. Designed for kids aged 7–13, playable on both mobile (375px+) and desktop. v1.0 shipped 2026-04-12.

## Core Value

The race → earn → upgrade → race loop must feel satisfying and rewarding from the very first race. If the core loop isn't fun, nothing else matters.

## Current State

**Shipped: v1.0 MVP (2026-04-12)**

- 1,537 lines of vanilla JS/CSS/HTML, zero dependencies
- 20-space CSS Grid track, 4 cars (1 player + 3 AI), 2-lap races
- 5 upgrade tiers each for engine (dice range) and tires (corner probability)
- Press Start 2P pixel font + PNG car sprites
- Mobile-responsive race view (375px, no scroll needed during race)
- Endless race loop, session-only persistence via localStorage

## Requirements

### Validated

- ✓ Square track with ~20 spaces, 4 corners, 2 laps — v1.0
- ✓ Simultaneous turns — all 4 players roll and move each round — v1.0
- ✓ Engine dice determines movement range (varies by upgrade tier) — v1.0
- ✓ Tire probability check at corners — slow chance reduces movement — v1.0
- ✓ 5 upgrade tiers for engine (affects movement dice range) — v1.0
- ✓ 5 upgrade tiers for tires (affects corner penalty probability) — v1.0
- ✓ Prize money by position: 1st=400, 2nd=250, 3rd=150, 4th=75 — v1.0
- ✓ Starting cash of 100 (enough for one cheap upgrade) — v1.0
- ✓ Upgrade shop between races — v1.0
- ✓ 3 AI opponents with personality-based upgrade-spending logic — v1.0
- ✓ Endless mode — keep racing indefinitely — v1.0
- ✓ Pixel art visual style (Press Start 2P + car sprites) — v1.0
- ✓ Clear position tracking during races — v1.0
- ✓ Responsive layout — works on mobile (375px+) and desktop — v1.0
- ✓ Readable at a glance for young players — v1.0

### Active

(None — start next milestone to define v1.1 requirements)

### Out of Scope

- Multiplayer — V1 is single player only
- Tile events — no special track tiles beyond corners
- Tire degradation — tires don't wear out during a race
- Sabotage mechanics — no player interaction beyond racing
- Connection to Klesstann — this is a separate game, no shared data
- Leaderboards/accounts — no persistence beyond the current session
- Animated dice rolls — deferred to v1.1 (FEEL-01)
- Sound effects — deferred to v1.1 (FEEL-02)
- Car sprite variants for each AI — deferred (FEEL-05)

## Context

- Part of the Benni-Games repository (alongside Klesstann car-building game)
- Zero dependencies — pure HTML/CSS/JS, static hosting, works offline (except Google Fonts CDN)
- Tech debt to address in v1.1: WR-01 null-guard in loadGame, WR-04 600-749px breakpoint gap
- AI upgrade logic uses personalities (engine/tires/balanced) with 20-30% save chance
- Corner penalty is probability-based (not dice), which feels cleaner for kids

## Constraints

- **Platform**: Browser-only, must work on mobile and desktop
- **Audience**: Kids 7–13 — large text, clear visuals, no complex menus
- **Scope**: V1 core loop only — no feature creep beyond race/earn/upgrade
- **Persistence**: Session-only, no backend or accounts needed

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| ~20-space short track | Fast games suited for younger kids, ~4-6 rounds per lap | ✓ Good — races feel snappy |
| 5 upgrade tiers | Granular progression that rewards multiple races | ✓ Good — clear upgrade path |
| 100 starting cash | Enough for one cheap upgrade before first race | ✓ Good — immediate agency |
| Endless mode (no fixed season) | Let kids play as long as they want | ✓ Good — no dead end |
| Pixel art style (Press Start 2P) | Retro aesthetic that appeals to target age group | ✓ Good — strong identity |
| Separate from Klesstann | Different game concept, no shared state needed | ✓ Good — clean separation |
| Probability-based corner penalty | Cleaner than dice formula for kids | ✓ Good — less math visible |
| body.race-active global (not media query) | Viewport lock consistent at all screen sizes | ✓ Good — no scroll on any device |

## Evolution

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-12 after v1.0 milestone*
