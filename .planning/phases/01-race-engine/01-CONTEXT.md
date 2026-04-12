# Phase 1: Race Engine - Context

**Gathered:** 2026-04-12
**Status:** Ready for planning

<domain>
## Phase Boundary

A complete race runs from start to finish: square track with ~20 spaces and 4 corners rendered as a CSS grid board, 4 cars (1 player, 3 AI) moving via dice rolls, tire checks at corners, 2-lap race, and a results screen showing finishing positions and prize money.

</domain>

<decisions>
## Implementation Decisions

### Track Rendering
- **D-01:** CSS Grid board using HTML divs — spaces arranged as a square loop on a CSS grid. Matches existing codebase pattern (all games use DOM-based rendering, no canvas/SVG). Corner spaces visually distinct via color/border styling.

### Turn Flow
- **D-02:** Tap-to-roll each round — player taps a "Roll!" button, all 4 cars roll and move simultaneously. Results shown, then wait for next tap. Player controls the pace with no time pressure. Critical for 7–13 year olds who need time to process each round.

### Car & Position Display
- **D-03:** Colored circles for cars — red, blue, green, yellow. When cars share a space, circles split into quadrants. Simple, bold, readable at any size. Phase 3 can upgrade to pixel art sprites later.
- **D-04:** Sidebar leaderboard panel showing live standings (1st/2nd/3rd/4th) with car colors and current lap for each racer. Always visible, updates each round.

### Corner Feedback
- **D-05:** Inline callouts near corner spaces — brief text like "Clean corner!" or "Slowed! -2 spaces" appears near the corner when a car passes through. Fades after a moment. Direct, contextual, no extra UI panels needed.

### Claude's Discretion
- Exact track space count (~20 as specified, Claude can adjust for balanced corners)
- Dice display format (numbers, simple visual, etc.) — v1 doesn't need animated dice (that's FEEL-01, v2)
- Results screen layout details
- Game start flow (immediate start vs any pre-race screen)
- Icelandic vs English language for v1 UI text

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

No external specs — requirements fully captured in decisions above and in:

### Project & Requirements
- `.planning/PROJECT.md` — Core value, constraints, key decisions
- `.planning/REQUIREMENTS.md` — TRCK-01 through TRCK-06, RACEUI-01 through RACEUI-03 (Phase 1 requirements)
- `.planning/ROADMAP.md` — Phase 1 goal and success criteria

### Codebase Patterns
- `.planning/codebase/CONVENTIONS.md` — IIFE pattern, naming conventions, ES5 strict mode
- `.planning/codebase/STRUCTURE.md` — Game directory layout (`games/[name]/index.html + style.css + game.js`)
- `.planning/codebase/STACK.md` — Vanilla JS, no frameworks, no build tools

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- No directly reusable components (existing games are unrelated: car-builder, clicker, life-sim)
- Established file structure: `games/[name]/index.html + style.css + game.js`

### Established Patterns
- IIFE module pattern with `"use strict"` — new game must follow this
- State held in closure-scoped plain objects, mutated directly
- Constants in UPPER_SNAKE_CASE, functions in camelCase
- localStorage persistence with JSON serialization, autosave on interval
- DOM rendering: `getElementById`, `querySelector`, direct property mutation
- Section comment headers: `// ── Section Name ──`

### Integration Points
- New game directory: `games/klesstinn-rally/` with `index.html`, `style.css`, `game.js`
- Hub page `index.html` at root — needs a link added to the new game
- No shared state with other games (per PROJECT.md constraint)

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-race-engine*
*Context gathered: 2026-04-12*
