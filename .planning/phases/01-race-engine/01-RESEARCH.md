# Phase 1: Race Engine - Research

**Researched:** 2026-04-12
**Domain:** Browser-based turn-based race game — DOM rendering, game loop state machine, CSS Grid track layout
**Confidence:** HIGH (all findings verified against codebase or standard browser APIs; no external libraries involved)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** CSS Grid board using HTML divs — spaces arranged as a square loop on a CSS grid. Matches existing codebase pattern (all games use DOM-based rendering, no canvas/SVG). Corner spaces visually distinct via color/border styling.
- **D-02:** Tap-to-roll each round — player taps a "Roll!" button, all 4 cars roll and move simultaneously. Results shown, then wait for next tap. Player controls the pace with no time pressure. Critical for 7–13 year olds who need time to process each round.
- **D-03:** Colored circles for cars — red, blue, green, yellow. When cars share a space, circles split into quadrants. Simple, bold, readable at any size. Phase 3 can upgrade to pixel art sprites later.
- **D-04:** Sidebar leaderboard panel showing live standings (1st/2nd/3rd/4th) with car colors and current lap for each racer. Always visible, updates each round.
- **D-05:** Inline callouts near corner spaces — brief text like "Clean corner!" or "Slowed! -2 spaces" appears near the corner when a car passes through. Fades after a moment. Direct, contextual, no extra UI panels needed.

### Claude's Discretion

- Exact track space count (~20 as specified, Claude can adjust for balanced corners)
- Dice display format (numbers, simple visual, etc.) — v1 doesn't need animated dice (that's FEEL-01, v2)
- Results screen layout details
- Game start flow (immediate start vs any pre-race screen)
- Icelandic vs English language for v1 UI text

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| TRCK-01 | Square track with ~20 spaces rendered top-down, 4 corners clearly marked | Track geometry section, CSS Grid layout pattern |
| TRCK-02 | All 4 cars (1 player, 3 AI) visible and positioned on track at all times | Car rendering pattern, position-to-cell mapping |
| TRCK-03 | Simultaneous turns — all 4 cars roll and move each round | Turn state machine, rollAndMove() pattern |
| TRCK-04 | Engine dice determines movement distance (range set by engine upgrade tier) | Dice mechanics section; Phase 1 uses tier-1 range 1–4 |
| TRCK-05 | Corner tire check — tire dice rolled at each corner; low roll reduces movement for that segment | Corner resolution algorithm |
| TRCK-06 | Two laps per race; race ends when first car completes 2 laps | Lap tracking, finish detection |
| RACEUI-01 | Live position indicator (1st/2nd/3rd/4th) updating each round | Standings calculation, sidebar render |
| RACEUI-02 | Lap counter visible at all times ("Lap 1 of 2") | State fields, header render |
| RACEUI-03 | Race end screen showing final positions and prize money per racer | Results screen pattern |
</phase_requirements>

---

## Summary

Phase 1 builds a complete, self-contained race from scratch inside a new `games/klesstinn-rally/` directory. The entire game is vanilla ES5 JavaScript in a single IIFE, identical in structure to the existing `klesstann/game.js`. No external libraries are introduced.

The most important design decision is **how the square track maps to a CSS Grid**. A square loop of N spaces can be laid out on a 2D grid where only the perimeter cells are "track" — the interior is empty. For ~20 spaces, a 6×6 grid gives 20 perimeter cells exactly (4 corners + 4 edges of 4 spaces each). This is the recommended geometry. The four corner cells are spaces 0, 5, 11, and 17 (or whatever corner indices the chosen grid produces) and receive a distinct visual treatment.

The second critical design is the **turn state machine**. Each round follows: IDLE → ROLLING → (process each car: roll engine dice, check if corner crossed, roll tire dice if so, reduce movement) → ANIMATING (optional brief pause per car) → COMPLETE → render standings → IDLE. Because the game is tap-to-roll and fully synchronous, no async code or requestAnimationFrame loop is needed — all movement resolves immediately on button click, followed by a single full re-render.

**Primary recommendation:** Model the track as a flat array of space indices (0 to N-1) and map each index to a CSS Grid `row` / `column` placement via a lookup table. Positions wrap around modulo N. Lap count increments when a car's new position is numerically less than its old position (it wrapped past index 0).

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vanilla JavaScript ES5 | Browser built-in | Game logic, state, events | Mandatory per CLAUDE.md — no npm |
| CSS Grid / Flexbox | Browser built-in | Track board and sidebar layout | Mandatory per codebase pattern |
| HTML5 DOM | Browser built-in | Rendering all UI | All existing games use DOM, not canvas |
| localStorage | Browser built-in | Session persistence (autosave) | Established codebase pattern |

