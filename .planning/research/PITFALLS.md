# Pitfalls Research

**Domain:** Browser-based turn-based racing game with dice mechanics, pixel art, upgrade economy, kid audience (7-13)
**Researched:** 2026-04-12
**Confidence:** HIGH (state management, animation timing, kids UX) / MEDIUM (economy balance, AI difficulty)

## Critical Pitfalls

### Pitfall 1: Monolithic Game State — No Finite State Machine

**What goes wrong:**
Game logic lives in a single object or component with nested `if/else` and boolean flags like `isRolling`, `isAnimating`, `isShopOpen`. Each new feature requires touching the same conditionals, which means regressions multiply. What starts as `if (currentPhase === 'rolling')` becomes an unmaintainable tangle of interdependent booleans within two or three features.

**Why it happens:**
It's faster to add flags than design state. The first few features work fine with booleans, so the pattern persists until the codebase fights every change.

**How to avoid:**
Model game flow as an explicit Finite State Machine from day one. States for Klesstinn Rally: `IDLE → ROLLING → ANIMATING_MOVEMENT → CORNER_CHECK → ROUND_COMPLETE → RACE_END → SHOP`. Each state owns its enter/update/exit logic. Transitions are explicit, not inferred from flag combinations. Any attempt to enter an invalid state throws or warns.

**Warning signs:**
- More than 3 boolean flags controlling turn flow (`isRolling`, `isMoving`, `isWaiting`)
- `if (A && !B && C)` patterns in the game loop
- A feature fix in one phase breaks behavior in another phase

**Phase to address:**
Core game loop implementation — before any UI or animation is layered on top. Define states first, build into them.

---

### Pitfall 2: Animation Timing Desync — Game State Advances Before Visual Completes

**What goes wrong:**
The game state (position, scores) updates instantly while the animation (car moving across spaces, dice spinning) still plays. Players see the car teleport, or the end-of-round summary appears before anyone has finished visually moving. In simultaneous-turn games where all 4 players move at once, this is exponentially worse — you need to sequence or parallelize 4 animations and only advance state when all are done.

**Why it happens:**
Developers update state synchronously, then fire animations as a side effect. JavaScript's event loop makes it easy to accidentally detach the two. `setTimeout` and `setInterval` are used without a coordinated animation queue.

**How to avoid:**
State transitions must be gated behind animation completion. Use an animation queue or Promise chain: resolve all movement animations → then update logical state → then evaluate corners → then check round-end. For simultaneous movement, fire all 4 animations in parallel (Promise.all), wait for all to resolve, then advance. Never mutate game state inside an animation callback — only resolve the promise.

**Warning signs:**
- Position is correct but car is in the wrong visual location
- End-of-round UI appears before animations finish
- Clicking during animation causes weird state jumps

**Phase to address:**
Movement and animation phase — establish the animation contract (state only changes after animation resolves) before building any multi-player simultaneous movement.

---

### Pitfall 3: Dice Result Feels Arbitrary — No Visible Probability Feedback

**What goes wrong:**
Players (especially kids) perceive the dice as rigged when they don't understand the odds. If a Tier 1 engine rolls 1-3 and a Tier 5 engine rolls 4-8, that difference is invisible unless surfaced. Children who get bad corner rolls repeatedly will blame the game rather than understanding tire quality creates variance. This kills the upgrade motivation loop because the cause-effect chain is opaque.

**Why it happens:**
Developers implement the dice math correctly but show only the outcome (the number), not the range. Board games show dice faces; digital games often show only numerals.

**How to avoid:**
Always display the current dice range alongside the roll result. "You rolled 2 (range: 1-3)" communicates that your engine tier is the constraint. Show the tire penalty range during corner events: "Corner penalty: -1 (your tires roll 0-2)." Consider animating the die with the correct number of faces visually. This is the primary feedback loop for the upgrade economy — make it legible.

**Warning signs:**
- Playtest kids saying "this is unfair" or "the computer cheats"
- Players not upgrading tires because they don't see what tires do
- Confusion about why some rolls are bigger than others

**Phase to address:**
Dice mechanic implementation and upgrade shop phase — the range display should ship with the dice, not be added later as polish.

---

### Pitfall 4: Upgrade Economy Breaks After Race 3

**What goes wrong:**
The prize money and upgrade costs are balanced for Race 1 but collapse by Race 3. Either: (a) players max out all upgrades too quickly and the game loses tension, or (b) upgrade costs scale faster than prize money so players are permanently stuck at Tier 1-2. With a 100 starting cash and 5 tiers, there's a narrow viable range — and AI opponents spending money on upgrades changes the competitive math further.

