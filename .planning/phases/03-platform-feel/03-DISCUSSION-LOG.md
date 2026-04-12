# Phase 3: Platform & Feel - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-12
**Phase:** 03-platform-feel
**Areas discussed:** Pixel art style depth, Race again flow, Mobile layout

---

## Pixel art style depth

### Font

| Option | Description | Selected |
|--------|-------------|----------|
| Press Start 2P (Google Fonts) | One `<link>` tag, first external dep but no npm/bundler needed | ✓ |
| CSS monospace stack | Zero deps, Courier New / Consolas, doesn't feel truly retro | |
| Embed font as base64 | Inline in CSS, offline-safe, adds ~50KB | |

**User's choice:** Press Start 2P via Google Fonts

---

### Car representation

| Option | Description | Selected |
|--------|-------------|----------|
| PNG images from images/ folder | car-red/blue/green/yellow.png already in repo | ✓ |
| CSS pixel art blocks (box-shadow) | Pure CSS, no assets, moderate effort | |
| Keep circles + pixel styling | Minimal change, less authentic | |
| Emoji cars | Simple, zero code, not distinct enough | |

**User's choice:** Use PNG images from `games/klesstann-rally/images/`
**Notes:** Images are prototype/placeholder size (~6 MB each). Will be replaced with properly sized final assets later. Use CSS to constrain display size.

---

### Track and UI theme

| Option | Description | Selected |
|--------|-------------|----------|
| Full pixel art theme | Chunky borders, green grass track interior, bold palette | |
| Font + cars only | Keep existing dark theme, only add font and images | ✓ |
| Font + cars + palette shift | Brighten colors but keep layout structure | |

**User's choice:** Font + cars only — no further visual changes to the existing dark theme.

---

## Race again flow

| Option | Description | Selected |
|--------|-------------|----------|
| Two buttons: Heim + Keppa aftur! | Direct shortcut to skip shop | |
| Only Keppa aftur! | Replace Heim entirely | |
| Keep Heim only | Existing flow satisfies PLAT-03, no change needed | ✓ |

**User's choice:** Keep "Heim" only — no code change needed for PLAT-03.

---

## Mobile layout

### Race view scrolling

| Option | Description | Selected |
|--------|-------------|----------|
| Fit everything without scrolling | Board + standings + roll button all visible at 375px | ✓ |
| Minimal scroll is fine | One swipe to reach roll button, simpler | |

**User's choice:** No scrolling during race. Everything must be simultaneously visible on 375px portrait.

---

### Shop mobile

| Option | Description | Selected |
|--------|-------------|----------|
| Stack vertically is fine | Already implemented, no change needed | ✓ |
| Needs review | Further adjustments needed | |

**User's choice:** Shop vertical stacking is fine as-is.

---

## Claude's Discretion

- Exact CSS sizing for car images within track spaces
- Player car visual distinction (outline/glow vs image)
- Exact breakpoint values for no-scroll layout
- Google Fonts weights to load

## Deferred Ideas

None
