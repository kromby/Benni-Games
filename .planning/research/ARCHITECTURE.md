# Architecture Research

**Domain:** Browser-based turn-based racing game (session-only, no backend)
**Researched:** 2026-04-12
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         SCREEN LAYER                            │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────────┐   │
│  │  Race Screen  │  │  Shop Screen  │  │  Results Screen   │   │
│  │ (track + HUD) │  │ (upgrades UI) │  │  (podium + pay)   │   │
│  └───────┬───────┘  └───────┬───────┘  └─────────┬─────────┘   │
│          │                  │                     │             │
├──────────┴──────────────────┴─────────────────────┴────────────-┤
│                      GAME CONTROLLER                            │
│              (Finite State Machine — phase router)              │
│    SETUP → RACE → RESULTS → SHOP → RACE → RESULTS → SHOP …     │
├────────────────────────────────────────────────────────────────-┤
│                       LOGIC LAYER                               │
│  ┌────────────┐  ┌───────────┐  ┌──────────┐  ┌─────────────┐  │
│  │ RaceEngine │  │ DiceSystem│  │ AIBrain  │  │ UpgradeCalc │  │
│  │(movement,  │  │(roll, anim│  │(spend &  │  │(stat lookup │  │
│  │ position,  │  │ callback) │  │ choose   │  │ by tier)    │  │
│  │ lap track) │  │           │  │ upgrades)│  │             │  │
│  └────────────┘  └───────────┘  └──────────┘  └─────────────┘  │
├────────────────────────────────────────────────────────────────-┤
│                        STATE LAYER                              │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                     GameState (POJO)                    │    │
│  │  racers[]  ·  track  ·  economy  ·  phase  ·  raceNum  │    │
│  └─────────────────────────────────────────────────────────┘    │
├────────────────────────────────────────────────────────────────-┤
│                        DATA LAYER                               │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐  │
│  │  TRACK_DEF   │  │ UPGRADE_TIERS│  │     PRIZE_TABLE       │  │
│  │ (spaces,     │  │ (engine 1-5, │  │  (1st=400, 2nd=250,   │  │
│  │  corners)    │  │  tires 1-5)  │  │   3rd=150, 4th=75)    │  │
│  └──────────────┘  └──────────────┘  └───────────────────────┘  │
└────────────────────────────────────────────────────────────────-┘
```

### Component Responsibilities

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| GameController (FSM) | Owns phase transitions: SETUP, RACING, RESOLVING_TURN, RESULTS, SHOP | All screens; calls into RaceEngine and AIBrain |
| RaceScreen | Renders the track, car positions, HUD (cash, lap, turn counter); animates movement | Reads GameState; receives render() calls from Controller |
| ShopScreen | Renders upgrade cards, handles player buy actions | Writes to GameState.economy; triggers Controller phase change |
| ResultsScreen | Shows finishing order, prize payouts, total cash | Reads race result snapshot; triggers Controller on "continue" |
| RaceEngine | Computes movement for one round: roll dice, apply corner penalty, advance position | Reads GameState.racers + UPGRADE_TIERS; returns deltas |
| DiceSystem | Rolls dice with async animation callback; returns numeric result | Called by RaceEngine; fires animation into RaceScreen |
| AIBrain | Decides what upgrades each AI buys after a race; deterministic, no randomness required | Reads GameState.economy per AI; writes purchase decisions |
| UpgradeCalc | Pure function: given tier levels, returns dice ranges and corner penalty values | Called by RaceEngine; called by ShopScreen for preview |
| GameState | Single plain object holding all mutable game data | Read/written by everything via Controller; never accessed cross-component directly |
| DATA constants | TRACK_DEF, UPGRADE_TIERS, PRIZE_TABLE — immutable config objects | Read-only from all components |

## Recommended Project Structure

```
games/klesstinn-rally/
├── index.html              # Shell: one div#app, no game markup here
├── style.css               # All styles; pixel art font, responsive grid
├── game.js                 # Entry point — bootstraps Controller
├── constants.js            # TRACK_DEF, UPGRADE_TIERS, PRIZE_TABLE, AI_NAMES
├── state.js                # makeInitialState() — returns fresh GameState POJO
├── controller.js           # FSM: manages phase, calls into engine and screens
├── raceEngine.js           # computeRound(state) — pure logic, returns deltas
├── diceSystem.js           # rollDice(sides, onFrame) — async, animation-aware
├── aiBrain.js              # chooseUpgrades(aiRacer, money, catalog) — pure
├── upgradeCalc.js          # getEngineDice(tier), getCornerDie(tier) — pure
├── screens/
│   ├── raceScreen.js       # render(state, container), animateMove(racer, steps)
│   ├── shopScreen.js       # render(state, container), onBuy callback
│   └── resultsScreen.js    # render(results, container), onContinue callback
└── assets/
    └── (pixel art sprites, font)