**Why it happens:**
Economy balance requires simulation across many races, which developers skip during feature implementation. Numbers are picked to feel right for one race, not tested across an endless mode session.

**How to avoid:**
Before shipping the shop, simulate 10-15 races on paper/spreadsheet. Track: starting cash → Race 1 prize → upgrade purchased → Race 2 prize → etc. Verify the player can reach Tier 5 after roughly 8-12 races (enough sessions to feel earned, not grind). Ensure a Tier 1 player can still win occasionally against Tier 3 AI through dice variance, or the game feels determined from Race 1. AI upgrade logic must mirror the same economy math.

**Warning signs:**
- Player maxes everything by Race 4 (too fast)
- Player can't afford Tier 3 by Race 8 (too slow)
- AI opponents all reach max tier simultaneously and become a wall

**Phase to address:**
Upgrade economy and shop phase — simulate before implementing, then adjust after first full playthrough.

---

### Pitfall 5: Kids UX — Instructions That Nobody Reads

**What goes wrong:**
Rules, tooltips, or help text are written and ignored. Nielsen Norman Group research confirms that children skip long instruction paragraphs consistently — a finding unchanged across a decade of studies. For Klesstinn Rally, this means "engine upgrades increase movement range" text in an info panel goes unseen. The player rolls, moves, doesn't understand why they moved only 2 spaces, and quits.

**Why it happens:**
Developers explain systems through text because that's fast. The mental model is "the player will read the tooltip." Kids don't.

**How to avoid:**
Teach through outcome, not text. When a player rolls and moves, the UI shows the dice range in context (not in a separate panel). Animate the car moving space-by-space — the count is self-evident. At corners, pause and show the tire dice happening visually before applying the penalty. First race should be a soft tutorial-by-watching: player sees AI roll, move, negotiate corner, before their first turn. If you need text: single words, large font, on the element itself (not a separate tooltip).

