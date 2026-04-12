# Phase 3: Platform & Feel - Context

**Gathered:** 2026-04-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Transform the working game into a finished product: add a pixel art font and car sprite images, ensure the full game fits on a 375px phone without scrolling, and confirm the existing "Heim" flow satisfies the endless-loop requirement. No new views, mechanics, or structural changes.

</domain>

<decisions>
## Implementation Decisions

### Pixel Art — Font (D-01)
- **Press Start 2P via Google Fonts** — add one `<link>` tag to `index.html`. This is the first external dependency in the project, but it is a CDN font load only (no npm, no bundler, no build step). All text in the game switches to this font.

### Pixel Art — Car Images (D-02)
- **Use PNG images from `games/klesstann-rally/images/`:** `car-red.png` (player / Þú), `car-blue.png` (A1), `car-green.png` (A2), `car-yellow.png` (A3).
- These are prototype/placeholder sizes (~6 MB each) — they will be replaced with properly sized final assets later. For now, use them as-is with CSS `width`/`height` constraints to fit within track spaces.
- Replace the `.car-circle` div approach in `renderTrack()` with `<img>` elements referencing the correct image per car.
- The player's car (currently distinguished by a white border) should remain visually identifiable — either via a glow/border on the `<img>`, or by relying on the distinct red image.

### Pixel Art — Theme (D-03)
- **No further visual changes.** Keep the existing dark theme (`--bg: #0d0d0d`, `--surface: #1a1a1a`), current border styles, layout structure, and color palette. Only the font and car representation change.

### Race Again Flow (D-04)
- **No change needed.** Keep "Heim" only on the results screen. The results → home → "Keppa!" path satisfies PLAT-03 (no hard stop). Do not add a "Keppa aftur!" button.

### Mobile Layout (D-05)
- **Everything must fit without scrolling** on a 375px-wide portrait phone during a race.
- The race view (header + board + standings + roll button) must all be simultaneously visible.
- The shop and home views may scroll if needed — the no-scroll constraint applies specifically to the active race view.
- Shop cards stacking vertically on mobile is already implemented and correct — no change needed there.
- Concrete implication: the track board may need to shrink further on mobile (currently `min(80vw, 480px)` = 300px at 375px), and the standings panel may need to compact or reduce padding to reclaim vertical space for the roll button.

### Claude's Discretion
- Exact CSS sizing for car images within track spaces (must fit within the existing `grid-template-columns: 1fr 1fr` / `grid-template-rows: 1fr 1fr` car layout inside `.track-space`)
- Whether the player's car gets a CSS outline/glow vs relying on the visually distinct image
- Exact breakpoint values for the no-scroll mobile layout (currently 599px — may need a finer 375px-specific rule)
- Which Google Fonts weights to load (Press Start 2P only has weight 400)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project & Requirements
- `.planning/PROJECT.md` — Core value, constraints, key decisions
- `.planning/REQUIREMENTS.md` — PLAT-01, PLAT-02, PLAT-03, PLAT-04 (Phase 3 requirements)
- `.planning/ROADMAP.md` — Phase 3 goal and success criteria

### Prior Phase Context
- `.planning/phases/01-race-engine/01-CONTEXT.md` — Phase 1 decisions (track rendering, turn flow, car display, corner feedback)
- `.planning/phases/02-economy-loop/02-CONTEXT.md` — Phase 2 decisions (upgrade tiers, shop UI, AI, home page, race loop flow)

### Current Codebase
- `games/klesstann-rally/game.js` — All game logic; `renderTrack()` creates `.car-circle` divs to replace, `init()` caches DOM refs
- `games/klesstann-rally/style.css` — All styling; `.car-circle` styles to replace, mobile breakpoint at `@media (max-width: 599px)`; board size: `width: min(80vw, 480px)`
- `games/klesstann-rally/index.html` — HTML structure; `<link>` for font goes in `<head>`
- `games/klesstann-rally/images/` — `car-red.png`, `car-blue.png`, `car-green.png`, `car-yellow.png`

### Codebase Patterns
- `.planning/codebase/CONVENTIONS.md` — IIFE pattern, naming conventions, ES5 strict mode
- `.planning/codebase/STRUCTURE.md` — Game directory layout

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `renderTrack()` in `game.js` — creates car circles; replace div creation with `<img>` creation pointing to `images/car-{color}.png`
- `.car-circle` and `.car-player` CSS classes — remove or repurpose as `.car-img` styles
- Mobile breakpoint `@media (max-width: 599px)` — extend this block for no-scroll layout adjustments

### Established Patterns
- DOM rendering: create elements, set className, set style properties, appendChild — same pattern for `<img>` elements
- Cars map to colors: index 0=red (player), 1=blue (A1), 2=green (A2), 3=yellow (A3)
- `CAR_COLORS = ["#e74c3c", "#3498db", "#2ecc71", "#f39c12"]` — can derive image filename from color name or car index

### Integration Points
- `renderTrack()` in `game.js`: the car rendering loop (creates `circle` divs) is where `<img>` elements get substituted
- `style.css` `.car-circle` rules: replace with `.car-img` rules (width/height constraints, object-fit: contain)
- `index.html` `<head>`: add Google Fonts `<link>` tag for Press Start 2P
- `style.css` `:root` or `body`: set `font-family: 'Press Start 2P', monospace` globally

</code_context>

<specifics>
## Specific Ideas

- Car images are prototype/large files — downstream agents should constrain display size via CSS (e.g. `width: 80%; height: 80%; object-fit: contain`) rather than relying on natural image dimensions
- Press Start 2P has only one weight (400) — no bold variants; existing `font-weight: 700` will fall back to 400 which is fine
- The "no scroll on mobile during race" constraint may require using `dvh` (dynamic viewport height) or `height: 100svh` on the body grid to ensure rows fill exactly the screen

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-platform-feel*
*Context gathered: 2026-04-12*