```

### Structure Rationale

- **One JS file per concern:** Matches the repo's existing pattern (klesstann uses a single `game.js`); split only at natural boundaries so each file has a clear job.
- **constants.js separate from state.js:** Constants are frozen at load time; state is the only mutable thing. Keeping them apart prevents accidental mutation of config.
- **screens/ subfolder:** Each screen is independently renderable and testable. The Controller mounts/unmounts screens into `#app`; screens never mount themselves.
- **No build step assumed:** Vanilla JS modules via `<script type="module">` work natively in modern browsers. Matches Klesstann's zero-toolchain pattern.

## Architectural Patterns

### Pattern 1: Finite State Machine for Game Phases

**What:** A single `phase` variable (string or symbol) drives everything. All logic checks `state.phase` before acting. Transitions are explicit `changePhase(newPhase)` calls that run exit/enter hooks.

**When to use:** Always — this is the backbone. Turn-based games have hard phase boundaries (you cannot roll dice during the shop screen). FSM prevents illegal state combinations.

**Trade-offs:** Slightly verbose to set up; pays off immediately when adding a new screen or phase because there is exactly one place to add the transition.

**Example:**
```javascript
// controller.js
const PHASES = {
  SETUP:           'SETUP',
  ROLLING:         'ROLLING',
  ANIMATING:       'ANIMATING',
  ROUND_RESULTS:   'ROUND_RESULTS',
  RACE_RESULTS:    'RACE_RESULTS',
  SHOP:            'SHOP',
};

function changePhase(newPhase) {
  EXIT_HOOKS[state.phase]?.();
  state.phase = newPhase;
  ENTER_HOOKS[newPhase]?.();
}

const ENTER_HOOKS = {
  [PHASES.ROLLING]: startRound,
  [PHASES.SHOP]:    () => shopScreen.render(state, appEl),
  [PHASES.RACE_RESULTS]: () => resultsScreen.render(lastRaceResult, appEl),
};
```

### Pattern 2: Pure Logic Functions with State Deltas

**What:** `raceEngine.js` and `aiBrain.js` are pure — they accept state as input and return a result object (deltas), never mutating state directly. The Controller applies deltas.

**When to use:** All game logic. Pure functions are trivially testable in the browser console, easy to reason about, and safe to call multiple times (e.g., to preview outcomes).

**Trade-offs:** Requires the Controller to act as the commit layer. Adds one indirection but prevents logic scattered across files from racing to mutate state.

**Example:**
```javascript
// raceEngine.js — pure, returns deltas
function computeRound(state) {
  return state.racers.map(racer => {
    const engineRoll = rollSync(getEngineDice(racer.engineTier));
    const isCorner   = isOnCorner(racer.position, state.track);
    const tirePenalty = isCorner ? rollSync(getCornerDie(racer.tireTier)) : 0;
    const steps = Math.max(0, engineRoll - tirePenalty);
    return { racerId: racer.id, steps, engineRoll, tirePenalty };
  });
}
// controller.js applies deltas:
deltas.forEach(d => advanceRacer(state, d.racerId, d.steps));
```

### Pattern 3: Screen-as-Function (no persistent screen objects)