**Warning signs:**
- Players confused by the corner mechanic after 3 races
- Nobody buys tire upgrades (they don't know what tires do)
- Playtesting kids asking "why did I only move 2?"

**Phase to address:**
UI/UX implementation phase — feedback design must be in scope, not a polish step.

---

### Pitfall 6: Mobile Touch Targets Too Small

**What goes wrong:**
Buttons, upgrade cards in the shop, and dice interact areas that work on desktop fail on mobile. A shop card that's 120px wide on desktop becomes 60px on a 375px phone. Kids aged 7-10 have lower fine motor precision than adults; the Nielsen Norman Group found that buttons under ~9mm (roughly 34px at 96dpi) cause consistent failures for this age group. Add a pixel art aesthetic and the temptation to make things "retro small" compounds the problem.

**Why it happens:**
Desktop-first development. The responsive design pass happens after everything works, and shrinking UI elements is seen as cosmetic rather than functional.

**How to avoid:**
Design with mobile dimensions first. Minimum tap target: 44x44px (Apple HIG) or 48x48dp (Google Material) — go larger for ages 7-10. The shop should be a vertically scrollable single column on mobile, not a grid. Dice tap area should occupy a large clear zone, not just the dice sprite. Test on an actual phone with a real child if possible.

**Warning signs:**
- You need to zoom to tap upgrade buttons on a 375px screen
- Pixel art die is smaller than a fingernail
- "Back" or "shop" navigation buttons are in corners

**Phase to address:**
Responsive layout phase — must be tested on mobile before any UI is considered "done."

---

### Pitfall 7: Dice Animation Duration Locks Up Gameplay

**What goes wrong:**
A satisfying dice roll animation (spinning, tumbling, landing) feels great on the first race. By Race 5, with 4 players rolling simultaneously every turn, a 2-second animation per roll makes each round feel like waiting in line. D&D Beyond faced exactly this — users explicitly requested skipping or speeding up dice animations once the novelty wore off. For kids with shorter attention spans, the fun-to-wait ratio inverts quickly.

**Why it happens:**
Animation duration is set during initial implementation when it feels novel. Nobody playtests 20+ rounds in a row and measures the cumulative wait time. Simultaneous rolls (all 4 players at once) mean the wait is the longest single animation, not the sum — but that's only true if they're correctly parallelized.

**How to avoid:**
Keep dice animation under 800ms for the core roll. Parallelize all 4 players' dice rolls — they all animate at the same time, not sequentially. Allow the animation to be interrupted or accelerated on tap/click (tap to resolve immediately). Consider a "fast mode" option in settings for repeat players. Movement animation (car moving across spaces) should be quick but distinct — 200-300ms per space maximum.

**Warning signs:**
- A full round (all rolls + all movement) takes more than 8 seconds
- Playtesters clicking repeatedly during animations
- You find yourself saying "it's fine, the animation is fun" without measuring

**Phase to address:**
Animation/dice phase — measure round duration from start. Set a target (full round under 6 seconds) and test against it.

---

### Pitfall 8: AI Opponents Feel Rigged (Rubber Banding Trap)

**What goes wrong:**
Two failure modes: (a) AI too good — always in top position due to optimal upgrade decisions, making the player feel the game is unfair from Race 3 onward. (b) AI too obviously rubber-banding — catches up suspiciously regardless of player skill, which savvy kids (especially ages 10-13) immediately notice and resent. Both destroy motivation to upgrade and race.

**Why it happens:**
Simple AI (spend money when you have it, roll dice same as player) can accidentally be too optimal if upgrade costs are low. Rubber banding is added as a band-aid for difficulty without a principled approach.

**How to avoid:**
AI should follow the same dice rules and prize economy as the player — no hidden bonuses. Difficulty comes from upgrade spending behavior: "aggressive" AI buys engine first, "balanced" alternates, "cautious" waits for deals. Natural dice variance at 5 upgrade tiers provides enough spread without cheating. If AI needs handicapping, do it through upgrade tier limits (AI is capped at Tier 3 on "easy"), not dice manipulation. Keep AI logic transparent and consistent.

**Warning signs:**
- AI opponents always finish in the same relative order regardless of dice
- A child says "the computer always wins even when I roll better"
- You add an if-statement that gives AI a bonus based on player position

**Phase to address:**
AI implementation phase — define the AI decision rules clearly before implementing. Prototype with visible AI logic (debug mode showing AI "thinking").

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Boolean flags for turn phase | Fast to add, no architecture overhead | Unmaintainable by feature 5; race conditions in async code | Never — use FSM from the start |
| Hardcoded prize/cost numbers | No design tool needed | Economy breaks silently; balancing requires code changes | Only in early throwaway prototypes |
| Sequential AI turns after player | Simpler to implement | Slower rounds; breaks simultaneous-turn design contract | Never for this game — all must resolve together |
| `setTimeout` for animation gates | Easy one-off | Timing drifts; can't pause/skip; hard to test | Only for throwaway proof-of-concept |
| Inline styles for pixel art scaling | Quick fix | Blurry sprites on some screens; no `image-rendering: pixelated` | Never — use CSS class from day one |
| Single canvas element for everything | Simple start | No compositing; can't animate layers independently | Only in pre-architecture spike |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Canvas redrawing entire scene every frame | Janky animation on low-end mobile; battery drain | Dirty-rect rendering or layered canvases; only redraw changed regions | On mid-range phones with large canvas |
| Pixel art scaling without `image-rendering: pixelated` | Blurry sprites at any non-native resolution | Set `image-rendering: pixelated` (CSS) + `imageSmoothingEnabled = false` (canvas context) | Always — visible immediately |
| High-DPI canvas not accounting for devicePixelRatio | Blurry on Retina screens | Multiply canvas dimensions by `window.devicePixelRatio`, scale context | On all Retina/HDPI devices |
| Loading sprite sheets as separate images | Slow initial load; multiple network requests | Combine sprites into a single spritesheet PNG | On slow mobile connections |
| Uncontrolled animation loops after tab switches | Battery drain; ghost animations on return | Pause loop via `document.visibilitychange` event | Immediately on any background tab |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Text-only explanation of upgrade benefits | Kids don't read; upgrades feel meaningless | Show dice range change visually in shop ("Tier 2: roll 1-4" with mini dice graphic) |
| Single-color position tracker | Kids can't track who's winning at a glance | Distinct car colors with bold labels; position numbers large and persistent |
| No acknowledgment of dice result before moving | Action feels disconnected from cause | Brief pause (300ms) highlighting the rolled number before car starts moving |
| Corner penalty applied silently | Unexpected movement loss feels like a bug | Animate the tire dice separately at corners; show the penalty subtraction |
| Shop presented as a modal popup | Hard to compare upgrades; claustrophobic on mobile | Full-screen shop view with persistent race result visible above fold |
| No idle/waiting indicator for AI turns | Kids think the game froze | Subtle animation (AI car "revving," thinking dots) while AI resolves |
| Error or "nothing to buy" states not styled | Looks broken | Design empty/disabled states — greyed upgrade cards when unaffordable |

---

## "Looks Done But Isn't" Checklist

- [ ] **Dice mechanics:** Range changes per tier are implemented — verify Tier 1 vs Tier 5 produces statistically different results over 100 rolls
- [ ] **Corner system:** Tire dice at corners correctly reduce that round's movement, not total speed — verify a corner on space 5 doesn't affect space 8
- [ ] **Simultaneous turns:** All 4 cars animate in parallel, not sequentially — verify with a stopwatch that 4-player round = ~1 car's animation duration
- [ ] **Prize money:** Position tracking is correct across a full 2-lap race (40 spaces) — verify AI finishing order matches visual positions
- [ ] **Endless mode:** Race number increments correctly and shop resets/persists appropriately each race
- [ ] **Mobile layout:** All tap targets pass the 44px minimum — verify on 375px wide viewport (iPhone SE size)
- [ ] **Pixel art rendering:** `image-rendering: pixelated` applied and sprites are sharp on both 1x and 2x DPI screens
- [ ] **State machine completeness:** Every possible player action during an invalid state is either ignored or shows feedback — spam-clicking during animation does nothing
- [ ] **Session state:** Refreshing the page mid-race prompts a clear "start new race?" or gracefully restores — unhandled refresh should not leave orphaned state
- [ ] **AI logic:** AI spends money deterministically — given the same cash amount, AI always makes the same decision (no hidden RNG in spending)

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Monolithic state (boolean flags) | HIGH | Refactor to FSM incrementally — extract one state at a time; highest-risk operation in the codebase |
| Animation desync | MEDIUM | Add a central animation queue manager; audit all state-mutation sites to check they await animation |
| Economy imbalance | LOW | Adjust numbers in a constants file; re-simulate; no architectural change needed if constants are isolated |
| Touch targets too small | LOW | CSS padding and min-height adjustments; usually a half-day fix if layout was componentized |
| Dice too slow | LOW | Reduce animation duration constant; add tap-to-skip; test duration in round-time measurement |
| AI too strong/rubber-banding | MEDIUM | Redesign AI spend logic; if rubber-band code is scattered through game loop, significant extraction needed |
| Blurry pixel art | LOW | Two-line CSS fix; apply globally to all game elements |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Monolithic state / no FSM | Phase 1: Core architecture | Code review — no boolean turn flags exist; state transitions are explicit |
| Animation desync | Phase 2: Movement and animation | Automated: Assert game state only changes after Promise resolves |
| Dice feedback opacity | Phase 2: Dice mechanic implementation | Playtesting: Non-developer child can explain what engine/tire tier does |
| Economy imbalance | Phase 3: Upgrade shop | Simulation: Spreadsheet model of 15 races before code; play 10 full races before ship |
| Kids UX (no reading) | Phase 3: UI/UX | Playtesting with target age group: Kids navigate shop without verbal prompting |
| Mobile touch targets | Phase 3: Responsive layout | Device test: All interactions work on 375px with fat-finger tapping |
| Dice animation too slow | Phase 2: Animation | Stopwatch: Full 4-player round completes in under 6 seconds |
| AI feels rigged | Phase 4: AI opponents | Debug mode showing AI decision logic; playtest 10 races without player complaint |

---

## Sources

- Nielsen Norman Group — Children's UX usability research: https://www.nngroup.com/articles/childrens-websites-usability-issues/
- Nielsen Norman Group — Physical development and UX for children: https://www.nngroup.com/articles/children-ux-physical-development/
- Outscal — Turn-based game architecture (FSM patterns): https://outscal.com/blog/turn-based-game-architecture
- Game Programming Patterns — State pattern: https://gameprogrammingpatterns.com/state.html
- Kvachev — Simultaneous turns design analysis: https://kvachev.com/blog/posts/simultaneous-turns/
- Game AI Pro — Rubber banding in racing games: http://www.gameaipro.com/GameAIPro/GameAIPro_Chapter42_A_Rubber-Banding_System_for_Gameplay_and_Race_Management.pdf
- MDN — Crisp pixel art in canvas: https://developer.mozilla.org/en-US/docs/Games/Techniques/Crisp_pixel_art_look
- D&D Beyond forums — Dice animation too slow (real-world user complaints): https://www.dndbeyond.com/forums/d-d-beyond-general/d-d-beyond-feedback/digital-dice-feedback/103912-roll-result-is-too-slow-can-we-use-dice-roller
- Game Developer — Balancing in-game economy: https://www.gamedeveloper.com/design/5-basic-steps-in-creating-balanced-in-game-economy
- Game Wisdom — Rubber banding AI design: https://game-wisdom.com/critical/rubber-banding-ai-game-design

---
*Pitfalls research for: browser-based turn-based rally racing game (kids 7-13, dice mechanics, upgrade economy)*
*Researched: 2026-04-12*
