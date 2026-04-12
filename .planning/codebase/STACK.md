# Technology Stack

**Analysis Date:** 2026-04-12

## Languages

**Primary:**
- HTML5 - Markup for all game UI (`games/*/index.html`)
- CSS3 - Styling and layouts (`games/*/style.css`)
- JavaScript (ES5 strict mode) - Game logic and state management (`games/*/game.js`)

**Secondary:**
- Markdown - Documentation (`README.md`)

## Runtime

**Environment:**
- Browser (Modern browsers supporting ES5, localStorage, and CSS Grid)
- No server-side runtime required

**Package Manager:**
- None required - Zero npm/package manager dependencies
- Static assets only (HTML, CSS, JS)

**Lockfile:**
- Not applicable - No external package dependencies

## Frameworks

**Core:**
- Vanilla JavaScript - No frameworks used. Pure DOM manipulation and event handling.
- CSS Grid and Flexbox - Layout system (no CSS framework)

**Testing:**
- Not detected

**Build/Dev:**
- `npx serve .` - Simple local development server (optional, from npm)
- `python3 -m http.server 8000` - Alternative local server (included in Python stdlib)
- No build pipeline required

## Key Dependencies

**Critical:**
- None - All games are standalone, zero external dependencies

**Infrastructure:**
- Browser APIs: `localStorage` for game state persistence (`games/*/game.js`)
- Browser APIs: DOM manipulation via `document.getElementById()`, `querySelector()`
- Browser APIs: `requestAnimationFrame()` for animations (inferred from game loops)

## Configuration

**Environment:**
- No configuration files required
- No environment variables used
- Games configured via constants in JavaScript (`GRID_COLS`, `GRID_ROWS`, `STARTING_MONEY`, `AUTOSAVE_MS`, etc.)

**Build:**
- No build configuration - Static deployment
- Workflow file: `.github/workflows/azure-static-web-apps-gentle-meadow-071f21603.yml`

## Platform Requirements

**Development:**
- Any text editor (VS Code, Vim, etc.)
- Optional: `node` and `npm` (only for `npx serve`)
- Optional: Python 3.x (for `python3 -m http.server`)
- Browser with ES5 support and localStorage

**Production:**
- Azure Static Web Apps (current deployment target)
- Azure deployment via GitHub Actions CI/CD
- Static file hosting (no backend required)

---

*Stack analysis: 2026-04-12*
