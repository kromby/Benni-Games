# Phase 2: Economy Loop - Context

**Gathered:** 2026-04-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Players and AI earn prize money by finishing position, visit an upgrade shop between races to buy engine or tire upgrades across 5 tiers, then race again with improved dice. A new home page serves as the hub between races showing career stats and navigation to shop or next race. AI opponents have personality-based upgrade preferences.

</domain>

<decisions>
## Implementation Decisions

### Upgrade Tiers — Engine (D-01)
- **5 tiers with increasing dice ranges, shifting from bigger max to higher floor:**
  - Tier 0 (base): d3 (roll 1–3)
  - Tier 1: d4 (roll 1–4)
  - Tier 2: d6 (roll 1–6)
  - Tier 3: d2-6 (roll 2–6, minimum floor of 2)
  - Tier 4: d3-8 (roll 3–8, minimum floor of 3)
- Top tiers reward reliability (higher floor) not just bigger max

### Upgrade Tiers — Tires (D-02)
- **5 tiers reducing corner slowdown probability:**
  - Tier 0 (base): 50% chance of slowdown
  - Tier 1: 40% chance
  - Tier 2: 30% chance
  - Tier 3: 20% chance
  - Tier 4: 10% chance
- Implementation: adjust the corner penalty formula per tier rather than changing dice sides

### Upgrade Pricing (D-03)
- **Exponential cost curve, same for both engine and tires:**
  - Tier 1: 75 kr.
  - Tier 2: 150 kr.
  - Tier 3: 300 kr.
  - Tier 4: 500 kr.
  - Tier 5: 800 kr.
- Total cost to max one stat: 1825 kr. Both stats: 3650 kr.
- Starting cash of 100 kr. affords exactly one tier-1 upgrade before first race

### Shop UI (D-04)
- **Shop replaces the track view** — track board hides, shop takes over the main area
- **Two big cards** for Engine and Tires — each showing current tier + all remaining tiers with costs
- Balance displayed **in the header bar** (replaces lap counter spot during shop phase)
- If upgrade is maxed, card shows "Hámark!" (Maxed!)
- Each card has a buy button for the next available tier
- Buy button disabled and grayed when player can't afford it
- "Keppa!" (Race!) button to leave shop and go to home page

### AI Upgrade Behavior (D-05)
- **AI upgrades are invisible** — player doesn't see what AI bought. Adds surprise when opponents suddenly get faster.
- **Personality-based upgrade preferences:**
  - A1 (blue): Favors engine upgrades (speed-focused)
  - A2 (green): Favors tire upgrades (safety-focused)
  - A3 (yellow): Balanced between engine and tires
- **Saving behavior:** Each AI has ~20-30% chance of skipping a purchase to save for a bigger upgrade later
- AI buys one upgrade per shop visit when it decides to buy

### Home Page (D-06)
- **New home page serves as the hub between races**
- Game always opens to the home page (including first launch with 0 stats, 100 kr.)
- **Dashboard style layout:** Header with balance, stats panel on one side, navigation buttons on the other
- **Full stats shown:** Races completed, wins, total prize money earned, current engine/tire tier, placement breakdown (count of 1st/2nd/3rd/4th finishes)
- **Two navigation buttons:** "Búð" (Shop) and "Keppa!" (Race)
- Stats persist across races via localStorage

### Race Loop Flow (D-07)
- **Game flow:** home → racing → results → home → (optional shop) → home → racing → ...
- Results screen shows final positions + prize money, then a "Heim" (Home) button to return to the home page
- Prize money is awarded and added to balances when results screen appears
- "Keppa aftur!" button on results screen is replaced by "Heim" button
- New `state.phase` values needed: "home", "racing", "finished", "shop"

### Claude's Discretion
- Exact dashboard layout proportions and responsive breakpoints for the home page
- Stats display formatting (table vs cards vs list)
- Shop card visual design details (how tiers are displayed within cards)
- AI save probability exact value (anywhere in 20-30% range)
- Transition animations between views (if any — keep simple for v1)
- How "Keppa!" button in shop returns to home before starting race, or goes directly to race

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project & Requirements
- `.planning/PROJECT.md` — Core value, constraints, key decisions
- `.planning/REQUIREMENTS.md` — ECON-01 through ECON-07, AI-01, AI-02 (Phase 2 requirements)
- `.planning/ROADMAP.md` — Phase 2 goal and success criteria

### Prior Phase Context
- `.planning/phases/01-race-engine/01-CONTEXT.md` — Phase 1 decisions (track rendering, turn flow, car display, corner feedback)
- `.planning/phases/01-race-engine/01-01-SUMMARY.md` — What Phase 1 Plan 01 built (HTML/CSS/JS structure)
- `.planning/phases/01-race-engine/01-02-SUMMARY.md` — What Phase 1 Plan 02 built (race engine logic)

### Codebase Patterns
- `.planning/codebase/CONVENTIONS.md` — IIFE pattern, naming conventions, ES5 strict mode
- `.planning/codebase/STRUCTURE.md` — Game directory layout
- `games/klesstann-rally/game.js` — Current game code (constants, state, render functions, race logic)
- `games/klesstann-rally/style.css` — Current CSS variables and component styles
- `games/klesstann-rally/index.html` — Current HTML structure

</canonical_refs>

<code_context>
## Existing Code Insights

### Current State to Extend
- `PRIZE_MONEY = [400, 250, 150, 75]` — already defined in constants
- `ENGINE_DICE_MAX = 3`, `TIRE_DICE_MAX = 3` — current base dice, will become per-car properties
- `state.phase` uses "racing"/"finished" — needs "home" and "shop" phases added
- `cars[]` objects have id, color, label, position, lap, finished, finishOrder — need money, engineTier, tireTier properties
- `saveGame()`/`loadGame()` persist to localStorage — need to include money, tiers, career stats
- Corner penalty: `Math.max(0, 2 - tireRoll)` — will need per-car tire tier lookup

### Integration Points
- Results screen (`#results-screen`) — add prize money display and change "Keppa aftur!" to "Heim"
- Header bar (`#top-bar`) — reuse lap-counter spot for balance during shop/home phases
- Body CSS Grid areas — need new areas or view switching for home and shop views
- `rollDie()` function — engine tiers 3-4 need min+max range (not just max)
- `bindEvents()` — needs new handlers for shop buy, navigation between views

</code_context>

<specifics>
## Specific Ideas

- Engine tier progression shifts from "bigger max" to "higher floor" at top tiers — this is a deliberate design choice, not just incrementing dice size
- Tire upgrades are purely probability-based, not dice-based — simpler to understand for kids
- AI personality names match car colors and labels already in code (A1/blue=speed, A2/green=safety, A3/yellow=balanced)
- Home page is a new concept not in original requirements — extends PLAT-03 (endless mode) by giving the loop a natural resting point

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-economy-loop*
*Context gathered: 2026-04-12*
