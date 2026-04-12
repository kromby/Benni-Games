---
phase: 02-economy-loop
plan: 02
subsystem: economy-loop-interactivity
tags: [economy, shop, home-stats, ai-upgrade, navigation, vanilla-js, iife]
status: complete

# Dependency graph
requires:
  - 02-01
provides:
  - "renderHome(): live career stats — medals (🥇🥈🥉), race count, prize total, engine/tire tier with range/penalty"
  - "renderShop() + renderShopCard(): upgrade cards with emoji headers, current/next tier, buy/disable/maxed states"
  - "buyUpgrade(type): cost-validated purchase that deducts money and increments tier"
  - "AI_PERSONALITIES: engine/tires/balanced with 20-30% saveChance"
  - "aiUpgrade(carIndex) + runAiUpgrades(): personality-based AI upgrade between races"
  - "Full navigation: home->shop->home, home->race->results->home, shop->race directly"
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns: [personality-based-ai, shop-card-render-pattern, phase-based-view-routing]

key-files:
  created: []
  modified:
    - games/klesstann-rally/game.js
    - games/klesstann-rally/index.html
    - games/klesstann-rally/style.css

key-decisions:
  - "Home screen uses two cards side-by-side: Bíllinn (engine/tires) and Ferill (medals + race stats)"
  - "Career card shows 🥇🥈🥉 medal boxes (3-col) and Keppnir+Unnið below (2-col) — replaces Sigrar+Staða"
  - "Vél/Dekk boxes on home are 4-line: emoji, tier, range/penalty, label"
  - "Shop cards use same big stacked emoji pattern as home boxes"
  - "shop-race-btn goes directly to race (runs AI upgrades); shop-home-btn returns to home"
  - "Buy buttons show 'Kaupa (X kr.)' format; disabled opacity communicates affordability"
  - "AI upgrades run at race start (go-race-btn or shop-race-btn click)"
  - "buyUpgrade validates nextTier <= 4 and player.money >= cost before any mutation (T-02-06)"
  - "init() routes based on state.phase for correct persistence across page reload"

# Metrics
duration: ~1 hour (including human-verify UI iterations)
completed: 2026-04-12
---

# Phase 2 Plan 02: Economy Loop Interactivity Summary

**Complete earn-upgrade-race loop with home dashboard, shop, AI upgrades, and full navigation. Human-verified and approved.**

## Performance

- **Duration:** ~1 hour
- **Completed:** 2026-04-12
- **Tasks completed:** 2 of 2 (Task 2: human-verify approved)
- **Files modified:** 3

## Accomplishments

### Task 1: Core interactivity (game.js)

- `AI_PERSONALITIES`: index 0=null (player), 1=engine/0.25, 2=tires/0.20, 3=balanced/0.30
- `renderHome()`: writes medal counts (stat-gold/silver/bronze), tier+range to stat-engine/stat-engine-range, tier+% to stat-tires/stat-tires-chance, race count and prize total
- `renderShopCard(type)`: current tier info, next tier info+cost ("Kaupa (X kr.)"), disabled when unaffordable, "Hámark!" when maxed
- `buyUpgrade(type)`: validates tier ≤4 and money ≥ cost, deducts, increments, re-renders, saves
- `aiUpgrade(carIndex)` + `runAiUpgrades()`: personality-driven upgrade with save chance skip
- `bindEvents()`: all navigation wired — home↔shop, home→race, shop→race, results→home
- `init()`: routes to correct view on load based on state.phase

### Task 2: Human-verify UI iterations (index.html + style.css + game.js)

During verification the following UI improvements were made and approved:

- **Home screen two-card layout**: "Bíllinn" card (engine+tire) and "Ferill" card (medals+stats) side by side on desktop, stacked on mobile
- **Career card medals**: 🥇🥈🥉 medal row (3-col) replacing Sigrar+Staða; Keppnir+Unnið row below
- **4-line Vél/Dekk boxes**: ⚙️/🛞 emoji at top, tier, dice range/penalty, label — matches home card weight
- **Shop card headings**: same big stacked emoji pattern (⚙️ Vél, 🛞 Dekk)
- **Shop footer**: two buttons — 🏠 Heim (→ home) and 🏁 Keppa! (→ race directly)
- **Button labels**: 🛠️ Verkstæði (was Búð), 🏁 Keppa! on all race buttons
- **Buy format**: "Kaupa (75 kr.)" — cost always visible, disabled state uses opacity

## Commits

1. `27f9a67` feat(02-02): implement renderHome, renderShop, buyUpgrade, AI upgrade logic, and wire all navigation
2. `522c09c` fix(02-02): redesign home screen with two cards and emoji buttons
3. `038cfb8` fix(02-02): rework home stats — medals, 4-line car boxes, emoji
4. `8afd743` fix(02-02): shop emojis, Heim button, Kaupa (X kr.) format
5. `ed67d28` fix(02-02): big stacked emojis in shop cards, 🏠 on Heim button

## Files Modified

- `games/klesstann-rally/game.js` — renderHome, renderShopCard, renderShop, buyUpgrade, aiUpgrade, runAiUpgrades, bindEvents, onRollClick, init
- `games/klesstann-rally/index.html` — two-card home layout, medal boxes, 4-line car boxes, shop emoji headings, shop footer buttons
- `games/klesstann-rally/style.css` — home-cards grid, home-card, medals-grid, race-grid, stat-emoji, stat-sub, shop-card-emoji

## Threat Model Compliance

- T-02-06 (buyUpgrade cost check): Mitigated — validates `player.money >= cost` and `nextTier <= 4`
- T-02-07/08/09: Accepted — single-player client-side game

## Self-Check: PASSED

- All 5 commits present in git log
- `function renderHome`, `function renderShop`, `function buyUpgrade`, `function aiUpgrade` all present
- `AI_PERSONALITIES` defined and used
- `shop-home-btn` and `shop-race-btn` both wired in bindEvents
- No `restart-btn` or `stat-wins`/`stat-placements` references remain
