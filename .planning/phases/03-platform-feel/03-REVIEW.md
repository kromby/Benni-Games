---
phase: 03-platform-feel
reviewed: 2026-04-12T00:00:00Z
depth: standard
files_reviewed: 3
files_reviewed_list:
  - games/klesstann-rally/game.js
  - games/klesstann-rally/index.html
  - games/klesstann-rally/style.css
findings:
  critical: 0
  warning: 4
  info: 4
  total: 8
status: issues_found
---

# Phase 03: Code Review Report

**Reviewed:** 2026-04-12
**Depth:** standard
**Files Reviewed:** 3
**Status:** issues_found

## Summary

Three files reviewed: the game logic (`game.js`, 790 lines), markup (`index.html`, 129 lines), and stylesheet (`style.css`, 619 lines). The codebase follows project conventions well — ES5 strict mode IIFE, silent localStorage failures, camelCase variables, and Icelandic UI strings are all consistent with `CLAUDE.md`.

No critical issues found. Four warnings cover logic edge cases and a missing null-guard that silently swallows more state than intended on corrupt saves. Four info items cover dead data, coupling, and missing breakpoints.

---

## Warnings

### WR-01: Corrupt save with one null car entry silently discards all four cars

**File:** `games/klesstann-rally/game.js:625-664`

**Issue:** `loadGame` checks `data.cars.length === 4` but does not null-check individual entries before property access. If `data.cars` is `[null, {...}, {...}, {...}]` (one corrupted slot), accessing `null.position` at line 629 throws, the outer `try/catch` at line 620 catches it silently, and the entire car state reverts to defaults — including money and upgrade tiers for cars that were valid. A player who reached Tier 4 engine could lose all progress because of a single bad array entry.

**Fix:**
```js
// Inside the for loop at line 626, add a guard:
for (var i = 0; i < 4; i++) {
  var cd = data.cars[i];
  if (!cd || typeof cd !== "object") { continue; } // skip null/invalid entries

  var pos = cd.position;
  // ... rest of validation unchanged
}
```

---

### WR-02: Race-end block uses standings computed before all cars finish moving

**File:** `games/klesstann-rally/game.js:481-503`

**Issue:** When any car finishes during `resolveRound()`, the post-loop block at line 481 calls `calculateStandings()` and assigns sequential `finishOrder` values to unfinished cars based on their position at that moment. This is correct — the `for` loop at line 476 processes all four cars first, so all moves are complete before standings are evaluated. However, `resolveCarMove` calls `showCallout` (line 462), which mutates the DOM and schedules a `setTimeout`. If a car finishes on the same turn that another car triggers a corner callout, the callout's 1600ms `setTimeout` will fire after `showView("finished")` has already hidden the track board. The callout's `removeChild` call at line 418 still fires on an element that may have been cleared — `el.parentNode` check at line 418 guards against this crash correctly. No crash, but the behavior is worth noting.

**Fix:** This is already handled correctly by the `el.parentNode` guard at line 418. No code change needed, but add a comment:
```js
setTimeout(function () {
  // parentNode check is required: track may be hidden/re-rendered before timeout fires
  if (el.parentNode) { el.parentNode.removeChild(el); }
}, 1600);
```

---

### WR-03: `buyUpgrade` writes directly to `lapCounterEl` instead of routing through `showView`

**File:** `games/klesstann-rally/game.js:322`

**Issue:** After purchasing an upgrade, `buyUpgrade` sets `lapCounterEl.textContent = player.money + " kr."` directly. This duplicates the display logic already in `showView` (lines 397–399). If a second code path causes the view to be "shop" but reaches `showView("shop")`, the header will correctly show money. But `buyUpgrade` bypasses that and writes directly, creating two places that must stay in sync. If the money display format ever changes, this line would be missed.

**Fix:**
```js
function buyUpgrade(type) {
  // ... purchase logic unchanged ...

  // Re-render shop and header balance
  renderShop();
  // Route through shared display logic instead of writing directly:
  if (lapCounterEl) { lapCounterEl.textContent = player.money + " kr."; }
  // Better: extract updateHeaderMoney() and call it from both here and showView
  saveGame();
}
```
Or extract a small helper:
```js
function updateHeaderMoney() {
  lapCounterEl.textContent = cars[0].money + " kr.";
}
```
Call it from `showView` (in the `isHome || isShop` branch) and from `buyUpgrade`.

