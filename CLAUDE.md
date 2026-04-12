<!-- GSD:project-start source:PROJECT.md -->
## Project

**Klesstinn Rally**

A browser-based turn-based rally racing game with pixel art visuals. Four competitors (one human, three AI) race around a square track, rolling dice for movement and navigating corners. Players earn prize money based on finishing position and spend it on engine and tire upgrades between races. Designed for kids aged 7–13, playable on both mobile and desktop.

**Core Value:** The race → earn → upgrade → race loop must feel satisfying and rewarding from the very first race. If the core loop isn't fun, nothing else matters.

### Constraints

- **Platform**: Browser-only, must work on mobile and desktop
- **Audience**: Kids 7–13 — large text, clear visuals, no complex menus
- **Scope**: V1 core loop only — no feature creep beyond race/earn/upgrade
- **Persistence**: Session-only, no backend or accounts needed
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- HTML5 - Markup for all game UI (`games/*/index.html`)
- CSS3 - Styling and layouts (`games/*/style.css`)
- JavaScript (ES5 strict mode) - Game logic and state management (`games/*/game.js`)
- Markdown - Documentation (`README.md`)
## Runtime
- Browser (Modern browsers supporting ES5, localStorage, and CSS Grid)
- No server-side runtime required
- None required - Zero npm/package manager dependencies
- Static assets only (HTML, CSS, JS)
- Not applicable - No external package dependencies
## Frameworks
- Vanilla JavaScript - No frameworks used. Pure DOM manipulation and event handling.
- CSS Grid and Flexbox - Layout system (no CSS framework)
- Not detected
- `npx serve .` - Simple local development server (optional, from npm)
- `python3 -m http.server 8000` - Alternative local server (included in Python stdlib)
- No build pipeline required
## Key Dependencies
- None - All games are standalone, zero external dependencies
- Browser APIs: `localStorage` for game state persistence (`games/*/game.js`)
- Browser APIs: DOM manipulation via `document.getElementById()`, `querySelector()`
- Browser APIs: `requestAnimationFrame()` for animations (inferred from game loops)
## Configuration
- No configuration files required
- No environment variables used
- Games configured via constants in JavaScript (`GRID_COLS`, `GRID_ROWS`, `STARTING_MONEY`, `AUTOSAVE_MS`, etc.)
- No build configuration - Static deployment
- Workflow file: `.github/workflows/azure-static-web-apps-gentle-meadow-071f21603.yml`
## Platform Requirements
- Any text editor (VS Code, Vim, etc.)
- Optional: `node` and `npm` (only for `npx serve`)
- Optional: Python 3.x (for `python3 -m http.server`)
- Browser with ES5 support and localStorage
- Azure Static Web Apps (current deployment target)
- Azure deployment via GitHub Actions CI/CD
- Static file hosting (no backend required)
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Naming Patterns
- All JavaScript game files: `game.js` (lowercase, single word, located in game directory)
- HTML files: `index.html` (lowercase)
- CSS files: `style.css` (lowercase)
- Directory names: kebab-case (e.g., `klesstann`, `my-clicker-game`, `life2`)
- camelCase: `startDrag`, `renderGrid`, `updateMoneyDisplay`, `calculateStats`, `buildingCost`
- Function names are descriptive and action-oriented (render*, calculate*, update*, apply*, buy*)
- Private/internal functions not prefixed with underscore (relying on scope via IIFE)
- camelCase for all variables: `kokur`, `kokurPerSmell`, `dragging`, `state`, `shopGrid`
- Constants in UPPER_SNAKE_CASE: `GRID_COLS`, `GRID_ROWS`, `SAVE_KEY`, `AUTOSAVE_MS`, `MAX_STAT_DISPLAY`
- Object properties use camelCase: `catalogId`, `sourceType`, `sourceIndex`, `ghostEl`
- Single-letter loop counters accepted: `i`, `c`, `k`, `t` in short loops
- No TypeScript; plain JavaScript with `"use strict"` mode
- Object literals for configuration: `PART_TYPES`, `SHOP_CATALOG`, `STAT_NAMES`
- State held in plain objects: `state`, `dragging`
## Code Style
- No automated formatter detected (no `.prettierrc`, `eslint.config.*`, or `biome.json`)
- Indentation: 2 spaces (evident in HTML and inline styles)
- Line length: typically 80-120 characters
- Semicolons: always used (required by strict mode)
- Braces: Always present, even for single-statement blocks
- No linting configuration detected
- Code uses `"use strict";` at IIFE scope in all game files
- Error handling is silent (try/catch blocks with empty or commented catch blocks)
## Import Organization
- All games use Immediately Invoked Function Expression (IIFE) pattern: `(function () { ... })()`
- Each game is a self-contained module with no external imports
- No module loader (CommonJS, ES modules, or bundler) used
- HTML includes script with single `<script src="game.js"></script>` tag
- Relative script includes: `<script src="game.js"></script>`
- No path aliases or complex import logic
- External assets (images, SVGs) loaded via relative URLs: `src="../../"`, `src="https://fh.is/..."`
## Error Handling
- Silent failures in try/catch blocks:
- No error logging or console output in catch blocks (except one `console.warn` in my-clicker-game)
- Validation returns boolean (`true`/`false`) for action results:
- DOM safety checks: `if (elem) { ... }` before manipulation
## Logging
- Only one occurrence: `console.warn("FH clicker: ekki tókst að vista:", e);` in `my-clicker-game/game.js:90`
- No structured logging
- Most error conditions silently handled without logging
- Some comments use Icelandic text indicating development context
## Comments
- Section headers with visual separators:
- Inline comments for complex logic:
- Comments explain why (e.g., "offline progress calculation"), not what code does
- None detected; no JSDoc comments used
- Functions lack formal documentation
## Function Design
- Positional parameters (no options objects)
- Single responsibility: functions do one thing
- Functions either return values (numbers, objects, booleans) or mutate state
- No promise/async patterns detected
- Event handlers generally return void (undefined)
## Module Design
- No explicit exports; all functions private to IIFE scope
- Only DOM side effects visible to outside: event listeners, render updates
- Not used; each game is a single `game.js` file
## Language Localization
- life2.0 demonstrates localization pattern: `i18n` object with language keys:
- Data attributes in HTML: `data-i18n="key"` and `data-i18n-value="key"`
- Helper function `t(key)` for lookups
- All games use Icelandic as primary language (game content, comments in Icelandic)
## Storage & Persistence
- `localStorage` with JSON serialization:
- Autosave interval: `setInterval(saveGame, AUTOSAVE_MS)` (30000ms = 30 seconds)
- Load on game init before rendering
- Graceful degradation on corrupt saves (try/catch with default state)
## DOM Manipulation
- `document.getElementById()` for unique elements
- `document.querySelector()` / `querySelectorAll()` for CSS selectors
- Delegation via `e.target.closest()` for event handling
- No jQuery or DOM libraries
- Direct property mutation: `element.textContent`, `element.style.width`, `element.classList.add()`
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Pattern Overview
- Three independent game projects, each self-contained
- Zero build tooling or frameworks—pure HTML/CSS/JavaScript
- Immediate-mode UI rendering (re-render on state change)
- In-browser state persistence via localStorage
- Game loop pattern for continuous simulation
## Layers
- Purpose: Render UI elements and handle user interaction
- Location: HTML structure in `index.html`, styling in `style.css`, event listeners in `game.js`
- Contains: DOM manipulation, event delegation, CSS styling
- Depends on: State layer (reads current game state)
- Used by: User interactions trigger state changes
- Purpose: Hold authoritative game state and mutations
- Location: In-memory JavaScript objects within `game.js` (e.g., `state` object, `kokur`, `state.inventory`, `state.grid`)
- Contains: Game variables, inventory, money, stats, position tracking
- Depends on: Nothing (pure data)
- Used by: Presentation layer (reads state), Logic layer (modifies state)
- Purpose: Calculate game mechanics, validate actions, compute derived values
- Location: Functions in `game.js` (calculateStats, applyAction, buyPart, isValidDrop)
- Contains: Game rules, stat calculations, upgrade costs, validation
- Depends on: State layer (reads/modifies), Data/Catalog layer (queries item definitions)
- Used by: Event handlers, UI rendering
- Purpose: Save/load game state from localStorage
- Location: Functions in `game.js` (saveGame, loadGame, save, loadSave)
- Contains: JSON serialization, localStorage I/O, recovery logic
- Depends on: State layer
- Used by: Init function, beforeunload event
- Purpose: Define game content (items, upgrades, buildings)
- Location: Constants in `game.js` (SHOP_CATALOG, upgrades array, buildings array, STAT_NAMES)
- Contains: Item definitions, price lists, stat modifiers, localization strings
- Depends on: Nothing
- Used by: Logic layer (calculates costs, applies stats), Presentation layer (displays names/emojis)
## Data Flow
- Game state is mutable and held in module-scoped variables (IIFE pattern)
- Mutations happen synchronously in response to user actions
- All rendering is derived from current state (no shadow state)
- Computed values (stats, costs) calculated fresh on each render pass
## Key Abstractions
- Purpose: Reusable template for purchasable/placeable objects
- Examples: `SHOP_CATALOG` entries in Klesstann, `upgrades` array in my-clicker-game
- Pattern: Object with id, name, cost, stats/effects, tier/type
- Purpose: Track numeric attributes and display with visual bars
- Examples: Hraði (speed), Kraftur (power) in Klesstann; energy, mood in life2
- Pattern: `calculateStats()` sums effects from all placed items, rendered as percentage bars
- Purpose: Validate and manage 2D layout on a predefined chassis shape
- Examples: 9×6 grid with CHASSIS_MASK defining valid cells
- Pattern: Array of grid size, each cell holds catalogId or null; `isValidDrop()` enforces constraints
- Purpose: Exponential cost growth with ownership count
- Examples: `upgradeCost(u)` = baseCost × 1.15^owned
- Pattern: Reusable function applied to all purchasables
- Purpose: Cycle through day periods (morning → day → evening → night)
- Examples: TIME_ORDER array, advanceTime() function
- Pattern: Index-based circular array, triggers dayCount increment on cycle
## Entry Points
- Location: `game.js` at line 502-506
- Triggers: Page load (DOMContentLoaded or immediate)
- Responsibilities: Initialize state, load save, render UI, bind all event listeners
- Location: `game.js` at end (approximate line 300+)
- Triggers: Page load
- Responsibilities: Load from localStorage, set up click handler and autosave loop, start game loop with RAF
- Location: `game.js` at end (approximate line 250+)
- Triggers: Page load
- Responsibilities: Load save, render initial UI, attach action button handlers, language toggle
## Error Handling
- localStorage failures wrapped in try/catch, console.warn or silent
- Invalid JSON during load → use defaultState()
- Missing or corrupted save data → continue with initial state
- Confirmation dialog before destructive actions (reset button uses `confirm()`)
## Cross-Cutting Concerns
- Purchase validation: checks `state.money >= item.price` before mutation
- Placement validation: `isValidDrop()` checks CHASSIS_MASK and cell occupancy (Klesstann)
- Time action validation: `applyAction()` checks preconditions (food available, energy available)
- Automatic: setInterval autosave every 30 seconds
- Manual: save on `beforeunload` event
- Load: on init, parse from localStorage, validate structure before applying
- life2 uses hardcoded i18n object with is/en keys, applied via `data-i18n` attributes
- FH clicker uses hardcoded Icelandic strings
- Klesstann uses hardcoded Icelandic strings
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, or `.github/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