**What:** Each screen exports `render(state, container)` and one or more callback registrations. The Controller calls `render` when entering a phase; the screen tears itself down when called again or replaced.

**When to use:** Session-only games with a small number of distinct screens. Avoids the complexity of a virtual DOM or component lifecycle framework.

**Trade-offs:** Full re-renders on each call are fine for this game's scale (20 track spaces, 4 racers). If animation state needs preserving between renders, hold it in a local closure variable inside the screen module.

## Data Flow

### Turn Resolution Flow

```
Player presses "Roll" button
        |
        v
Controller (phase: ROLLING)
        |
        v
raceEngine.computeRound(state)      -- pure, sync dice for AI; async for player display
        |
        v
DiceSystem.rollDice(sides, onFrame) -- fires animation frames into RaceScreen
        |
        v
Controller receives deltas
        |
        v
Controller applies deltas → state.racers[].position updated
        |
        v
RaceScreen.render(state)            -- redraws track + HUD
        |
        v
Controller checks: race over? → changePhase(RACE_RESULTS)
                   else       → changePhase(ROLLING) for next round
```

### Economy Flow (Shop Phase)

```
ResultsScreen: onContinue callback fires
        |
        v
Controller: apply prize money to state.economy[]
            run aiBrain.chooseUpgrades() for each AI
            apply AI purchases to state.racers[].engineTier / .tireTier
            changePhase(SHOP)
        |
        v
ShopScreen.render(state) — shows catalog, player cash
        |
        v
Player clicks upgrade card
        |
        v
ShopScreen calls onBuy(upgradeId) callback (registered by Controller)
        |
        v
Controller validates affordability, applies to state, re-renders shop
        |
        v
Player clicks "Race!" → Controller changePhase(ROLLING), increment raceNum
```

### Key Data Flows Summary

1. **State is always written by the Controller, never by screens or engines.** Screens call registered callbacks; engines return deltas; the Controller commits.
2. **Rendering is always triggered by the Controller.** No screen subscribes to state changes autonomously. Simple call-and-render, no reactive system needed.
3. **AI runs synchronously in the shop phase,** not during the race. This keeps turn animation clean and avoids async complexity for AI decisions.
4. **Dice animation is the only async path.** Everything else is synchronous. DiceSystem accepts an `onComplete(result)` callback to resume game flow after animation finishes.

## Scaling Considerations

This game is session-only with 4 racers and 20 track spaces. Scaling is not a concern. Architecture decisions are optimised for:

| Concern | Approach |
|---------|----------|
| Maintainability | Small files, pure functions, single state object |
| Mobile performance | No canvas, DOM-based rendering (CSS grid for track is sufficient) |
| Kid-friendly readability | Large DOM elements that are easy to style, no WebGL complexity |
| Endless mode | raceNum counter in state, loop is just phase cycling forever |

## Anti-Patterns

### Anti-Pattern 1: Distributed Mutable State

**What people do:** Let each screen or component hold its own copy of racer positions or cash totals.
**Why it's wrong:** State desync bugs — the shop shows different cash than the results screen calculated. Extremely hard to debug.
**Do this instead:** Single `GameState` POJO owned by the Controller. Screens receive it as a parameter and never store their own copy.

### Anti-Pattern 2: Mixing Animation and Logic

**What people do:** Await animation completion inside game logic functions (e.g., `await animateDice()` inside `computeRound()`).
**Why it's wrong:** Makes logic untestable, binds game rules to presentation timing, and creates subtle bugs when animation is skipped or runs at different frame rates.
**Do this instead:** Logic runs synchronously and returns results. Animation is a separate step that the Controller triggers with the already-computed result. Pattern: compute → animate with result → commit to state.

### Anti-Pattern 3: No Phase Boundaries (Flag Soup)

**What people do:** Use boolean flags like `isRacing`, `isInShop`, `isDiceRolling` scattered across the codebase.
**Why it's wrong:** Exponential combination of flags leads to impossible states (rolling dice while in shop). Adding a new phase requires hunting all flag checks.
**Do this instead:** One `phase` string in state. All conditional logic reads `state.phase`. Transitions go through `changePhase()`.

