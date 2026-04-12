# Architecture

**Analysis Date:** 2026-04-12

## Pattern Overview

**Overall:** Standalone Single-Page Applications (SPAs) with vanilla JavaScript

**Key Characteristics:**
- Three independent game projects, each self-contained
- Zero build tooling or frameworks—pure HTML/CSS/JavaScript
- Immediate-mode UI rendering (re-render on state change)
- In-browser state persistence via localStorage
- Game loop pattern for continuous simulation

## Layers

**Presentation Layer:**
- Purpose: Render UI elements and handle user interaction
- Location: HTML structure in `index.html`, styling in `style.css`, event listeners in `game.js`
- Contains: DOM manipulation, event delegation, CSS styling
- Depends on: State layer (reads current game state)
- Used by: User interactions trigger state changes

**State Management Layer:**
- Purpose: Hold authoritative game state and mutations
- Location: In-memory JavaScript objects within `game.js` (e.g., `state` object, `kokur`, `state.inventory`, `state.grid`)
- Contains: Game variables, inventory, money, stats, position tracking
- Depends on: Nothing (pure data)
- Used by: Presentation layer (reads state), Logic layer (modifies state)

**Logic Layer:**
- Purpose: Calculate game mechanics, validate actions, compute derived values
- Location: Functions in `game.js` (calculateStats, applyAction, buyPart, isValidDrop)
- Contains: Game rules, stat calculations, upgrade costs, validation
- Depends on: State layer (reads/modifies), Data/Catalog layer (queries item definitions)
- Used by: Event handlers, UI rendering

**Persistence Layer:**
- Purpose: Save/load game state from localStorage
- Location: Functions in `game.js` (saveGame, loadGame, save, loadSave)
- Contains: JSON serialization, localStorage I/O, recovery logic
- Depends on: State layer
- Used by: Init function, beforeunload event

**Data/Catalog Layer:**
- Purpose: Define game content (items, upgrades, buildings)
- Location: Constants in `game.js` (SHOP_CATALOG, upgrades array, buildings array, STAT_NAMES)
- Contains: Item definitions, price lists, stat modifiers, localization strings
- Depends on: Nothing
- Used by: Logic layer (calculates costs, applies stats), Presentation layer (displays names/emojis)

## Data Flow

**Game Initialization (Klesstann example):**

1. `DOMContentLoaded` event fires or immediate if already loaded
2. `init()` called → `loadGame()` reads localStorage
3. State object populated with money, inventory, grid positions
4. `renderGrid()`, `renderInventory()`, `renderStats()`, `renderShop()` build DOM from state
5. `bindEvents()` attaches event listeners
6. `setInterval(saveGame, 30000)` starts autosave loop

**User Action Flow (placing part):**

1. User `pointerdown` on inventory item → `startDrag()` creates ghost element
2. User `pointermove` → `moveDrag()` updates ghost position, highlights valid cells, calls `calculateStatsWithChange()` for preview
3. User `pointerup` → `endDrag()` detects drop target
4. If valid: `state.grid[index] = catalogId`, `state.inventory[catalogId]--`, state updated
5. `renderGrid()`, `renderInventory()`, `renderStats()` re-render from new state
6. Next autosave cycle saves to localStorage

**State Management:**

- Game state is mutable and held in module-scoped variables (IIFE pattern)
- Mutations happen synchronously in response to user actions
- All rendering is derived from current state (no shadow state)
- Computed values (stats, costs) calculated fresh on each render pass

## Key Abstractions

**Item Definition (all games):**
- Purpose: Reusable template for purchasable/placeable objects
- Examples: `SHOP_CATALOG` entries in Klesstann, `upgrades` array in my-clicker-game
- Pattern: Object with id, name, cost, stats/effects, tier/type

**Stat System (Klesstann, life2):**
- Purpose: Track numeric attributes and display with visual bars
- Examples: Hraði (speed), Kraftur (power) in Klesstann; energy, mood in life2
- Pattern: `calculateStats()` sums effects from all placed items, rendered as percentage bars

**Grid Placement System (Klesstann):**
- Purpose: Validate and manage 2D layout on a predefined chassis shape
- Examples: 9×6 grid with CHASSIS_MASK defining valid cells
- Pattern: Array of grid size, each cell holds catalogId or null; `isValidDrop()` enforces constraints

**Cost Scaling (FH clicker, my-clicker-game):**
- Purpose: Exponential cost growth with ownership count
- Examples: `upgradeCost(u)` = baseCost × 1.15^owned
- Pattern: Reusable function applied to all purchasables

**Time Progression (life2):**
- Purpose: Cycle through day periods (morning → day → evening → night)
- Examples: TIME_ORDER array, advanceTime() function
- Pattern: Index-based circular array, triggers dayCount increment on cycle

## Entry Points

**Klesstann (`/games/klesstann/`):**
- Location: `game.js` at line 502-506
- Triggers: Page load (DOMContentLoaded or immediate)
- Responsibilities: Initialize state, load save, render UI, bind all event listeners

**FH Clicker (`/games/my-clicker-game/`):**
- Location: `game.js` at end (approximate line 300+)
- Triggers: Page load
- Responsibilities: Load from localStorage, set up click handler and autosave loop, start game loop with RAF

**life2 (`/games/life2/`):**
- Location: `game.js` at end (approximate line 250+)
- Triggers: Page load
- Responsibilities: Load save, render initial UI, attach action button handlers, language toggle

## Error Handling

**Strategy:** Silent failure with fallback to defaults

**Patterns:**
- localStorage failures wrapped in try/catch, console.warn or silent
- Invalid JSON during load → use defaultState()
- Missing or corrupted save data → continue with initial state
- Confirmation dialog before destructive actions (reset button uses `confirm()`)

## Cross-Cutting Concerns

**Logging:** None in production code; console.warn for autosave failures (FH clicker only)

**Validation:** 
- Purchase validation: checks `state.money >= item.price` before mutation
- Placement validation: `isValidDrop()` checks CHASSIS_MASK and cell occupancy (Klesstann)
- Time action validation: `applyAction()` checks preconditions (food available, energy available)

**Persistence:**
- Automatic: setInterval autosave every 30 seconds
- Manual: save on `beforeunload` event
- Load: on init, parse from localStorage, validate structure before applying

**Localization:**
- life2 uses hardcoded i18n object with is/en keys, applied via `data-i18n` attributes
- FH clicker uses hardcoded Icelandic strings
- Klesstann uses hardcoded Icelandic strings

---

*Architecture analysis: 2026-04-12*
