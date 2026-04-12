# Codebase Structure

**Analysis Date:** 2026-04-12

## Directory Layout

```
/Users/sc/Source/Personal/Benni-Games/
├── index.html              # Game hub landing page with links to all games
├── README.md               # Project documentation
├── LICENSE                 # License file
├── .github/                # GitHub configuration
│   └── workflows/          # CI/CD workflows (if present)
├── .planning/              # Planning and analysis documents
│   └── codebase/           # Generated architecture/quality docs
├── games/                  # Game projects directory
│   ├── my-clicker-game/    # FH Clicker game (Icelandic university clicker)
│   │   ├── index.html      # Game page structure
│   │   ├── style.css       # Game styling
│   │   ├── game.js         # Game logic and state
│   │   └── (no package.json—vanilla JS)
│   ├── klesstann/          # Car-building game (MVP)
│   │   ├── index.html      # Game page with grid, shop, stats panels
│   │   ├── style.css       # Grid, sidebar, drag-drop styling
│   │   ├── game.js         # Core game logic, drag-drop, persistence
│   │   ├── images/         # Game assets
│   │   │   └── logo.png    # Klesstann logo
│   │   └── (no package.json—vanilla JS)
│   └── life2/              # Life simulation game
│       ├── index.html      # Game page with action buttons and stats bars
│       ├── style.css       # UI styling, modal styling
│       ├── game.js         # Game state, actions, time progression
│       └── (no package.json—vanilla JS)
└── .git/                   # Git repository
```

## Directory Purposes

**`/games/`:**
- Purpose: Contains all game projects
- Contains: Independent game folders, each self-contained
- Key files: Each game has `index.html`, `style.css`, `game.js`

**`/games/klesstann/`:**
- Purpose: Car-building game where player assembles car parts on a grid
- Contains: Game mechanics, drag-drop system, part inventory, shop
- Key files: `game.js` (507 lines, main game logic), `style.css` (styling for 3-column layout), `index.html`

**`/games/my-clicker-game/`:**
- Purpose: Clicker game with upgrades and prestige mechanic (rebirths)
- Contains: Click handling, upgrade tree, production calculations, incremental mechanics
- Key files: `game.js` (300+ lines), `style.css`, `index.html`

**`/games/life2/`:**
- Purpose: Life simulation where player manages energy/mood through daily actions
- Contains: State machine for time progression, action system, bilingual UI
- Key files: `game.js` (250+ lines), `style.css`, `index.html`

**`/.planning/codebase/`:**
- Purpose: Generated analysis documents for architecture, conventions, testing, concerns
- Contains: ARCHITECTURE.md, STRUCTURE.md, CONVENTIONS.md, TESTING.md, CONCERNS.md
- Generated: Yes (by GSD tools)
- Committed: Yes

## Key File Locations

**Entry Points:**
- `/index.html`: Game hub—links to all three games
- `/games/klesstann/index.html`: Klesstann entry—loads `game.js`
- `/games/my-clicker-game/index.html`: FH clicker entry—loads `game.js`
- `/games/life2/index.html`: life2 entry—loads `game.js`

**Configuration:**
- None present (no build system, no package.json)

**Core Logic:**
- `/games/klesstann/game.js`: Grid-based placement, drag-drop, stats calculation, shop, autosave (507 lines)
- `/games/my-clicker-game/game.js`: Click mechanics, upgrades, buildings, CPS system, rebirths (300+ lines)
- `/games/life2/game.js`: Time progression, actions (sleep/eat/work), state machine, i18n (250+ lines)

**Styling:**
- `/games/klesstann/style.css`: Grid layout, sidebar panels, drag-drop visual feedback
- `/games/my-clicker-game/style.css`: Header, shop modal, button states
- `/games/life2/style.css`: Header with stats bars, action buttons, modals

**Assets:**
- `/games/klesstann/images/logo.png`: Klesstann game logo

## Naming Conventions

**Files:**
- Lowercase with hyphens for game folders: `my-clicker-game`, `klesstann`, `life2`
- Standard names: `index.html`, `style.css`, `game.js` (consistent across all games)
- No namespace or prefix needed (each game is isolated)

**Functions:**
- camelCase: `calculateStats()`, `isValidDrop()`, `applyAction()`, `renderGrid()`
- Descriptive action verbs: `render*`, `update*`, `apply*`, `buy*`, `place*`, `advance*`
- Private functions (no export): same naming, prefixed with underscore rarely used (JavaScript IIFE isolates scope)

**Variables:**
- camelCase for state: `state`, `kokur`, `kokurPerSmell`, `kokurPerSekunda`, `rebirthCount`
- UPPER_SNAKE_CASE for constants: `SAVE_KEY`, `GRID_SIZE`, `STARTING_MONEY`, `AUTOSAVE_MS`, `MAX_STAT_DISPLAY`
- Descriptive names: `dragging`, `catalogById`, `inventoryEl`, `gridEl`, `moneyEl`

**Types/Objects:**
- Object definitions stored in arrays: `SHOP_CATALOG`, `upgrades`, `buildings`, `STAT_NAMES`
- Properties are camelCase: `baseCost`, `kokurPerSmell`, `owned`, `cps`, `cpsMultiply`

## Where to Add New Code

**New Game:**
- Primary code: `/games/[game-name]/`
- Required files: `index.html`, `style.css`, `game.js`
- Test if needed: Tests not present in codebase, add alongside game.js or as separate `[game-name].test.js` (no test runner currently used)

**New Feature in Existing Game:**
- Mechanics: Add to `game.js` in relevant section (marked by comment headers like `// ── Game State ──`)
- UI: Add elements to `index.html`, styling to `style.css`, event handlers in `game.js`
- Data definitions: Add to SHOP_CATALOG, upgrades array, or relevant constants at top of `game.js`
- Persistence: Update saveGame() and loadGame() functions if state structure changes

**Utilities:**
- No shared utilities folder (games are independent)
- If sharing code, create `/lib/` or similar at root, but not currently done
- Each game self-contained to avoid coupling

## Special Directories

**`/.git/`:**
- Purpose: Git version control
- Contains: Repository history, branches, commit objects
- Committed: Yes (standard)

**`/.github/workflows/`:**
- Purpose: GitHub Actions CI/CD definitions
- Contains: Workflow YAML files if present
- Committed: Yes

**`/.claude/`:**
- Purpose: Claude Code configuration (likely IDE settings)
- Contains: Editor preferences or context
- Committed: Yes

## Module Structure (JavaScript IIFE Pattern)

All three games use the same architectural pattern:

```javascript
(function () {
  "use strict";
  
  // Constants (game rules, prices, stat names)
  var SAVE_KEY = "...";
  var STARTING_MONEY = 5000;
  
  // State (mutable, in-memory)
  var state = { ... };
  
  // Helper functions (calculations, validation)
  function calculateStats() { ... }
  
  // Render functions (DOM building)
  function renderGrid() { ... }
  
  // Event handlers
  function bindEvents() { ... }
  
  // Persistence
  function saveGame() { ... }
  
  // Init
  function init() { ... }
  
  // Start
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
```

**Why:** Avoids global scope pollution, enables variable privacy, provides clear module boundary.

---

*Structure analysis: 2026-04-12*