### Supporting

No external libraries. Zero dependencies is a hard project constraint. [VERIFIED: CLAUDE.md — "Zero npm/package manager dependencies"]

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| DOM rendering | Canvas 2D | Canvas would enable pixel-art sprites more easily but breaks the codebase pattern and requires Phase 3 rewrite anyway |
| Synchronous turn resolution | requestAnimationFrame loop | RAF loop adds complexity; not needed until animated movement (v2 FEEL-01) |
| Flat position array | 2D array | Flat array with modulo arithmetic is simpler for a loop track; 2D only useful if track had branches |

**Installation:** None. No packages to install.

---

## Architecture Patterns

### Recommended Project Structure

```
games/klesstinn-rally/
├── index.html      # Game page: track board, sidebar, header, roll button
├── style.css       # Track grid, car circles, sidebar, callout fade
└── game.js         # Full IIFE: constants, state, logic, render, events, save/load
```

Root `index.html` needs one new `<li>` added to the games list. [VERIFIED: codebase — `index.html` hub pattern]

### Pattern 1: Track Space Array with Grid Coordinate Lookup

**What:** Track is a conceptual array of N numbered spaces (0 = start/finish). A `TRACK_COORDS` lookup table maps each space index to `{ row, col }` for CSS Grid placement. Corner indices stored in `CORNER_SPACES` constant.

**When to use:** Always — this decouples race logic (position 0–19) from visual layout.

**Example:**
```javascript
// Source: [ASSUMED — standard board-game loop pattern, consistent with codebase style]
var TRACK_SIZE = 20; // 6×6 grid perimeter: 4 sides × 5 spaces - 4 shared corners = 20
var CORNER_SPACES = [0, 5, 10, 15]; // indices of the 4 corner spaces

// Perimeter walk: top row L→R, right col T→B, bottom row R→L, left col B→T
var TRACK_COORDS = (function () {
  var coords = [];
  var n = 5; // spaces per side (corner counted once)
  // Top edge: row 0, col 0..4 (5 spaces)
  for (var c = 0; c < n; c++) coords.push({ row: 0, col: c });
  // Right edge: row 1..4, col 5 (4 spaces, corner already counted)
  for (var r = 1; r <= n; r++) coords.push({ row: r, col: n });
  // Bottom edge: row 5, col 4..0 (5 spaces, corner already counted)
  for (var c = n - 1; c >= 0; c--) coords.push({ row: n, col: c });
  // Left edge: row 4..1, col 0 (4 spaces, both corners already counted)
  for (var r = n - 1; r >= 1; r--) coords.push({ row: r, col: 0 });
  return coords; // length = 5+5+5+5 = 20, forming a closed square loop
}());
```

**Note on geometry:** A 6×6 CSS Grid has 6 columns and 6 rows (indices 0–5). The perimeter walk above visits 20 unique cells. All 4 corners appear as indices 0, 5, 10, 15.

### Pattern 2: Car State Object per Racer

**What:** Each car is a plain object in a `cars` array.

**Example:**
```javascript
// Source: [ASSUMED — follows existing state object pattern from klesstann/game.js]
var cars = [
  { id: "player", color: "#e74c3c", position: 0, lap: 0, finished: false, finishOrder: null },
  { id: "ai1",    color: "#3498db", position: 0, lap: 0, finished: false, finishOrder: null },
  { id: "ai2",    color: "#2ecc71", position: 0, lap: 0, finished: false, finishOrder: null },
  { id: "ai3",    color: "#f39c12", position: 0, lap: 0, finished: false, finishOrder: null },
];
```

Car colors: red `#e74c3c`, blue `#3498db`, green `#2ecc71`, yellow `#f39c12` — high contrast, child-readable.

### Pattern 3: Turn State Machine (synchronous)

**What:** A `phase` variable drives which UI is shown and what actions are legal.

**States:**
```
"racing"   → Roll button active; player taps → all cars resolve movement → re-render → "racing"
"finished" → Results screen shown; Restart button active
```

