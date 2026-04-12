---
phase: 03-platform-feel
plan: "01"
subsystem: visuals
tags: [pixel-art, font, car-sprites, css, html]
dependency_graph:
  requires: []
  provides: [pixel-font-global, car-img-sprites]
  affects: [games/klesstann-rally/index.html, games/klesstann-rally/style.css, games/klesstann-rally/game.js]
tech_stack:
  added: ["Press Start 2P (Google Fonts CDN, weight 400)"]
  patterns: ["img element car sprites with image-rendering: pixelated", "CSS outline for player car identification"]
key_files:
  created: []
  modified:
    - games/klesstann-rally/index.html
    - games/klesstann-rally/style.css
    - games/klesstann-rally/game.js
decisions:
  - "Used CSS outline (not border) on .car-img.car-player to avoid affecting img sizing"
  - "display=swap in font URL satisfies T-03-03 mitigation — text falls back to monospace if CDN unavailable"
  - "Kept standing-circle and showResults inline circles unchanged — those are small colored dots, not car sprites"
metrics:
  duration: "~8 minutes"
  completed: "2026-04-12"
  tasks_completed: 2
  tasks_total: 2
  files_changed: 3
---

# Phase 03 Plan 01: Pixel Art Visual Identity Summary

Press Start 2P bitmap font applied globally and colored circle car indicators replaced with PNG sprite images in renderTrack().

## What Was Built

**Task 1 — Font and CSS (index.html, style.css):**
- Added Google Fonts preconnect and stylesheet links for Press Start 2P before `style.css` link in `<head>`
- Changed `body` `font-family` from `"Segoe UI", system-ui, sans-serif` to `'Press Start 2P', monospace`
- Replaced `.car-circle` CSS rule (colored circle div) with `.car-img` rule (PNG sprite: 80%/80%, object-fit: contain, image-rendering: pixelated)
- Replaced `.car-player` border rule with `.car-img.car-player` outline rule (outline: 2px solid #ffffff; outline-offset: 1px)

**Task 2 — JS rendering (game.js):**
- In `renderTrack()` inner car loop: replaced `div.car-circle` creation with `img.car-img` creation
- `img.src` points to `images/car-{color}.png` via fixed array lookup (player=red, ai1=blue, ai2=green, ai3=yellow)
- `img.alt` set to `spaceCars[j].label` for accessibility
- Player car retains `car-player` class for white outline identification
- `renderStandings()` and `showResults()` unchanged — those small colored dots remain as-is

## Commits

| Task | Commit | Files |
|------|--------|-------|
| Task 1: Font + CSS | b637bc4 | index.html, style.css |
| Task 2: JS rendering | 1b7beb1 | game.js |

## Deviations from Plan

None — plan executed exactly as written.

## Threat Model Coverage

| Threat | Disposition | Status |
|--------|-------------|--------|
| T-03-01: Google Fonts info disclosure | accept | Accepted — standard CDN risk |
| T-03-02: Google Fonts CSS tampering | accept | Accepted — industry-standard low risk |
| T-03-03: CDN unavailability (mitigate) | mitigate | `display=swap` in font URL ensures fallback to monospace |
| T-03-04: Image path tampering | accept | Accepted — hardcoded paths, no user input |

## Known Stubs

None. Car PNG images (`car-red.png`, `car-blue.png`, `car-green.png`, `car-yellow.png`) exist in `games/klesstann-rally/images/` and will render correctly.

## Threat Flags

None. No new network endpoints, auth paths, file access patterns, or schema changes beyond the Google Fonts CDN link documented in the threat model.

## Self-Check: PASSED

- [x] `games/klesstann-rally/index.html` — modified, contains Press Start 2P font links
- [x] `games/klesstann-rally/style.css` — modified, contains .car-img and Press Start 2P font-family
- [x] `games/klesstann-rally/game.js` — modified, renderTrack uses img.car-img
- [x] Commit b637bc4 exists
- [x] Commit 1b7beb1 exists
