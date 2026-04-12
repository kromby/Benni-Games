---
phase: 02-economy-loop
plan: 02
subsystem: economy-loop-interactivity
tags: [economy, shop, home-stats, ai-upgrade, navigation, vanilla-js, iife]
status: partial (awaiting human-verify checkpoint)

# Dependency graph
requires:
  - 02-01
provides:
  - "renderHome(): live career stats display (races, wins, earned, engine/tire tiers, placements)"
  - "renderShop() + renderShopCard(): upgrade cards with current/next tier, buy/disable/maxed states"
  - "buyUpgrade(type): cost-validated purchase that deducts money and increments tier"
  - "AI_PERSONALITIES: engine/tires/balanced with 20-30% saveChance"
  - "aiUpgrade(carIndex) + runAiUpgrades(): personality-based AI upgrade between races"
  - "Full navigation: home->shop->home, home->race->results->home"
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns: [personality-based-ai, shop-card-render-pattern, phase-based-view-routing]

key-files:
  created: []
  modified:
    - games/klesstann-rally/game.js

key-decisions:
  - "shop-race-btn returns to home (not directly to race) per D-07 loop flow"
  - "AI upgrades run at race start (go-race-btn click), not when entering shop"
  - "buyUpgrade validates nextTier <= 4 and player.money >= cost before any mutation (T-02-06)"
  - "rollBtnEl.style.display hidden on finish so Heim button is the clear next action"
  - "init() routes based on state.phase for correct persistence across page reload"

# Metrics
duration: in-progress
completed: 2026-04-12
---

# Phase 2 Plan 02: Economy Loop Interactivity Summary

**Complete earn-upgrade-race loop: home page with live career stats, shop with tier upgrade cards and buy mechanics, AI personality-based upgrades, and full view navigation**

## Status

Task 1 complete (committed). Awaiting Task 2 (human-verify checkpoint).

## Performance

- **Duration:** in-progress
- **Started:** 2026-04-12
- **Tasks completed:** 1 of 2 (Task 2 is human-verify checkpoint)
- **Files modified:** 1

## Accomplishments

### Task 1: Implement renderHome, renderShop, buyUpgrade, AI upgrade logic, and wire all navigation

- Added `AI_PERSONALITIES` constant: index 0=null (player), index 1=engine/0.25, index 2=tires/0.20, index 3=balanced/0.30
- Added `renderHome()`: populates stat-races, stat-wins, stat-earned, stat-engine (with tier+range), stat-tires (with tier+%), stat-placements (breakdown like "1x1., 2x2.")
- Added `renderShopCard(type)`: shows current tier info, next tier info+cost, disables buy when unaffordable, hides button and shows "Hámark!" when maxed (nextTier > 4)
- Added `renderShop()`: calls renderShopCard for both "engine" and "tires"
- Added `buyUpgrade(type)`: validates tier <=4 and money >= cost, deducts cost, increments tier, re-renders shop, updates header balance, saves game
- Added `aiUpgrade(carIndex)`: checks personality saveChance (skip), then picks preferred upgrade type (70/30 or 50/50 split), tries preferred first then fallback, buys at most one upgrade
- Added `runAiUpgrades()`: loops cars[1..3] calling aiUpgrade
- Replaced `bindEvents()` entirely: go-shop-btn (renderShop+showView), go-race-btn (runAiUpgrades+resetRace+showView+renderAll+show rollBtn), shop-race-btn (renderHome+showView home), buy-engine-btn/buy-tires-btn (buyUpgrade), home-btn-results (renderHome+showView home), beforeunload saveGame
- Updated `onRollClick()`: adds `rollBtnEl.style.display = "none"` on race finish
- Updated `init()`: routes to correct view with renderHome/renderShop/showResults/renderAll based on state.phase

## Task Commits

1. **Task 1: renderHome, renderShop, buyUpgrade, AI upgrade, navigation wiring** - `27f9a67` (feat)

## Files Created/Modified

- `games/klesstann-rally/game.js` - +205/-9 lines: AI_PERSONALITIES, renderHome, renderShopCard, renderShop, buyUpgrade, aiUpgrade, runAiUpgrades, updated bindEvents, updated onRollClick, updated init

## Decisions Made

- `shop-race-btn` navigates to home (not directly to race) — keeps D-07 flow: home is always the hub
- AI upgrades triggered at race start (go-race-btn) rather than at shop entry — AI "decides" when player commits to racing
- T-02-06 mitigation: `buyUpgrade` checks `nextTier > 4` and `player.money < cost` before any mutation

## Deviations from Plan

None — plan executed exactly as written.

## Threat Model Compliance

- T-02-06 (buyUpgrade cost check): Mitigated — validates `player.money >= cost` and `nextTier <= 4` before any mutation
- T-02-07 (AI upgrade bypass): Accepted — single-player, client-side
- T-02-08 (Purchase history): Accepted — no audit trail needed
- T-02-09 (state.phase manipulation): Accepted — client-side only

## Known Stubs

None — all stat display elements and shop card elements are now fully wired to game state.

## Self-Check: PASSED

- `27f9a67` exists in git log
- `function renderHome` present in game.js (1 match)
- `function renderShop` present in game.js (2 matches: renderShopCard + renderShop)
- `function buyUpgrade` present in game.js (1 match)
- `function aiUpgrade` present in game.js (1 match)
- `AI_PERSONALITIES` present in game.js (2 matches: declaration + usage)
- All navigation IDs wired in bindEvents
- No `restart-btn` reference in bindEvents
- `node --check` syntax validation: PASSED
