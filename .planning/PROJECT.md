# Klesstinn Rally

## What This Is

A browser-based turn-based rally racing game with pixel art visuals. Four competitors (one human, three AI) race around a square track, rolling dice for movement and navigating corners. Players earn prize money based on finishing position and spend it on engine and tire upgrades between races. Designed for kids aged 7–13, playable on both mobile and desktop.

## Core Value

The race → earn → upgrade → race loop must feel satisfying and rewarding from the very first race. If the core loop isn't fun, nothing else matters.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Square track with ~20 spaces, 4 corners, 2 laps per race
- [ ] Simultaneous turns — all 4 players roll and move each round
- [ ] Engine dice determines movement range (varies by upgrade tier)
- [ ] Tire dice at corners — low rolls reduce movement for that segment
- [ ] 5 upgrade tiers for engine (affects movement dice range)
- [ ] 5 upgrade tiers for tires (affects corner penalty severity)
- [ ] Prize money by position: 1st=400, 2nd=250, 3rd=150, 4th=75
- [ ] Starting cash of 100 (enough for one cheap upgrade)
- [ ] Upgrade shop between races
- [ ] 3 AI opponents with simple upgrade-spending logic
- [ ] Endless mode — keep racing indefinitely
- [ ] Pixel art visual style
- [ ] Animated dice rolls that feel satisfying
- [ ] Clear position tracking during races
- [ ] Responsive layout — works on mobile and desktop
- [ ] Readable at a glance for young players

### Out of Scope

- Multiplayer — V1 is single player only
- Tile events — no special track tiles beyond corners
- Tire degradation — tires don't wear out during a race
- Sabotage mechanics — no player interaction beyond racing
- Connection to Klesstann — this is a separate game, no shared data
- Leaderboards/accounts — no persistence beyond the current session

## Context

- Part of the Benni-Games repository which also contains the Klesstann car-building game
- Klesstinn Rally is a separate game with no shared state or mechanics with Klesstann
- Target audience is kids 7–13, so UI must be bold, clear, and immediately understandable
- Pixel art aesthetic — retro 8/16-bit feel
- Track is a square circuit: 4 straight sections connected by 4 corners
- Corners are the strategic element — good tires reduce corner penalties
- Engine upgrades increase movement range, tires reduce corner risk
- AI doesn't need sophisticated strategy — just needs to spend money on upgrades when affordable

## Constraints

- **Platform**: Browser-only, must work on mobile and desktop
- **Audience**: Kids 7–13 — large text, clear visuals, no complex menus
- **Scope**: V1 core loop only — no feature creep beyond race/earn/upgrade
- **Persistence**: Session-only, no backend or accounts needed

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| ~20-space short track | Fast games suited for younger kids, ~4-6 rounds per lap | — Pending |
| 5 upgrade tiers | Granular progression that rewards multiple races | — Pending |
| 100 starting cash | Enough for one cheap upgrade before first race | — Pending |
| Endless mode (no fixed season) | Let kids play as long as they want, no pressure | — Pending |
| Pixel art style | Retro aesthetic that appeals to target age group | — Pending |
| Separate from Klesstann | Different game concept, no shared state needed | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-12 after initialization*
