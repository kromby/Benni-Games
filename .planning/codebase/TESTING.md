# Testing Patterns

**Analysis Date:** 2026-04-12

## Test Framework

**Runner:**
- No test framework detected (no `jest.config.*`, `vitest.config.*`, `package.json` with test dependencies)
- No test files found in codebase

**Assertion Library:**
- None; no testing infrastructure

**Run Commands:**
- No test commands configured
- No test scripts in `package.json` (file not present)

## Test File Organization

**Location:**
- No test files present
- No `__tests__`, `test/`, or `tests/` directories
- No `*.test.js`, `*.spec.js`, or similar test files detected

**Naming:**
- N/A

**Structure:**
- N/A

## Manual Testing Approach

**Current Practice:**

All testing appears to be manual, ad-hoc browser testing. Games are run by:
1. Opening `index.html` in a browser
2. Manually clicking, dragging, and interacting with UI elements
3. Visually verifying output and state changes

**Evidence:**
- Each game is a single `game.js` file with no test fixtures or mocks
- No console output or assertions in code
- Games rely on browser console for occasional debugging (`console.warn` appears once in my-clicker-game/game.js)

## Test Structure

**Game-Specific Behavior:**

**Klesstann** (`games/klesstann/game.js`):
- Drag-and-drop car building game
- Test scenarios (inferred, not automated):
  - Can purchase parts with sufficient money
  - Cannot purchase parts without sufficient money
  - Parts drag from inventory to grid cells
  - Grid cells only accept parts on chassis areas
  - Stats calculate correctly based on placed parts
  - Inventory updates when parts placed/removed
  - Game saves/loads from localStorage
  - Autosave every 30 seconds

**FH Clicker** (`games/my-clicker-game/game.js`):
- Clicker game with upgrades and buildings
- Test scenarios (inferred):
  - Click increments `kokur` by `kokurPerSmell`
  - Upgrades increase click power
  - CPS (cookies per second) upgrades increase passive income
  - Multiplier upgrades (2x) compound correctly
  - Cost scaling (1.15x per owned) calculates correctly
  - Rebirth resets progression and increases future multiplier
  - Offline progress calculated correctly when game reloads
  - Shop UI enables/disables buttons based on affordability
  - Badge shows when something can be purchased

**life2.0** (`games/life2/game.js`):
- Life simulation game with time progression
- Test scenarios (inferred):
  - Time advances through morning → day → evening → night → morning
  - Day count increments when entering morning
  - Actions (sleep, eat, work) modify stats and time
  - Energy clamped to [0, 100]
  - Mood clamped to [0, 100]
  - Money increases through work
  - Food inventory increases through purchases
  - Food consumed during eat action
  - Work requires minimum energy (20)
  - Eat requires food in inventory
  - Localization toggles between Icelandic and English

## Mocking

**Framework:** None

**Test Data:**
- No fixtures or test factories
- State initialized via `defaultState()` helper function in life2.0:
  ```javascript
  function defaultState(lang) {
    return {
      energy: 80,
      mood: 70,
      money: 0,
      food: 0,
      time: "day",
      dayCount: 1,
      language: lang || "is",
    };
  }
  ```
- Klesstann catalog defined as hardcoded array: `SHOP_CATALOG`

**What Would Need Mocking:**
- `localStorage` (currently real)
- `document` methods (currently interact with real DOM)
- `performance.now()` (used for offline calculations)
- `requestAnimationFrame()` (used in game loops)

## Fixtures and Factories

**Test Data:**

Hardcoded in each game file:

**Klesstann parts catalog:**
```javascript
var SHOP_CATALOG = [
  { id: "vel1", type: "vel", tier: 1, name: "Lítil vél", price: 500, stats: { hradi: 5, kraftur: 3 } },
  { id: "vel2", type: "vel", tier: 2, name: "Meðal vél", price: 1500, stats: { hradi: 12, kraftur: 8 } },
  // ... 16 more items
];
```

