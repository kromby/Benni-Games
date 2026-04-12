# Codebase Concerns

**Analysis Date:** 2026-04-12

## Tech Debt

**Monolithic Game Scripts:**
- Issue: All game logic is contained in single large IIFE functions with no modularization
- Files: `games/my-clicker-game/game.js` (353 lines), `games/klesstann/game.js` (507 lines), `games/life2/game.js` (286 lines)
- Impact: Difficult to test, reuse, or maintain logic. No code splitting. Hard to debug across concerns (rendering, state management, event handling all mixed)
- Fix approach: Break games into modules (state, render, actions, persistence). Consider ES6 modules or simple module pattern if staying vanilla JS. Create utility files for shared patterns (autosave, DOM queries, formatting).

**No Error Handling in Critical Paths:**
- Issue: Multiple functions modify state without validation. For example, `buyUpgrade()` in `games/my-clicker-game/game.js` (line 263-276) allows negative kokur after purchase without checking balance again before deduction
- Files: `games/my-clicker-game/game.js`, `games/klesstann/game.js`, `games/life2/game.js`
- Impact: Race conditions possible if rapid clicks occur. State inconsistency could allow buying items with insufficient funds due to timing
- Fix approach: Add mutex/debounce around purchase operations. Verify balance immediately before deduction. Return early on validation failure.

**Silent Catch Blocks:**
- Issue: localStorage errors are silently caught with empty catch blocks (`games/klesstann/game.js` line 496-498, `games/life2/game.js` line 201)
- Files: `games/klesstann/game.js`, `games/life2/game.js`
- Impact: If save fails (quota exceeded, privacy mode), user gets no feedback. Can lose progress without knowing. Data corruption goes undetected
- Fix approach: Log errors to console in development. Consider user-visible notification for save failures. Implement fallback (in-memory cache) if localStorage unavailable

**Inconsistent Offline Progress Calculation:**
- Issue: `games/my-clicker-game/game.js` (line 121) caps offline time at 7 days (`dt < 86400 * 7`) with no explanation or UI feedback
- Files: `games/my-clicker-game/game.js`
- Impact: If player hasn't loaded game for 8+ days, progress beyond day 7 is lost. No warning to player. Limits engagement for returning players
- Fix approach: Remove arbitrary time cap or make it configurable per game. Log discarded time for debugging. Consider informing player of skipped time

## Fragile Areas

**Hardcoded DOM References:**
- Issue: Heavy reliance on `document.getElementById()` and `querySelector()` with no null checks on first assignment. If HTML is changed, game breaks silently
- Files: All game files (e.g., `games/my-clicker-game/game.js` lines 138-152)
- Impact: Refactoring HTML breaks game with no clear error message. Hard to debug DOM-related failures
- Fix approach: Wrap DOM references in getters or validate on init. Throw meaningful errors if elements not found. Consider a simple component abstraction to tie HTML to JS

**Drag State Management (Klesstann):**
- Issue: `games/klesstann/game.js` drag state (line 95) relies on single global `dragging` object. Multiple pointer events could cause race conditions
- Files: `games/klesstann/game.js` (lines 269-393)
- Impact: On slow devices or with hardware lag, drag operations could enter invalid state (ghost element orphaned, source not restored). UI becomes unresponsive
- Fix approach: Use pointer ID tracking (already using `pointerId` but not validating it). Implement timeout to clear stale drag state. Add visual feedback for drag errors

**Offline-Aware Save/Load Mismatch:**
- Issue: `games/my-clicker-game/game.js` recalculates `kokurPerSmell` (line 116) from saved `owned` counts, but then overwrites with saved value. If `owned` array doesn't match `upgrades` array length, indices shift
- Files: `games/my-clicker-game/game.js` (lines 94-128)
- Impact: If upgrade list is reordered or items added, old saves become corrupted. Progress on specific upgrades gets assigned to wrong ones
- Fix approach: Save upgrade IDs, not indices. Use map of `{ id: owned }` instead of array. Migrate old saves on load

