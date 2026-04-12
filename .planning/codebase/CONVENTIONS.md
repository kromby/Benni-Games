# Coding Conventions

**Analysis Date:** 2026-04-12

## Naming Patterns

**Files:**
- All JavaScript game files: `game.js` (lowercase, single word, located in game directory)
- HTML files: `index.html` (lowercase)
- CSS files: `style.css` (lowercase)
- Directory names: kebab-case (e.g., `klesstann`, `my-clicker-game`, `life2`)

**Functions:**
- camelCase: `startDrag`, `renderGrid`, `updateMoneyDisplay`, `calculateStats`, `buildingCost`
- Function names are descriptive and action-oriented (render*, calculate*, update*, apply*, buy*)
- Private/internal functions not prefixed with underscore (relying on scope via IIFE)

**Variables:**
- camelCase for all variables: `kokur`, `kokurPerSmell`, `dragging`, `state`, `shopGrid`
- Constants in UPPER_SNAKE_CASE: `GRID_COLS`, `GRID_ROWS`, `SAVE_KEY`, `AUTOSAVE_MS`, `MAX_STAT_DISPLAY`
- Object properties use camelCase: `catalogId`, `sourceType`, `sourceIndex`, `ghostEl`
- Single-letter loop counters accepted: `i`, `c`, `k`, `t` in short loops

**Types:**
- No TypeScript; plain JavaScript with `"use strict"` mode
- Object literals for configuration: `PART_TYPES`, `SHOP_CATALOG`, `STAT_NAMES`
- State held in plain objects: `state`, `dragging`

## Code Style

**Formatting:**
- No automated formatter detected (no `.prettierrc`, `eslint.config.*`, or `biome.json`)
- Indentation: 2 spaces (evident in HTML and inline styles)
- Line length: typically 80-120 characters
- Semicolons: always used (required by strict mode)
- Braces: Always present, even for single-statement blocks

**Linting:**
- No linting configuration detected
- Code uses `"use strict";` at IIFE scope in all game files
- Error handling is silent (try/catch blocks with empty or commented catch blocks)

**Example style:**
```javascript
// Klesstann: game.js
(function () {
  "use strict";

  var GRID_COLS = 9;
  var GRID_ROWS = 6;

  function renderGrid() {
    gridEl.innerHTML = "";
    for (var i = 0; i < GRID_SIZE; i++) {
      // Logic here
    }
  }
})();
```

## Import Organization

**Module Pattern:**
- All games use Immediately Invoked Function Expression (IIFE) pattern: `(function () { ... })()`
- Each game is a self-contained module with no external imports
- No module loader (CommonJS, ES modules, or bundler) used
- HTML includes script with single `<script src="game.js"></script>` tag

**Path Structure:**
- Relative script includes: `<script src="game.js"></script>`
- No path aliases or complex import logic
- External assets (images, SVGs) loaded via relative URLs: `src="../../"`, `src="https://fh.is/..."`

## Error Handling

**Patterns:**
- Silent failures in try/catch blocks:
  ```javascript
  function saveGame() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch (e) {
      // Silently fail
    }
  }
  ```
- No error logging or console output in catch blocks (except one `console.warn` in my-clicker-game)
- Validation returns boolean (`true`/`false`) for action results:
  ```javascript
  function applyAction(actionId) {
    switch (actionId) {
      case "eat":
        if (state.food < 1) return false;
        // Apply action
        return true;
    }
  }
  ```
- DOM safety checks: `if (elem) { ... }` before manipulation

## Logging

**Framework:** `console` (minimal use)

**Patterns:**
- Only one occurrence: `console.warn("FH clicker: ekki tókst að vista:", e);` in `my-clicker-game/game.js:90`
- No structured logging
- Most error conditions silently handled without logging
- Some comments use Icelandic text indicating development context

## Comments

**When to Comment:**
- Section headers with visual separators:
  ```javascript
  // ── Constants ──
  // ── Part Types ──
  // ── Drag State ──
  // ── Initialization ──
  ```
- Inline comments for complex logic:
  ```javascript
  // Offline framvinda: bæta við FH fyrir tíma sem liðinn er síðan lastTime
  var dt = (performance.now() - lastTime) / 1000;
  ```
- Comments explain why (e.g., "offline progress calculation"), not what code does

**JSDoc/TSDoc:**
- None detected; no JSDoc comments used
- Functions lack formal documentation

## Function Design

**Size:** Functions range from 3-40 lines typically

**Closure-based state:**
```javascript
// Example from klesstann: game.js
var dragging = null; // State held in closure

function startDrag(catalogId, sourceType, sourceIndex, x, y) {
  // Manipulates dragging state
  dragging = {
    catalogId: catalogId,
    sourceType: sourceType,
    sourceIndex: sourceIndex,
    ghostEl: ghost,
  };
}

function moveDrag(x, y) {
  if (!dragging) return; // Guard clause
  // Uses dragging state
}
```

**Parameters:**
- Positional parameters (no options objects)
- Single responsibility: functions do one thing

**Return Values:**
- Functions either return values (numbers, objects, booleans) or mutate state
- No promise/async patterns detected
- Event handlers generally return void (undefined)

## Module Design

**Exports:**
- No explicit exports; all functions private to IIFE scope
- Only DOM side effects visible to outside: event listeners, render updates

**Barrel Files:**
- Not used; each game is a single `game.js` file

**State Management Pattern:**
```javascript
// Klesstann example
var state = {
  money: STARTING_MONEY,
  inventory: {},      // { catalogId: count }
  grid: new Array(GRID_SIZE).fill(null),
};

// Functions mutate state directly
function buyPart(catalogId) {
  var item = catalogById[catalogId];
  if (!item || state.money < item.price) return;
  state.money -= item.price;
  state.inventory[catalogId] = (state.inventory[catalogId] || 0) + 1;
  updateMoneyDisplay();
  renderInventory();
  renderShop();
}
```

## Language Localization

**Approach:**
- life2.0 demonstrates localization pattern: `i18n` object with language keys:
  ```javascript
  var i18n = {
    is: { energy: "Orka", mood: "Skap", ... },
    en: { energy: "Energy", mood: "Mood", ... },
  };
  ```
- Data attributes in HTML: `data-i18n="key"` and `data-i18n-value="key"`
- Helper function `t(key)` for lookups
- All games use Icelandic as primary language (game content, comments in Icelandic)

## Storage & Persistence

**Pattern:**
- `localStorage` with JSON serialization:
  ```javascript
  function saveGame() {
    var data = { money, inventory, grid };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  }
  ```
- Autosave interval: `setInterval(saveGame, AUTOSAVE_MS)` (30000ms = 30 seconds)
- Load on game init before rendering
- Graceful degradation on corrupt saves (try/catch with default state)

## DOM Manipulation

**Query Pattern:**
- `document.getElementById()` for unique elements
- `document.querySelector()` / `querySelectorAll()` for CSS selectors
- Delegation via `e.target.closest()` for event handling
- No jQuery or DOM libraries
- Direct property mutation: `element.textContent`, `element.style.width`, `element.classList.add()`

---

*Convention analysis: 2026-04-12*