### Anti-Pattern 4: Canvas When DOM Is Sufficient

**What people do:** Reach for `<canvas>` for any game with movement and animation.
**Why it's wrong:** For a 20-space track with pixel art sprites, the DOM handles it fine and gives free accessibility, responsive layout, and CSS transitions. Canvas requires manual layout math, hit testing, and pixel scaling for mobile.
**Do this instead:** CSS grid or flexbox for the track layout. CSS `transform: translateX()` or class toggling for car position. Use canvas only if you need per-pixel particle effects or need >60 moving elements simultaneously.

## Integration Points

### Internal Boundaries

| Boundary | Communication | Direction |
|----------|---------------|-----------|
| Screen → Controller | Registered callbacks (onBuy, onContinue, onRoll) | Screen fires, Controller handles |
| Controller → Screen | Direct function call: `screen.render(state, el)` | Controller drives |
| Controller → RaceEngine | Function call: `raceEngine.computeRound(state)` returns deltas | Controller drives |
| Controller → AIBrain | Function call: `aiBrain.chooseUpgrades(racer, money)` returns purchases | Controller drives |
| RaceEngine → DiceSystem | Function call: `diceSystem.roll(sides, onFrame, onComplete)` | Engine drives animation |
| DiceSystem → RaceScreen | `onFrame(value)` callback to update dice display | DiceSystem drives display |
| Everything → DATA constants | Import (read-only) | One-way |

### No External Services

This game has no external integrations. All state is in-memory. Session ends when the browser tab closes. This is by design per PROJECT.md ("Session-only, no backend or accounts needed").

## Suggested Build Order

Build in this order — each step produces something playable/testable before the next:

1. **DATA layer** — `constants.js` with TRACK_DEF, UPGRADE_TIERS, PRIZE_TABLE. No rendering, just config. Verify in console.
2. **State** — `state.js` with `makeInitialState()`. Verify shape in console.
3. **UpgradeCalc + RaceEngine** — Pure logic only. Console-test: does a tier-3 engine + corner penalty produce sensible movement numbers?
4. **Track rendering** — `raceScreen.js` skeleton that can draw the track and place 4 car tokens. First visual milestone.
5. **DiceSystem + roll animation** — Animate a dice roll on screen. This is the primary "feel" moment; get it right early.
6. **Controller FSM + one full round** — Wire ROLLING → ANIMATING → ROUND_RESULTS for a single round. Player can roll, cars move.
7. **Lap/win detection** — Add to RaceEngine. Controller transitions to RACE_RESULTS when a racer completes 2 laps.
8. **ResultsScreen** — Show finishing order and prize payouts.
9. **ShopScreen + player upgrades** — Player can spend money on engine/tires before next race.
10. **AIBrain** — AI spends its money on upgrades between races. Endless loop now works.
11. **Polish** — Pixel art sprites, responsive layout, dice sound, position indicators for kids.

## Sources

- [Turn-Based Game Architecture Guide](https://outscal.com/blog/turn-based-game-architecture) — FSM, Command pattern, component boundaries (MEDIUM confidence — community article, well-aligned with standard patterns)
- [Game Programming Patterns: State](https://gameprogrammingpatterns.com/state.html) — Canonical FSM reference by Robert Nystrom (HIGH confidence — authoritative game dev reference)
- [Game Programming Patterns: Game Loop](https://gameprogrammingpatterns.com/game-loop.html) — Turn-based loop vs real-time loop distinction (HIGH confidence)
- [Decoupling Input, Game Logic, and Rendering](https://gamedevfaqs.com/decoupling-input-game-logic-and-rendering-in-the-game-loop-for-maintainability/) — Separation of concerns for game components (MEDIUM confidence)
- Klesstann source at `games/klesstann/game.js` — Existing codebase conventions (vanilla JS IIFE, DOM-based rendering, single state object) — HIGH confidence, first-party

---
*Architecture research for: Klesstinn Rally — browser-based turn-based racing game*
*Researched: 2026-04-12*