**Grid Index-Based Architecture (Klesstann):**
- Issue: Grid uses flat array indices (0-53) to represent 2D grid, relying on math: `GRID_COLS * GRID_ROWS`. Changes to grid dimensions break all saved games
- Files: `games/klesstann/game.js` (lines 5-7, 88-92)
- Impact: Cannot resize grid without migration logic. Hard-coded ROW_LABELS assumes 6 rows (line 20). Save data format is fragile
- Fix approach: Change save format to use `{ row, col }` coordinates or named regions. Version save format to detect migrations needed. Add grid dimension to save metadata

## Performance Bottlenecks

**Expensive DOM Manipulation in Game Loop:**
- Issue: `games/my-clicker-game/game.js` `tick()` function (lines 309-324) calls `renderScore()` every frame, which updates multiple DOM elements. Then re-renders upgrades/buildings every 200ms
- Files: `games/my-clicker-game/game.js`
- Impact: High CPU/battery usage. Especially bad on mobile. Reflow thrashing from setting `textContent` on multiple elements in sequence
- Fix approach: Batch DOM updates. Use DocumentFragment or innerHTML for list renders. Throttle stat updates. Only update DOM elements whose values changed (implement dirty tracking)

**Full Re-render on Every Action (All Games):**
- Issue: `render()` functions rebuild entire UI after each action (e.g., `games/klesstann/game.js` lines 117-145 full grid rebuild on every drag)
- Files: `games/klesstann/game.js`, `games/my-clicker-game/game.js`, `games/life2/game.js`
- Impact: Inventory with many items becomes slow. Large grids (54 cells × 6 event listeners) cause lag. Unnecessary re-renders after purchases
- Fix approach: Render only changed elements. For grids, update single cell instead of rebuilding. Cache rendered fragments. Implement virtual scrolling if needed

**No Event Delegation Optimization:**
- Issue: `games/my-clicker-game/game.js` creates new button elements on each `renderUpgrades()` (line 184-186), adding listeners to each. No cleanup of old listeners
- Files: `games/my-clicker-game/game.js` (lines 165-188)
- Impact: Memory leak: old listeners accumulate. On large shops, listener count grows unbounded. Performance degrades over time
- Fix approach: Use event delegation (single listener on parent). Remove innerHTML-based rendering in favor of updating existing elements or reusing template

## Scaling Limits

**No Numerical Overflow Protection:**
- Issue: Games accumulate arbitrarily large numbers (`kokur`, `money`, `stats`). No check for Number.MAX_SAFE_INTEGER (2^53 - 1)
- Files: All game files
- Impact: After accumulating enough resources (years of play), numbers lose precision. Calculations become incorrect. Clicker games notorious for this around 1e15+
- Fix approach: Implement BigInt for large numbers or use string representation for display. Add visual cap or prestige mechanic that resets before overflow. Add logging when approaching limits

**LocalStorage Quota Exhaustion:**
- Issue: Autosave to localStorage without checking quota. Klesstann saves grid state which could grow. No migration to IndexedDB
- Files: All three game files (autosave intervals at lines: `my-clicker-game/game.js:351`, `klesstann/game.js:113`, `life2/game.js` implicit on render)
- Impact: If other apps use storage, quota exhaustion fails silently. Player loses saves. On mobile, quota is typically 5-10MB per origin
- Fix approach: Check `localStorage.getRemainingSpace()` before save. Implement IndexedDB fallback. Compress save data before storing. Add cleanup of old saves

**No Save Data Versioning:**
- Issue: All three games assume save data structure never changes. No migration layer
- Files: All game save/load functions
- Impact: Adding new upgrades, stats, or mechanics requires manual migration of existing saves. Can't iterate on game design without breaking old saves
- Fix approach: Add `version` field to save data. Implement migration functions for version upgrades. Test migrations on load

## Security Considerations