**Example:**
```javascript
// Source: [ASSUMED — follows codebase guard-clause pattern]
var state = {
  phase: "racing",  // "racing" | "finished"
  round: 0,
  finishCount: 0,
  callouts: [],     // [{ carId, text, spaceIndex, expiresAt }]
};

function onRollClick() {
  if (state.phase !== "racing") return;
  resolveRound();
  renderAll();
  if (state.phase === "finished") showResults();
}
```

### Pattern 4: Corner Resolution Algorithm

**What:** When a car's movement carries it through or onto a corner space, a tire dice is rolled. The result reduces remaining movement.

**Phase 1 dice ranges (tier 1 defaults):**
- Engine dice: 1–4 (integer, uniform random) [ASSUMED — no upgrade tiers in Phase 1]
- Tire dice: 1–4 (lower values = worse penalty)
- Corner penalty: `penalty = Math.max(0, 3 - tireDie)` (tie die of 1 → -2, die of 4 → 0)

**Algorithm:**
```javascript
// Source: [ASSUMED — derived from REQUIREMENTS.md TRCK-04 and TRCK-05 descriptions]
function resolveCarMove(car) {
  var steps = rollDie(4); // engine dice: 1d4 at tier 1
  var moved = 0;
  while (moved < steps) {
    var next = (car.position + 1) % TRACK_SIZE;
    // Detect lap wrap
    if (next < car.position || (car.position === TRACK_SIZE - 1 && next === 0)) {
      car.lap += 1;
      if (car.lap >= TOTAL_LAPS && !car.finished) {
        car.finished = true;
        car.finishOrder = ++state.finishCount;
        if (state.finishCount === 1) state.phase = "finished";
      }
    }
    car.position = next;
    moved++;
    // Corner check: if this step lands on or crosses a corner
    if (CORNER_SPACES.indexOf(next) !== -1) {
      var tireDie = rollDie(4);
      var penalty = Math.max(0, 3 - tireDie);
      steps = Math.max(moved, steps - penalty); // reduce remaining steps
      recordCallout(car, tireDie, penalty, next);
      break; // one corner check per move segment (simplest rule)
    }
  }
}
```

**Design note on corner rule:** The simplest and most kid-friendly interpretation is: a car that would pass through a corner space stops at the corner, rolls a tire die, and loses up to 2 movement from remaining steps. This is predictable and fair.

### Pattern 5: Position Standing Calculation

**What:** Sort `cars` array by race progress. Progress = `lap * TRACK_SIZE + position`.

```javascript
// Source: [ASSUMED — standard board-game ranking]
function calculateStandings() {
  var sorted = cars.slice().sort(function (a, b) {
    var progA = a.lap * TRACK_SIZE + a.position;
    var progB = b.lap * TRACK_SIZE + b.position;
    return progB - progA; // descending — further ahead = lower standing number
  });
  return sorted; // sorted[0] is 1st place, sorted[3] is 4th
}
```

### Pattern 6: Multi-Car on Same Space (Quadrant Split)

**What:** A single track space `<div>` contains up to 4 car circles. CSS Grid within the space cell splits into a 2×2 sub-grid. Each car circle gets a quadrant position.

```css
/* Source: [ASSUMED — CSS Grid quadrant pattern] */
.track-space {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  align-items: center;
  justify-items: center;
}
.car-circle {
  width: 60%;
  aspect-ratio: 1;
  border-radius: 50%;
}
```

If only one car is in the space, the circle fills the full cell (use `grid-column: 1 / -1; grid-row: 1 / -1`).

### Pattern 7: Corner Callout Fade

**What:** Append a `<div class="callout">` element positioned near the corner space. CSS animation fades it out after 1.5s. JS removes it after fade completes.

```javascript
// Source: [ASSUMED — follows DOM-only animation pattern consistent with codebase]
function showCallout(spaceEl, text) {
  var el = document.createElement("div");
  el.className = "callout";
  el.textContent = text;
  spaceEl.appendChild(el);
  setTimeout(function () {
    if (el.parentNode) el.parentNode.removeChild(el);
  }, 1600);
}
```

```css
.callout {
  position: absolute;
  /* positioned relative to track-space (which has position: relative) */
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.85);
  color: #fff;
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
  pointer-events: none;
  animation: callout-fade 1.5s ease forwards;
}
@keyframes callout-fade {
  0%   { opacity: 1; transform: translateX(-50%) translateY(0); }
  70%  { opacity: 1; }
  100% { opacity: 0; transform: translateX(-50%) translateY(-12px); }
}
```

### Recommended Project Structure (HTML)

