# Phase 1: Race Engine - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-12
**Phase:** 01-race-engine
**Areas discussed:** Track rendering, Turn flow, Car & position display, Corner feedback

---

## Track Rendering

| Option | Description | Selected |
|--------|-------------|----------|
| CSS Grid board | HTML divs on a CSS grid, spaces as square loop. Matches existing codebase. Board-game feel. | ✓ |
| Canvas pixel art | HTML5 Canvas with pixel-art track. More visual control but new pattern, harder responsive. | |
| SVG track | SVG elements for track and cars. Scalable, CSS animations work. Not in existing codebase. | |

**User's choice:** CSS Grid board (Recommended)
**Notes:** Consistent with existing DOM-based rendering across all games in the repo.

---

## Turn Flow

| Option | Description | Selected |
|--------|-------------|----------|
| Tap to roll | Player taps "Roll!" each round. All 4 cars roll and move simultaneously. Player controls pace. | ✓ |
| Auto-advance with pause | Race auto-plays with ~2s pause between rounds. Spectator feel. | |
| Hybrid | First race auto-advances to teach, then tap-to-roll. More complex. | |

**User's choice:** Tap to roll (Recommended)
**Notes:** Player controls the pace with no time pressure — important for younger players.

---

## Car & Position Display

| Option | Description | Selected |
|--------|-------------|----------|
| Colored circles | Bold colored circles (red/blue/green/yellow). Quadrant stacking when sharing spaces. | ✓ |
| Emoji cars | Car/vehicle emoji. Fun but rendering varies across devices. | |
| Letter tokens | Letters (P, A, B, C) in colored squares. Clear but less exciting for kids. | |

**User's choice:** Colored circles (Recommended)
**Notes:** Simple, bold, readable at any size. Phase 3 can upgrade to pixel art sprites.

### Position Indicator

| Option | Description | Selected |
|--------|-------------|----------|
| Sidebar panel | Panel beside track showing standings, colors, and lap count. Always visible. | ✓ |
| Above track | Horizontal bar above track. Compact, mobile-friendly. | |
| You decide | Claude picks based on responsive requirements. | |

**User's choice:** Sidebar panel (Recommended)
**Notes:** Race leaderboard style, updates each round.

---

## Corner Feedback

| Option | Description | Selected |
|--------|-------------|----------|
| Inline callout | Brief text near corner space: "Clean corner!" or "Slowed! -2 spaces". Fades after moment. | ✓ |
| Round summary log | Scrolling log area with full event history per round. More info but takes space. | |
| Color flash on space | Corner space flashes green/red. Purely visual, no text. Clean but less clear for kids. | |

**User's choice:** Inline callout (Recommended)
**Notes:** Direct, contextual, no extra UI panels needed. Key for communicating the strategic corner mechanic to young players.

---

## Claude's Discretion

- Exact track space count (~20, adjustable for balanced corners)
- Dice display format for v1 (animated dice is v2/FEEL-01)
- Results screen layout details
- Game start flow
- Language choice (Icelandic vs English) for v1 UI

## Deferred Ideas

None — discussion stayed within phase scope.
