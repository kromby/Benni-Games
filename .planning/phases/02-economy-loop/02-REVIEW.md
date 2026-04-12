---
phase: 02-economy-loop
reviewed: 2026-04-12T00:00:00Z
depth: standard
files_reviewed: 3
files_reviewed_list:
  - games/klesstann-rally/game.js
  - games/klesstann-rally/index.html
  - games/klesstann-rally/style.css
findings:
  critical: 0
  warning: 1
  info: 4
  total: 5
status: issues_found
---

# Phase 02: Code Review Report

**Reviewed:** 2026-04-12
**Depth:** standard
**Files Reviewed:** 3
**Status:** issues_found

## Summary

Reviewed the Phase 02 economy loop additions: upgrade tiers, prize money, shop UI, AI upgrade logic, home screen with career stats, and full view navigation. The core logic is sound — prize money indexing, career stat tracking, and save/load validation are all correct. AI upgrade personalities and the tier system behave as designed.

One warning-level finding relates to fragile DOM coupling that could break silently under future refactors. Four info-level findings cover dead code, a misleading comment, and a redundant state field. No critical issues were found.

## Warnings

### WR-01: Standings panel toggled via `parentElement` — fragile DOM coupling

**File:** `games/klesstann-rally/game.js:386`
**Issue:** `showView` hides the standings panel by calling `standingsListEl.parentElement.classList.toggle("hidden", !isRacing)`. This relies on `#standings-list` being a direct child of `#standings-panel`. If a wrapper element is ever inserted between them (e.g., for scrolling, styling, or accessibility), the wrong element gets the `hidden` class and the panel remains visible during non-racing views.
**Fix:** Toggle the panel by its own ID reference, which is stable and explicit:
```js
// In DOM References section, add:
var standingsPanelEl;

// In init(), add:
standingsPanelEl = document.getElementById("standings-panel");

// In showView(), replace line 386 with:
standingsPanelEl.classList.toggle("hidden", !isRacing);
```

## Info

### IN-01: `tireRoll` field in `resolveCarMove` return value is always 0

**File:** `games/klesstann-rally/game.js:427, 465`
**Issue:** `tireRoll` is declared as `0` and never assigned a value inside `resolveCarMove`. It is included in the returned object but `showDiceResults` (lines 503–524) never reads it — only `engineRoll`, `cornerHit`, and `slowed` are consumed. The field is dead weight that suggests a feature was planned but not completed.
**Fix:** Either remove the field from the return value, or — if a future design calls for showing tire roll results — assign it when a corner penalty fires:
```js
// Remove from return (line 465):
return { steps: moved, cornerHit: cornerHit, penalty: penalty, engineRoll: engineRoll, slowed: penalty > 0 };
```

### IN-02: `UPGRADE_COSTS` has two unreachable entries (indices 0 and 5)

**File:** `games/klesstann-rally/game.js:30`
**Issue:** The array `[0, 75, 150, 300, 500, 800]` has six entries but only indices 1–4 are ever accessed. Index 0 is skipped because `nextTier` is always at least 1 (`currentTier + 1` where `currentTier` starts at 0). Index 5 is unreachable because both `buyUpgrade` (line 306) and `aiUpgrade` (line 357) guard against `nextTier > 4`. The existing comment mentions index 0 is unused but does not mention index 5, making the array's intended boundary unclear.
**Fix:** Remove the trailing dead entry and update the comment:
```js
// Upgrade costs for tiers 1-4 (tier 0 is free/base)
var UPGRADE_COSTS = [0, 75, 150, 300, 500];
//                   ^-- index 0 unused; costs are UPGRADE_COSTS[nextTier] for nextTier 1..4
```

### IN-03: `state.career.wins` duplicates `state.career.placements[0]`

**File:** `games/klesstann-rally/game.js:496, 79`
**Issue:** `state.career.wins` is incremented at line 496 (`if (playerOrder === 1) { state.career.wins++; }`) and persisted to `localStorage`. However, wins are never displayed in the home screen — `renderHome` uses `state.career.placements[0]` for the gold medal count, which is identical in value. The `wins` field adds serialization and restore code (lines 675) for no observable effect.
**Fix:** Either display `wins` somewhere (e.g., as a header stat), or remove it and derive the win count from `state.career.placements[0]` wherever needed:
```js
// Remove from state object (line 79), from serialization (line 604),
// and from loadGame restore (line 675).
// Reference wins as: state.career.placements[0]
```

### IN-04: Home view and shop view occupy only the "board" grid column, leaving visible right gap

**File:** `games/klesstann-rally/style.css:334, 447`
**Issue:** Both `.home-view` and `.shop-view` use `grid-area: board`. The body grid defines `grid-template-columns: 1fr 200px`, so when the standings panel is hidden these views only fill the `1fr` left column — leaving a 200px empty gap on the right on desktop. This does not break functionality but produces a noticeably off-center layout on wide screens.
**Fix:** Span the home and shop views across both columns when the standings panel is not present, using `grid-column: 1 / -1`:
```css
.home-view,
.shop-view {
  grid-column: 1 / -1;  /* span full width when standings panel is hidden */
  grid-row: 2;
}
```
Note: this requires removing `grid-area: board` from both rules (since `grid-area` overrides `grid-column`/`grid-row`).

---

_Reviewed: 2026-04-12_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
