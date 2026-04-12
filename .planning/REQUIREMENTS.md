# Requirements: Klesstinn Rally

**Defined:** 2026-04-12
**Core Value:** The race → earn → upgrade → race loop must feel satisfying and rewarding from the very first race.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Track & Movement

- [ ] **TRCK-01**: Square track with ~20 spaces rendered top-down, 4 corners clearly marked
- [ ] **TRCK-02**: All 4 cars (1 player, 3 AI) visible and positioned on track at all times
- [ ] **TRCK-03**: Simultaneous turns — all 4 cars roll and move each round
- [ ] **TRCK-04**: Engine dice determines movement distance (range set by engine upgrade tier)
- [ ] **TRCK-05**: Corner tire check — tire dice rolled at each corner; low roll reduces movement for that segment
- [ ] **TRCK-06**: Two laps per race; race ends when first car completes 2 laps

### Race UI

- [ ] **RACEUI-01**: Live position indicator (1st/2nd/3rd/4th) updating each round
- [ ] **RACEUI-02**: Lap counter visible at all times ("Lap 1 of 2")
- [ ] **RACEUI-03**: Race end screen showing final positions and prize money per racer

### Economy

- [ ] **ECON-01**: Prize money awarded by finishing position (1st=400, 2nd=250, 3rd=150, 4th=75)
- [ ] **ECON-02**: Current balance displayed at all times during shop
- [ ] **ECON-03**: Starting cash of 100 before first race
- [ ] **ECON-04**: Upgrade shop between races — buy engine or tire upgrades
- [ ] **ECON-05**: 5 upgrade tiers for engine, each increasing movement dice range
- [ ] **ECON-06**: 5 upgrade tiers for tires, each reducing corner penalty severity
- [ ] **ECON-07**: Upgrade cost and effect clearly shown (dice range before/after)

### AI

- [ ] **AI-01**: 3 AI opponents that race alongside the player
- [ ] **AI-02**: AI spends money on upgrades between races when they can afford them

### Platform

- [ ] **PLAT-01**: Pixel art visual style (8/16-bit retro) for cars, track, and UI elements
- [x] **PLAT-02**: Responsive layout — playable on mobile portrait (375px+) and desktop
- [x] **PLAT-03**: Endless mode — "Race again" after each race, no fixed season end
- [ ] **PLAT-04**: Readable at a glance — large text, clear icons, no complex menus

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Polish & Feel

- **FEEL-01**: Animated dice roll — satisfying physical-feeling animation
- **FEEL-02**: Sound effects — dice roll, movement, corner penalty, win fanfare
- **FEEL-03**: Turn result feedback — per-turn callout showing what happened
- **FEEL-04**: Race-start countdown sequence ("3-2-1-GO!")
- **FEEL-05**: Car sprite variants — distinct pixel art cars for each AI

### Advanced Features

- **ADV-01**: Turn recap summary panel at end of each round
- **ADV-02**: Upgrade preview animation — show dice rolling with new range before purchase
- **ADV-03**: Named AI opponents with personality

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Multiplayer | Requires backend, matchmaking, latency handling — V1 is single player |
| Tile events | Creates rules complexity exceeding cognitive load for 7-year-olds |
| Tire degradation | Mid-race stat tracking adds hidden penalty frustration for kids |
| Sabotage mechanics | Negative interactions frustrate young players |
| Leaderboards/accounts | Requires backend; COPPA concerns for under-13 |
| Gear shifting | Layers extra decision per turn with no payoff for target audience |
| Camera follow / animated track | Loses the board-game overview where all cars are visible |
| Complex AI difficulty settings | Settings menus add cognitive overhead before play begins |
| Season/championship mode | Competes with endless simplicity |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| TRCK-01 | Phase 1 | Pending |
| TRCK-02 | Phase 1 | Pending |
| TRCK-03 | Phase 1 | Pending |
| TRCK-04 | Phase 1 | Pending |
| TRCK-05 | Phase 1 | Pending |
| TRCK-06 | Phase 1 | Pending |
| RACEUI-01 | Phase 1 | Pending |
| RACEUI-02 | Phase 1 | Pending |
| RACEUI-03 | Phase 1 | Pending |
| ECON-01 | Phase 2 | Pending |
| ECON-02 | Phase 2 | Pending |
| ECON-03 | Phase 2 | Pending |
| ECON-04 | Phase 2 | Pending |
| ECON-05 | Phase 2 | Pending |
| ECON-06 | Phase 2 | Pending |
| ECON-07 | Phase 2 | Pending |
| AI-01 | Phase 2 | Pending |
| AI-02 | Phase 2 | Pending |
| PLAT-01 | Phase 3 | Pending |
| PLAT-02 | Phase 3 | Complete |
| PLAT-03 | Phase 3 | Complete |
| PLAT-04 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 22 total
- Mapped to phases: 22
- Unmapped: 0

---
*Requirements defined: 2026-04-12*
*Last updated: 2026-04-12 after roadmap creation*