---

### WR-04: No breakpoint between 600px and desktop — track board may be unusably small

**File:** `games/klesstann-rally/style.css:539`

**Issue:** The only responsive breakpoint is `max-width: 599px`. At 600–750px viewport width (common on small tablets and landscape phones), the desktop two-column layout activates with the track board sized at `min(80vw, 480px)` and a fixed 200px standings panel plus 8px gaps. At 600px viewport, the track board gets `min(480px, 480px) = 480px` but the total layout needs `480px + 200px + 8px*3 = 704px` — wider than the viewport. This causes horizontal overflow and breaks the layout for kids using small Android tablets or landscape phones.

**Fix:**
```css
/* Add an intermediate breakpoint */
@media (max-width: 749px) {
  body {
    grid-template-columns: 1fr 160px;
  }

  #track-board {
    width: min(calc(100vw - 160px - 32px), 380px);
  }
}
```

---

## Info

### IN-01: `UPGRADE_COSTS[5]` is dead data — never accessed

**File:** `games/klesstann-rally/game.js:30`

**Issue:** `UPGRADE_COSTS` is declared with 6 entries (indices 0–5). The value at index 5 is `800`. All access paths gate on `nextTier > 4` returning early, so index 5 is never read. Index 0 is also never read (tiers are bought 1–4). The comment "Index 0 unused" acknowledges this, but index 5 is silently unreachable.

**Fix:**
```js
// Tier upgrade costs (tiers 1-4 only; index matches nextTier)
var UPGRADE_COSTS = [0, 75, 150, 300, 500];
//                   ^unused but kept for index alignment
```
Remove the `800` entry to prevent confusion about whether a Tier 5 exists.

---

### IN-02: `carIndex` lookup falls back to `-1` on unknown car id, producing a broken image URL

**File:** `games/klesstann-rally/game.js:155-157`

**Issue:** `["player","ai1","ai2","ai3"].indexOf(spaceCars[j].id)` returns `-1` if the id is unrecognized. `colorNames[-1]` is `undefined`, so `img.src` becomes `"images/car-undefined.png"`. This won't crash, but produces a broken image. This can only occur via save corruption since car ids are hardcoded at line 64–68, but it's worth a defensive guard.

**Fix:**
```js
var carIndex = ["player","ai1","ai2","ai3"].indexOf(spaceCars[j].id);
if (carIndex === -1) { carIndex = 0; } // fallback to red car on unknown id
```

---

### IN-03: Google Fonts CDN is the only source for `Press Start 2P` — no offline fallback

**File:** `games/klesstann-rally/index.html:7-9`

**Issue:** The game's entire visual identity depends on the `Press Start 2P` font loaded from `fonts.googleapis.com`. If the CDN is unavailable (offline use, network timeout, content blockers), the fallback is generic `monospace`. For a kids' pixel-art game, this is a significant aesthetic degradation. The project targets static hosting with no CDN dependency for the game itself.

**Fix:** Consider downloading the font file and hosting it locally as a `@font-face` declaration:
```css
/* In style.css, replace the CDN link with: */
@font-face {
  font-family: 'Press Start 2P';
  src: url('fonts/PressStart2P-Regular.woff2') format('woff2');
  font-display: swap;
}
```
And remove the `<link>` tags from `index.html`. The font file (~50KB woff2) can be placed in `games/klesstann-rally/fonts/`.

---

### IN-04: `showView` calls `saveGame` on every view transition, including init routing

**File:** `games/klesstann-rally/game.js:403-404`

**Issue:** `showView` unconditionally calls `saveGame()` at line 404. During `init()`, the routing block at lines 761–779 calls `showView(...)` once, triggering a save immediately on every page load — even when nothing has changed. This is harmless but means localStorage is written on every page load, which adds a small write overhead and resets the autosave timer.

**Fix:** If this is intentional (ensures phase is always persisted), add a comment:
```js
state.phase = viewName;
saveGame(); // Always persist phase transitions, including on init routing
```
If not intentional, extract the save call to call sites that represent actual user actions rather than rendering transitions.

---

_Reviewed: 2026-04-12_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