**FH Clicker upgrades:**
```javascript
var upgrades = [
  { id: "betri-mus", name: "Betri mús", baseCost: 50, owned: 0, bonus: 1 },
  { id: "hradari-fingur", name: "Hraðari fingur", baseCost: 200, owned: 0, bonus: 2 },
  // ... 12 more upgrades
];
```

**location:** All hardcoded within game.js files

## Coverage

**Requirements:** None enforced

**Current State:** No coverage metrics, no coverage tools

## Testing Gaps

**Critical Untested Areas:**

1. **Drag-and-Drop (Klesstann):**
   - Pointer events (`pointerdown`, `pointermove`, `pointerup`)
   - Ghost element positioning
   - Drop validation logic
   - Cannot be tested without browser automation

2. **localStorage Persistence:**
   - Save/load cycle across page reloads
   - Corruption handling
   - quota exceeded errors
   - Manual testing only

3. **Performance:**
   - Game loop tick performance (my-clicker-game)
   - Render frequency and DOM update efficiency
   - No profiling tools present

4. **Offline Progress (my-clicker-game):**
   - Calculation when `dt` exceeds expected bounds
   - Seven-day limit: `if (dt > 0 && dt < 86400 * 7)`
   - Requires mocking `performance.now()`

5. **Stat Calculations:**
   - Klesstann: Stat aggregation across placed parts
   - Edge cases (no parts, max parts)
   - Preview calculations during drag
   - Complex formula testing

6. **Localization (life2.0):**
   - All language keys present and correct
   - i18n data structure consistency
   - Language toggle persistence
   - Fallback behavior for missing keys

## Recommended Testing Strategy

If testing were implemented, these patterns would apply:

**Unit Test Structure:**
```javascript
// Example: calculateStats function (Klesstann)
describe('calculateStats', () => {
  it('should return zero stats with empty grid', () => {
    // Reset state.grid to all nulls
    const stats = calculateStats();
    expect(stats.hradi).toBe(0);
    expect(stats.kraftur).toBe(0);
  });

  it('should sum stats from multiple parts', () => {
    // Place two parts on grid
    state.grid[0] = 'vel1'; // +5 hradi, +3 kraftur
    state.grid[1] = 'eld1'; // +5 kraftur, +2 hradi
    const stats = calculateStats();
    expect(stats.hradi).toBe(7);
    expect(stats.kraftur).toBe(8);
  });
});
```

**Integration Test Pattern:**
```javascript
// Example: buyPart action (Klesstann)
describe('buyPart workflow', () => {
  beforeEach(() => {
    state.money = 1000;
    state.inventory = {};
  });

  it('should deduct money and add to inventory', () => {
    buyPart('vel1'); // costs 500
    expect(state.money).toBe(500);
    expect(state.inventory['vel1']).toBe(1);
  });

  it('should not allow purchase without sufficient money', () => {
    state.money = 100;
    buyPart('vel1'); // costs 500
    expect(state.money).toBe(100); // unchanged
    expect(state.inventory['vel1']).toBeUndefined();
  });
});
```

**E2E Test Pattern:**
```javascript
// Example: drag part from inventory to grid (requires browser automation)
describe('Drag and drop', () => {
  it('should move part from inventory to grid cell', async () => {
    // Use Puppeteer/Playwright/Selenium
    const invCard = await page.$('[data-catalog-id="vel1"]');
    const gridCell = await page.$('[data-index="15"]');
    
    await invCard.drag(gridCell);
    
    const hasPart = await gridCell.$('.part-placed');
    expect(hasPart).toBeTruthy();
  });
});
```

## Browser Compatibility Testing

**Current Scope:**
- Games tested manually in modern browsers
- No polyfills or compatibility code present
- `performance.now()`, `localStorage`, `pointer events` all modern APIs
- No IE support indicated

**Dependencies on Modern APIs:**
- `requestAnimationFrame()` (required for game loops)
- `localStorage` (data persistence)
- Pointer Events (drag-and-drop, not legacy mouse events)
- ES5+ JavaScript (arrow functions not used, but const/let not available)
- CSS Grid (klesstann layout)

---

*Testing analysis: 2026-04-12*