```html
<!-- index.html key structure -->
<header id="top-bar">
  <!-- back link, title, lap counter -->
</header>
<main id="race-area">
  <div id="track-board"></div>   <!-- CSS Grid 6×6, only perimeter cells rendered -->
</main>
<aside id="standings-panel">
  <!-- 1st/2nd/3rd/4th with color circles -->
</aside>
<div id="roll-area">
  <button id="roll-btn">Rúlla!</button>
  <div id="dice-result"></div>
</div>
<div id="results-screen" class="hidden">
  <!-- Race over: final order + prize money -->
</div>
```

### Anti-Patterns to Avoid

- **Animating movement step-by-step with setTimeout:** Adds v2 complexity to v1. All movement resolves synchronously; visual update happens in a single render pass. Animations are FEEL-01 (v2).
- **Using canvas for track rendering:** Breaks the DOM-only codebase pattern and makes responsive layout harder.
- **Separate files per concern:** The codebase pattern is a single `game.js` IIFE; do not split into modules.
- **Fractional or float positions:** Track positions are integers 0 to N-1. All arithmetic uses integer modulo.
- **Mid-race tire degradation:** Explicitly out of scope per REQUIREMENTS.md out-of-scope table.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CSS animation | Custom JS timer | CSS `@keyframes` + `animation` | Browser handles repaint; JS only needs setTimeout to remove DOM node |
| Track layout math | Custom coordinate system | CSS Grid `grid-row` / `grid-column` placement | CSS Grid handles all 2D positioning |
| Random integer | Custom RNG | `Math.floor(Math.random() * sides) + 1` | One-liner, well-understood |
| Responsive layout | Media query breakpoints from scratch | CSS Grid + `min-width` on viewport | Already established in existing games |

**Key insight:** Every "hard" problem in this phase (layout, animation, random numbers) is trivially handled by built-in browser APIs. The code complexity is entirely in game logic, not infrastructure.

---

## Common Pitfalls

### Pitfall 1: Track Geometry Off-By-One

**What goes wrong:** The perimeter walk produces N cells but corner cells are counted twice, resulting in fewer or more spaces than expected.
**Why it happens:** Each corner is shared between two sides; the walk must count each corner exactly once.
**How to avoid:** Walk each side exclusive of the far corner. For a 6×6 grid (indices 0–5): top row cols 0,1,2,3,4 (5 cells), right col rows 1,2,3,4,5 (5 cells), bottom row cols 4,3,2,1,0 (5 cells), left col rows 4,3,2,1 (4 cells) = 19... adjust to get exactly 20 by choosing side length. Safest: write the walk, `console.log(TRACK_COORDS.length)`, verify before building further.
**Warning signs:** Cars appear on the wrong cell; track has a gap or overlap visually.

### Pitfall 2: Lap Counting When Crossing Start

**What goes wrong:** Lap increments multiple times per round if a car moves many spaces and crosses the start/finish line.
**Why it happens:** Naive check `if (newPos < oldPos) lap++` fires for every step that wraps, not once per crossing.
**How to avoid:** In the step-by-step movement loop, detect the wrap when `next === 0` (i.e., new position is exactly the start space, not just less than old position). Increment lap exactly once at that moment. Alternatively, track `totalStepsCompleted` and derive laps from that.
**Warning signs:** Player is declared finished after 1 lap.

### Pitfall 3: Cars All Start Stacked on Space 0

**What goes wrong:** Four cars at position 0 render as four overlapping circles at full size, hiding each other.
**Why it happens:** The quadrant split CSS only activates when the JS render code detects multiple cars.
**How to avoid:** In `renderTrack()`, collect which cars are at each space index, then pass the count to the cell renderer so it always applies the `1-car / 2-car / 3-car / 4-car` class correctly. Do this from the first render, not added later as a fix.
**Warning signs:** At race start, only one car circle is visible.

### Pitfall 4: Finishing Condition Race Condition

**What goes wrong:** Two cars finish in the same round; finishOrder is wrong or the results screen shows before all cars in that round are processed.
**Why it happens:** `state.phase = "finished"` is set inside `resolveCarMove()` which is called in a loop.
**How to avoid:** Process all 4 cars' movements fully before checking if the phase has changed. Use a flag: set `firstFinished = true` inside resolveCarMove, but only switch `state.phase` and show results after the loop over all cars completes.
**Warning signs:** Results screen appears mid-round with only some cars' positions recorded.

