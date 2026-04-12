---
phase: 03-platform-feel
plan: "02"
subsystem: ui
tags: [mobile, responsive, css, viewport, layout]
dependency_graph:
  requires:
    - phase: 03-01
      provides: pixel-font-global, car-img-sprites
  provides:
    - mobile-no-scroll-race-layout
    - body-race-active-class-toggling
  affects: [games/klesstann-rally/style.css, games/klesstann-rally/game.js]
tech_stack:
  added: []
  patterns:
    - "body.race-active class toggled by showView() to lock viewport height during races"
    - "100dvh with overflow:hidden for mobile viewport lock"
    - "min(calc(100vw - 16px), 220px) for responsive track board width cap"
key_files:
  created: []
  modified:
    - games/klesstann-rally/style.css
    - games/klesstann-rally/game.js
key_decisions:
  - "Applied body.race-active globally (not inside media query) so desktop also gets locked height during racing"
  - "Added explicit classList.add in init() racing block before showView() for self-documenting init path and flash prevention"
  - "100dvh fallback is graceful: older browsers without dvh support simply scroll (no crash, game fully playable)"
patterns-established:
  - "Race-active pattern: body class toggled on every view transition via showView(), never left stale"
requirements-completed: [PLAT-02, PLAT-03]

# Metrics
duration: ~5 minutes (Task 1 implementation) + human verification checkpoint
completed: 2026-04-12
---

# Phase 03 Plan 02: Mobile No-Scroll Race Layout Summary

`body.race-active` viewport lock with 220px-capped track board makes the race view fit entirely on 375px mobile screens without scrolling, while home and shop views scroll freely.

## Performance

- **Duration:** ~5 min implementation + human verification checkpoint
- **Started:** 2026-04-12
- **Completed:** 2026-04-12
- **Tasks:** 2 (1 auto, 1 human-verify checkpoint)
- **Files modified:** 2

## Accomplishments

- Race view (header + board + standings + roll button) fits on 375px screens without scrolling
- `body.race-active` class correctly applied only during racing, removed on all other views
- Track board compacted to `min(calc(100vw - 16px), 220px)` on mobile
- Standings panel text reduced to 10-12px range, roll area tightened to 8px padding
- Game title and lap counter capped at 14px to prevent wrapping on narrow screens
- Human verification confirmed all visual and layout requirements met

## Task Commits

Each task was committed atomically:

1. **Task 1: Mobile no-scroll race layout and body.race-active class toggling** - `7152eaa` (feat)
2. **Task 2: Verify pixel art visuals and mobile layout** - Checkpoint approved by user (no commit)

## Files Created/Modified

- `games/klesstann-rally/style.css` - Added `body.race-active` global rule, compacted mobile standings/roll/track-board rules inside `@media (max-width: 599px)`
- `games/klesstann-rally/game.js` - Added `document.body.classList.toggle("race-active", isRacing)` in `showView()` and `document.body.classList.add("race-active")` in `init()` racing block

## Decisions Made

- Applied `body.race-active` as a global rule (not scoped to mobile media query) so the viewport lock is consistent at all screen sizes during racing
- Added the class explicitly in `init()` before calling `showView("racing")` to make the init restoration path self-documenting and prevent any flash of scrollable content on page reload
- `100dvh` fallback is graceful: browsers without `dvh` support simply allow scrolling — no crash or data loss (T-03-05 covered)

## Deviations from Plan

None — plan executed exactly as written.

## Threat Model Coverage

| Threat | Disposition | Status |
|--------|-------------|--------|
| T-03-05: dvh unit browser support | mitigate | Graceful degradation — older browsers scroll, game remains playable |
| T-03-06: overflow:hidden on body | mitigate | Class toggled on every view transition, no risk of permanent lock |

## Known Stubs

None.

## Threat Flags

None. No new network endpoints, auth paths, file access patterns, or schema changes.

## Next Phase Readiness

- Phase 03 visual and mobile layout work is complete (plans 01 and 02 done)
- Race core loop confirmed working end-to-end on both desktop and mobile
- Ready for Phase 04 or any additional polish work

---
*Phase: 03-platform-feel*
*Completed: 2026-04-12*

## Self-Check: PASSED

- [x] `games/klesstann-rally/style.css` — modified (confirmed in commit 7152eaa)
- [x] `games/klesstann-rally/game.js` — modified (confirmed in commit 7152eaa)
- [x] Commit 7152eaa exists and contains all expected changes
- [x] Human verification checkpoint approved by user
