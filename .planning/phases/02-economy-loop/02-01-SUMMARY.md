---
phase: 02-economy-loop
plan: 01
subsystem: economy-data-model
tags: [economy, upgrade-tiers, dice-ranges, prize-money, view-management, vanilla-js, iife]

# Dependency graph
requires:
  - 01-01
  - 01-02
provides:
  - "Economy data model: per-car money, engineTier, tireTier; career stats on state"
  - "Upgrade tier constants: UPGRADE_TIERS_ENGINE (5 tiers, min/max), UPGRADE_TIERS_TIRES (probabilities), UPGRADE_COSTS"
  - "Tier-aware race mechanics: rollDieRange, engine dice from tier, corner penalty by probability"
  - "Prize money award on race finish + career stats tracking"
  - "showView() view switching infrastructure"
  - "resetRace() for starting new race without page reload"
  - "HTML skeleton: home-view with stats + nav, shop-view with upgrade cards"
  - "CSS layout: home dashboard, shop cards, mobile responsive overrides"
affects: [02-02]

# Tech tracking
tech-stack:
  added: []
  patterns: [per-entity-upgrade-tiers, probability-based-penalty, view-toggle-pattern, career-stats-accumulation]

key-files:
  created: []
  modified:
    - games/klesstann-rally/game.js
    - games/klesstann-rally/index.html
    - games/klesstann-rally/style.css

key-decisions:
  - "Engine tiers use rollDieRange(min, max) — tier 0 is d3, tier 4 is d3-8 (higher floor at top)"
  - "Tire corner penalty is probability-based (Math.random() < slowChance), not dice-based"
  - "Prize money awarded and career stats updated inside resolveRound when phase becomes finished"
  - "showView() handles all view transitions and saves state on each transition"
  - "Game starts at state.phase = 'home' — no more direct racing start"
  - "loadGame validPhases expanded to ['home', 'racing', 'finished', 'shop']"
  - "Removed dead #restart-btn CSS — replaced by .home-btn / .home-btn-primary classes"

patterns-established:
  - "UPGRADE_TIERS_ENGINE[car.engineTier] lookup pattern for per-car dice range"
  - "UPGRADE_TIERS_TIRES[car.tireTier] probability check at corners"
  - "showView(viewName) toggles hidden class on four view elements, updates header content"

requirements-completed: [ECON-01, ECON-03, ECON-05, ECON-06]

# Metrics
duration: 23min
completed: 2026-04-12
---

# Phase 2 Plan 01: Economy Data Model Summary

**Economy data model with 5-tier engine/tire upgrades, probability-based corner penalty, prize money award on finish, career stats persistence, and HTML/CSS skeleton for home and shop views**

## Performance

- **Duration:** ~23 min
- **Started:** 2026-04-12T17:04:02Z
- **Completed:** 2026-04-12T17:27:19Z
- **Tasks completed:** 2 of 2
- **Files modified:** 3

## Accomplishments