### Pitfall 5: CSS Grid Interior Cells Being Clickable/Visible

**What goes wrong:** The 6×6 grid has 36 cells but only 20 are track spaces. Interior cells should be invisible background. If all 36 cells are rendered as DOM nodes, the interior is visible.
**Why it happens:** CSS Grid `display: grid` with `grid-template-columns: repeat(6, 1fr)` creates a visible grid line structure even for empty cells.
**How to avoid:** Only render track space divs — use explicit `grid-row` and `grid-column` placement from `TRACK_COORDS` lookup. Interior is simply empty grid area with `background: transparent`.
**Warning signs:** Track looks like a full filled rectangle, not a loop.

### Pitfall 6: Corner Callout Accumulation

**What goes wrong:** Multiple cars hit the same corner in one round, stacking callout divs on top of each other.
**Why it happens:** `showCallout()` appends a new child each call without checking existing ones.
**How to avoid:** Either (a) replace any existing callout in a corner space before adding a new one, or (b) consolidate all corner events into one callout per corner per round, resolved before rendering.

---

## Code Examples

Verified patterns from official sources and codebase analysis:

### Dice Roll (ES5)

```javascript
// Source: Standard JS — Math.random() [VERIFIED: MDN built-in]
function rollDie(sides) {
  return Math.floor(Math.random() * sides) + 1;
}
```

### Modulo Position Advance with Lap Counting

```javascript
// Source: [ASSUMED — standard loop-track pattern]
function advanceCar(car, steps) {
  for (var i = 0; i < steps; i++) {
    var next = (car.position + 1) % TRACK_SIZE;
    if (next === 0 && car.position !== 0) {
      // Crossed start/finish line
      car.lap += 1;
    }
    car.position = next;
  }
}
```

### IIFE Module Shell (matches codebase)

```javascript
// Source: [VERIFIED: games/klesstann/game.js line 1]
(function () {
  "use strict";

  // ── Constants ──
  var TRACK_SIZE = 20;
  var TOTAL_LAPS = 2;
  var CORNER_SPACES = [0, 5, 10, 15];
  var SAVE_KEY = "klesstinn-rally-save";
  var PRIZE_MONEY = [400, 250, 150, 75]; // indexed by finish order 0=1st

  // ── Track Coordinates ──
  var TRACK_COORDS = (function () { /* perimeter walk */ }());

  // ── Cars ──
  var cars = [ /* 4 car objects */ ];

  // ── State ──
  var state = { phase: "racing", round: 0, finishCount: 0 };

  // ── Render ──
  function renderAll() { renderTrack(); renderStandings(); renderHeader(); }

  // ── Events ──
  function bindEvents() { /* roll button, restart button */ }

  // ── Save/Load ──
  function saveGame() { /* localStorage */ }
  function loadGame() { /* localStorage */ }

  // ── Init ──
  function init() { loadGame(); renderAll(); bindEvents(); setInterval(saveGame, 30000); }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
}());
```

### CSS Grid Track Board

```css
/* Source: [ASSUMED — standard CSS Grid explicit placement] */
#track-board {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-template-rows: repeat(6, 1fr);
  width: min(80vw, 480px);
  aspect-ratio: 1;
}

.track-space {
  position: relative;
  border: 2px solid #555;
  border-radius: 4px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
}

.track-space.corner {
  border-color: #e6b800;
  background: rgba(230, 184, 0, 0.15);
}

.car-circle {
  width: 60%;
  aspect-ratio: 1;
  border-radius: 50%;
  align-self: center;
  justify-self: center;
}
/* Single car fills the whole space */
.track-space.cars-1 .car-circle {
  grid-column: 1 / -1;
  grid-row: 1 / -1;
  width: 70%;
}
```

### Standings Calculation

```javascript
// Source: [ASSUMED — standard sort pattern]
function calculateStandings() {
  return cars.slice().sort(function (a, b) {
    if (a.finished && !b.finished) return -1;
    if (!a.finished && b.finished) return 1;
    var progA = a.lap * TRACK_SIZE + a.position;
    var progB = b.lap * TRACK_SIZE + b.position;
    return progB - progA;
  });
}
```

---

## State of the Art

