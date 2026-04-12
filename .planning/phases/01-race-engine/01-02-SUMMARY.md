---
phase: 01-race-engine
plan: 02
subsystem: race-logic
tags: [dice-engine, corner-resolution, race-loop, vanilla-js, iife]

# Dependency graph
requires:
  - 01-01
provides:
  - "Complete race engine: resolveRound, resolveCarMove, corner resolution, finish detection, results display"
  - "Interactive UI wiring: Roll button triggers round resolution, restart clears save and reloads"
  - "Corner callout system with fade animation and DOM cleanup"
  - "Hub page link to Klesstinn Rally"
affects: [01-03-upgrade-shop]

# Tech tracking
tech-stack:
  added: []
  patterns: [simultaneous-turn-resolution, corner-penalty-formula, finish-order-assignment]

key-files:
  created: []
  modified:
    - games/klesstinn-rally/game.js
    - index.html

key-decisions:
  - "Corner penalty formula: Math.max(0, 3 - tireRoll) -- tire die 1 gives -2, die 4 gives 0"
  - "One corner check per turn per car via cornerChecked flag (D-05 compliance)"
  - "Finish detection after ALL cars processed per round (Pitfall 4 mitigation)"
  - "Restart clears localStorage before reload for clean fresh race"

patterns-established:
  - "spaceEls array for DOM callout targeting without re-querying"
  - "resolveCarMove returns result object for dice display decoupling"
  - "finishCount-guarded phase transition prevents double-finish bugs"

requirements-completed: [TRCK-03, TRCK-04, TRCK-05, TRCK-06, RACEUI-01, RACEUI-03]

# Metrics
duration: 2min
completed: 2026-04-12
---

# Phase 1 Plan 02: Race Engine Logic Summary

**Complete race engine with dice-driven movement, corner tire checks using Math.max(0, 3-tireRoll) penalty formula, simultaneous 4-car turn resolution, and results screen with prize money display**

## Performance

- **Duration:** 2 min
- **Started:** 2026-04-12T12:37:33Z
- **Completed:** 2026-04-12T12:39:20Z
- **Tasks completed:** 2 of 2 automated (Task 3 is human-verify checkpoint)
- **Files modified:** 2

## Accomplishments

- Implemented resolveCarMove with engine dice roll, step-by-step movement loop, lap wrap detection, corner tire check with penalty formula, and finish detection
- Implemented resolveRound with simultaneous turn processing for all 4 cars and post-loop finish assignment (Pitfall 4 safe)
- Added showCallout system appending animated div.callout to track space elements with 1600ms auto-removal
- Added showDiceResults displaying per-car engine roll and optional tire roll in dice result area
- Added showResults populating results screen with finish order, car colors, labels, and prize money
- Wired onRollClick to Roll button with racing-phase guard and button disable/enable logic
- Wired restart button to clear localStorage and reload for fresh race
- Added spaceEls array populated during renderTrack for efficient callout targeting
- Updated renderAll to handle finished state (show results, hide roll button) for save/load restore
- Added Klesstinn Rally link to root hub page

## Task Commits

Each task was committed atomically:

1. **Task 1: Implement race engine logic and wire interactive UI** - `c1be248` (feat)
2. **Task 2: Add Klesstinn Rally link to hub page** - `6c32e05` (feat)

## Task 3: Human-Verify Checkpoint

Task 3 is a `checkpoint:human-verify` gate requiring manual verification that a complete race plays from start to finish. The orchestrator will handle this checkpoint interaction with the user. Verification steps include: tapping Roll to advance cars, observing corner callouts, watching standings update, completing 2 laps to see results screen, and testing restart.

## Files Created/Modified

- `games/klesstinn-rally/game.js` - Added 177 lines: race engine (resolveCarMove, resolveRound), UI functions (showCallout, showDiceResults, showResults, onRollClick), spaceEls array, updated renderAll and bindEvents
- `index.html` - Added Klesstinn Rally link to hub page games list

## Decisions Made

- Corner penalty formula: `Math.max(0, 3 - tireRoll)` -- tire die of 1 gives -2 penalty, die of 2 gives -1, die of 3-4 gives 0 (clean corner)
- One corner check per turn per car enforced via `cornerChecked` flag per D-05
- Finish detection happens after ALL 4 cars process movement in resolveRound (Pitfall 4 from RESEARCH.md)
- Remaining unfinished cars assigned positions by calculateStandings order when any car finishes
- Restart button calls `localStorage.removeItem(SAVE_KEY)` before reload so new race starts fresh
- Added `state.phase !== "finished"` guard in resolveRound to prevent re-triggering finish logic on subsequent calls

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Added phase guard in resolveRound finish check**
- **Found during:** Task 1
- **Issue:** Plan's resolveRound only checked `state.finishCount > 0` but if a saved game already had finishCount set, re-running would re-assign positions
- **Fix:** Added `&& state.phase !== "finished"` to the finish check condition
- **Files modified:** games/klesstinn-rally/game.js
- **Commit:** c1be248

---

**Total deviations:** 1 auto-fixed (1 bug prevention)
**Impact on plan:** Minimal -- single guard clause addition for correctness

## Threat Model Compliance

- T-01-06 (rapid button clicks): Mitigated via `state.phase !== "racing"` guard in onRollClick and `rollBtnEl.disabled = true` during resolution
- T-01-05 (dice manipulation): Accepted per threat model -- single-player, no competitive integrity concern
- T-01-07 (state.phase manipulation): Accepted per threat model -- client-side only

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Complete race loop is now playable from start to finish
- Prize money values displayed but not yet accumulated (Phase 2 economy)
- Restart reloads page; Phase 3 will add proper state reset with upgrade shop flow
- All render functions, race logic, and event wiring in place for future phases to extend

## Self-Check: PASSED

All 2 modified files verified present. All 2 commit hashes verified in git log. SUMMARY.md created.