- Replaced ENGINE_DICE_MAX/TIRE_DICE_MAX with UPGRADE_TIERS_ENGINE (5 objects with min/max) and UPGRADE_TIERS_TIRES (5 probabilities)
- Added UPGRADE_COSTS array [0, 75, 150, 300, 500, 800] and STARTING_MONEY = 100
- Added rollDieRange(min, max) for range-aware dice rolls supporting tiers 3-4 floor values
- Extended all 4 car objects with money: STARTING_MONEY, engineTier: 0, tireTier: 0
- Added career object to state: racesCompleted, wins, totalPrizeEarned, placements[4]
- resolveCarMove uses UPGRADE_TIERS_ENGINE[car.engineTier] for dice range per car
- Corner penalty changed from dice-based to probability-based using UPGRADE_TIERS_TIRES[car.tireTier]
- resolveRound awards prize money and updates career stats when race finishes
- Added showView(viewName) toggling hidden class on homeViewEl, trackBoardEl, standingsPanel, rollArea, shopViewEl, resultsScreenEl
- Added resetRace() to reset car positions/laps/finished state and state counters for fresh race
- Updated getSerializableState to include money, engineTier, tireTier per car and career in state
- Updated loadGame with full validation for money (>=0), engineTier (int 0-4), tireTier (int 0-4), career fields
- Updated validPhases to ["home", "racing", "finished", "shop"] with default "home"
- Game starts at state.phase = "home" instead of "racing"
- Added home-view HTML section with 6-stat grid (races, wins, earned, engine, tires, placements) and two nav buttons
- Added shop-view HTML section with two upgrade cards (engine, tires) each with current/next display and buy button
- Changed results screen restart button from "Keppa aftur!" (#restart-btn) to "Heim" (#home-btn-results)
- Added results-inner wrapper to results screen (was already in CSS, now applied in HTML)
- Applied hidden class to track-board, standings-panel, and roll-area (home is initial view)
- CSS: .home-view and .shop-view both use grid-area: board for seamless view switching
- CSS: .stat-grid (3-col), .stat-item, .stat-value, .stat-label for home dashboard
- CSS: .home-btn, .home-btn-primary for all navigation buttons
- CSS: .shop-card, .shop-buy-btn, .shop-maxed for upgrade cards
- CSS mobile breakpoint: shop-cards becomes 1-col, home-view/shop-view become full-width, stat-grid becomes 2-col
- Removed dead #restart-btn CSS rules (replaced by .home-btn classes)

## Task Commits

Each task was committed atomically:

1. **Task 1: Economy constants, tier-aware mechanics, view management** - `50c97b4` (feat)
2. **Task 2: Home-view and shop-view HTML sections plus CSS layout styles** - `eb0c367` (feat)

## Files Created/Modified

- `games/klesstann-rally/game.js` - +164/-31 lines: upgrade tier constants, extended car/state objects, rollDieRange, tier-aware resolveCarMove, probability corner penalty, prize money award in resolveRound, showView(), resetRace(), updated getSerializableState/loadGame, updated bindEvents
- `games/klesstann-rally/index.html` - +50/-4 lines: home-view section, shop-view section, hidden classes on racing elements, results button renamed to home-btn-results
- `games/klesstann-rally/style.css` - +155/-16 lines: home-view layout, stat-grid, home-btn styles, shop-view layout, shop-card styles, mobile overrides, removed #restart-btn dead CSS

## Decisions Made

- `rollDieRange(min, max)` added alongside existing `rollDie(sides)` for backward compat
- Corner slowdown penalty fixed at 1 step (not variable) when triggered — cleaner UX for kids
- Prize money awarded inside `resolveRound` (not in showResults) so career stats are correct at results display
- `showView()` calls `saveGame()` on every transition — ensures phase persists across reload
- Home view stats (stat-races etc.) and shop card content (shop-engine-current etc.) are HTML stubs to be wired in Plan 02-02

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed dead #restart-btn CSS rules**
- **Found during:** Task 2
- **Issue:** style.css had `#restart-btn` and `#restart-btn:hover` rules but the button was renamed to `#home-btn-results` with `.home-btn` class — old CSS was dead code
- **Fix:** Removed the two `#restart-btn` CSS rule blocks; styles are now covered by `.home-btn` and `.home-btn-primary`
- **Files modified:** games/klesstann-rally/style.css
- **Commit:** eb0c367

---

**Total deviations:** 1 auto-fixed (dead CSS cleanup)
**Impact on plan:** None — purely cosmetic cleanup

## Known Stubs

These HTML elements are present but not yet wired to game state — intentional, Plan 02-02 will wire interactivity:

| Element | File | Description |
|---------|------|-------------|
| `#stat-races`, `#stat-wins`, `#stat-earned`, `#stat-engine`, `#stat-tires`, `#stat-placements` | index.html | Home view career stats display — hardcoded "0" / "Stig 0" / "-" defaults |
| `#shop-engine-current`, `#shop-engine-next` | index.html | Shop engine card current tier and next upgrade info |
| `#shop-tires-current`, `#shop-tires-next` | index.html | Shop tire card current tier and next upgrade info |
| `#go-shop-btn`, `#go-race-btn` | index.html | Home navigation buttons — event wired in game.js (showView calls) but home stats not rendered |
| `#buy-engine-btn`, `#buy-tires-btn` | index.html | Shop buy buttons — not yet wired to purchase logic |

Note: `go-shop-btn`, `go-race-btn`, `shop-race-btn`, and `home-btn-results` ARE wired in bindEvents() for view navigation. The stub concern is stat display rendering and shop card content rendering, which Plan 02-02 will implement.

## Threat Model Compliance

- T-02-01 (money tampering): Mitigated — loadGame validates `typeof money === "number" && money >= 0`
- T-02-02 (career stats tampering): Mitigated — loadGame validates all career fields with type and range checks
- T-02-03 (state.phase tampering): Mitigated — validPhases whitelist with "home" as safe default
- T-02-04 (UPGRADE_COSTS bypass): Accepted — client-side single-player game
- T-02-05 (localStorage quota): Accepted — silent catch on save failure

## Issues Encountered

None.

## Next Phase Readiness

- Economy data model fully defined — Plan 02-02 can wire shop buy logic and home stat rendering
- showView() infrastructure ready — all view transitions work via navigation buttons
- resetRace() ready for use when player starts a new race from home or shop
- Career stats accumulate correctly after each race — ready to display in home view
- All HTML IDs and CSS classes in place for Plan 02-02 to wire without structural changes

## Self-Check: PASSED