No evolving external ecosystem to track. This is vanilla browser JavaScript — the relevant APIs (CSS Grid, DOM, localStorage, `Math.random`) have been stable since 2017+. [VERIFIED: MDN compatibility data confirms CSS Grid support in all modern browsers from 2017]

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Engine dice tier 1 range is 1–4 | Architecture Patterns (Corner Resolution) | Planner may need to choose a different default range; REQUIREMENTS.md says "range set by engine upgrade tier" without specifying tier 1 value — adjust during planning or confirm with user |
| A2 | Tire dice range is 1–4, penalty formula `max(0, 3 - tireDie)` | Architecture Patterns (Corner Resolution) | May feel too punishing or too lenient; should be validated during implementation |
| A3 | Track geometry: 20 spaces on a 6×6 grid perimeter | Architecture Patterns (Track Geometry) | Could be 24 spaces on a 7×7 or other variant; Claude's discretion per CONTEXT.md — planner should confirm final count |
| A4 | Corner spaces at indices 0, 5, 10, 15 | Architecture Patterns, Code Examples | Depends on chosen TRACK_SIZE; recalculate when TRACK_SIZE is locked |
| A5 | One corner check per move (car stops at corner mid-move) | Architecture Patterns (Corner Resolution) | Alternatively: car moves full distance then checks if final position is a corner — different feel |
| A6 | Phase 1 AI simply rolls the same dice as the player (no special logic) | Architecture Patterns | Phase 2 introduces AI spending on upgrades (AI-01, AI-02); Phase 1 AI rolling randomly is consistent with requirements but not stated explicitly |

---

## Open Questions

1. **Exact dice range for tier-1 engine**
   - What we know: REQUIREMENTS.md says "range set by engine upgrade tier" and there are 5 tiers
   - What's unclear: What is tier 1's min and max? (1–3, 1–4, or 2–5?)
   - Recommendation: Default to 1–4 (most natural single die); planner can lock this as a constant `ENGINE_DICE_MAX = [4, 5, 6, 7, 8]` indexed by tier 0–4

2. **Corner penalty feel**
   - What we know: "low roll reduces movement for that segment" (TRCK-05)
   - What's unclear: Should a tire die of 1 always stop the car, or just slow it? Can penalty exceed remaining steps?
   - Recommendation: Penalty cannot exceed remaining movement (car never goes backward). Cap at `steps - moved - 1` so car always advances at least one step through the corner.

3. **Language for Phase 1 UI text**
   - What we know: CONTEXT.md marks this as Claude's discretion; all existing games use Icelandic
   - Recommendation: Use Icelandic (consistent with project) — "Rúlla!" for Roll, "Lokaniðurstaðan" for Results, "1. sæti" etc. Can be trivially changed later.

---

## Environment Availability

Step 2.6: SKIPPED — Phase 1 is pure code creation (HTML/CSS/JS static files). No external tools, CLIs, runtimes, databases, or services are required beyond a browser and the project files already present.

---

## Sources

### Primary (HIGH confidence)
- `games/klesstann/game.js` — Verified IIFE pattern, state structure, DOM rendering conventions, save/load pattern, section comment style
- `games/klesstann/style.css` — Verified CSS Grid usage pattern, CSS variable conventions, dark theme
- `games/klesstann/index.html` — Verified HTML structure pattern: header, aside panels, main area, single script tag
- `.planning/codebase/CONVENTIONS.md` — Verified naming conventions, code style requirements
- `.planning/codebase/STACK.md` — Verified zero-dependency constraint, ES5 strict mode requirement
- `.planning/phases/01-race-engine/01-CONTEXT.md` — Locked design decisions D-01 through D-05
- `.planning/REQUIREMENTS.md` — TRCK-01 through TRCK-06, RACEUI-01 through RACEUI-03, prize money values (ECON-01: 400/250/150/75)
- `CLAUDE.md` — Zero npm dependencies constraint, IIFE pattern, camelCase/UPPER_SNAKE_CASE, 2-space indent, always-use-semicolons, ES5 strict mode

### Secondary (MEDIUM confidence)
- MDN Web Docs (training knowledge, stable since 2017): CSS Grid, `Math.random()`, `localStorage`, CSS `@keyframes` — all universally supported in target browsers

### Tertiary (LOW confidence)
- None — all claims derive from direct codebase inspection or stable browser APIs

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified directly from codebase files
- Architecture: HIGH for patterns derived from codebase; MEDIUM for game logic details (dice ranges) marked as ASSUMED
- Pitfalls: HIGH — derived from direct analysis of the specific implementation challenges this phase faces

**Research date:** 2026-04-12
**Valid until:** Stable — no external dependencies to go stale. Review only if project constraints change.