**No Input Validation on Load:**
- Issue: `games/klesstann/game.js` (lines 488-499) loads grid data without checking if indices are within bounds or if catalogIds exist
- Files: `games/klesstann/game.js`, `games/my-clicker-game/game.js`
- Impact: Malicious localStorage modification could place undefined catalog IDs in grid. Crafted save files could cause crashes
- Fix approach: Validate array bounds and enum values on load. Sanitize catalogIds against SHOP_CATALOG. Filter out invalid entries

**XSS Risk via HTML Injection:**
- Issue: `games/klesstann/game.js` (line 165) uses innerHTML to render emoji and names from shop data. If names came from user input or API, would be vulnerable
- Files: `games/klesstann/game.js` (line 164-168), `games/my-clicker-game/game.js` (line 180-183)
- Impact: Currently low (hardcoded data only), but pattern is unsafe if data sources change
- Fix approach: Use textContent or createElement instead of innerHTML. If HTML needed, sanitize with DOMPurify or equivalent

**No Cross-Origin Safeguards:**
- Issue: `games/my-clicker-game/index.html` (line 31) loads FH logo from external URL without integrity check or fallback
- Files: `games/my-clicker-game/index.html`
- Impact: If fh.is domain is compromised, malicious image could be served. No fallback if URL breaks (404)
- Fix approach: Host image locally. Add `crossorigin="anonymous"` and `referrerpolicy`. Add error handler with fallback image

## Missing Critical Features

**No Undo/Redo System:**
- Issue: All games offer no way to undo accidental purchases or actions
- Files: All game files
- Impact: Player regrets lead to frustration. No second chance on expensive purchases. Game feels punishing
- Fix approach: Store action history. Implement undo button. Limit undo stack size. Show confirmation for expensive actions

**No Analytics or Progression Tracking:**
- Issue: No way to know what players are doing, how long sessions are, or where they drop off
- Files: N/A (missing feature)
- Impact: Can't improve game balance. Don't know if players reach end content. Can't identify bugs that affect gameplay
- Fix approach: Add event logging (purchases, time played, completion). Send to analytics service or export as CSV. Respect privacy (no personal data)

**No Mobile-Optimized Touch Controls:**
- Issue: Games rely on pointer events but lack touch-specific affordances (e.g., drag-and-drop tooltip, long-press feedback)
- Files: `games/klesstann/game.js` (drag code)
- Impact: On touch devices, drag is unintuitive. No visual feedback for long-press. Accidental purchases easy to trigger
- Fix approach: Add long-press context menu. Show drag preview above finger. Add haptic feedback. Test on real mobile devices

**No Accessibility for Screen Readers:**
- Issue: Games lack ARIA labels and semantic structure. Emojis not labeled. Stats tables not properly marked up
- Files: All HTML files
- Impact: Screen reader users cannot play. Fails WCAG standards
- Fix approach: Add aria-label to interactive elements. Use `<label>` for form fields. Mark up stats as proper table with headers. Test with NVDA/JAWS

## Test Coverage Gaps

**No Automated Tests:**
- Issue: Zero test coverage. All logic untested
- Files: All game files
- Impact: Refactoring is dangerous. Regressions go unnoticed. Can't safely optimize performance code
- Fix approach: Add unit tests for: cost calculations (must be exact), offline progress (boundary conditions at 7 days), purchase validation (balance checks). Add integration tests for save/load round-trip

**No Save/Load Round-Trip Validation:**
- Issue: No test that saves state, loads it back, and verifies equality
- Files: All game files
- Impact: Save format could silently corrupt data. Array index changes break silently. Offline progress calculation errors undetected
- Fix approach: Create test fixture saves with known values. Load and verify. Test with edge cases (empty inventory, max stats, negative time deltas)

**No Drag-and-Drop Testing (Klesstann):**
- Issue: Complex drag state machine never tested. Pointer event sequences unvalidated
- Files: `games/klesstann/game.js` drag system
- Impact: Edge cases undetected: rapid drag starts, drop outside viewport, drag during render, multi-touch
- Fix approach: Simulate pointer event sequences. Test invalid drop targets. Verify source cleanup. Test simultaneous drags (should fail gracefully)

---

*Concerns audit: 2026-04-12*
