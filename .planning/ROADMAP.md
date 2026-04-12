# Roadmap: Klesstinn Rally

## Overview

Three phases deliver the race → earn → upgrade → race loop. Phase 1 builds the race engine: track, dice movement, corners, and lap counting, so a complete race can be run. Phase 2 adds the economy loop: prize money, the upgrade shop, and the three AI opponents who also spend and upgrade. Phase 3 finishes the product: pixel art visuals, responsive layout, and the endless-race flow that keeps kids playing.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Race Engine** - A complete race runs from start to finish with movement, corners, and lap tracking
- [ ] **Phase 2: Economy Loop** - Prize money, upgrade shop, and AI opponents close the earn-upgrade-race loop
- [ ] **Phase 3: Platform & Feel** - Pixel art visuals, responsive layout, and endless-race flow ship the product

## Phase Details

### Phase 1: Race Engine
**Goal**: A full race can be run from start to finish — four cars on track, dice-driven movement, corner tire checks, lap counting, and a results screen
**Depends on**: Nothing (first phase)
**Requirements**: TRCK-01, TRCK-02, TRCK-03, TRCK-04, TRCK-05, TRCK-06, RACEUI-01, RACEUI-02, RACEUI-03
**Success Criteria** (what must be TRUE):
  1. A square track with ~20 spaces and 4 marked corners is rendered and all 4 cars are visible on it
  2. Each round, all 4 cars roll engine dice and advance; a car rolling at a corner also rolls a tire dice and the lower roll reduces movement
  3. The race completes after two laps; the first car to finish triggers the race-end condition
  4. Live position (1st/2nd/3rd/4th) and current lap ("Lap 1 of 2") update correctly each round
  5. A results screen shows final finishing order and the prize money each racer earned
**Plans**: TBD
**UI hint**: yes

### Phase 2: Economy Loop
**Goal**: Players and AI earn prize money, visit the upgrade shop between races, and buy engine or tire upgrades that change how the next race plays
**Depends on**: Phase 1
**Requirements**: ECON-01, ECON-02, ECON-03, ECON-04, ECON-05, ECON-06, ECON-07, AI-01, AI-02
**Success Criteria** (what must be TRUE):
  1. After a race, each racer receives prize money by finishing position (1st=400, 2nd=250, 3rd=150, 4th=75)
  2. Player starts with 100 cash before the first race
  3. Between races the player sees a shop with engine and tire upgrades showing current dice range, upgraded dice range, and cost
  4. Buying an upgrade deducts its cost from the player's balance and the new dice range takes effect in the next race
  5. Three AI opponents automatically spend their money on upgrades they can afford between races
**Plans**: TBD
**UI hint**: yes

### Phase 3: Platform & Feel
**Goal**: The game looks and feels like a finished pixel art product, works on phones and desktops, and loops indefinitely without a dead end
**Depends on**: Phase 2
**Requirements**: PLAT-01, PLAT-02, PLAT-03, PLAT-04
**Success Criteria** (what must be TRUE):
  1. Cars, track, UI elements, and shop all use a consistent 8/16-bit pixel art visual style
  2. The game is fully playable in portrait on a 375px-wide phone screen with no broken layouts
  3. After any race result screen, a "Race again" action starts a new race with current upgrades — there is no hard stop
  4. A 7-year-old can understand the current position, lap, balance, and upgrade choices at a glance without reading instructions
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Race Engine | 0/? | Not started | - |
| 2. Economy Loop | 0/? | Not started | - |
| 3. Platform & Feel | 0/? | Not started | - |
