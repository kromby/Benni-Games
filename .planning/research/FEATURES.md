# Feature Research

**Domain:** Browser-based turn-based dice racing game (kids 7-13)
**Researched:** 2026-04-12
**Confidence:** MEDIUM — Turn-based racing is a niche genre. Findings draw from board game design (Formula D, Downforce, Cubitos), digital racing game UX research, and kids UX literature. Niche gap: no direct analog exists as a browser game with this exact mechanic set.

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features that feel broken or absent if missing. For this genre, "users" are kids 7-13 playing a free browser game — the bar is set by any casual racing game they've touched.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Race track rendered visually | You can't race on an invisible track | LOW | Square grid, 20 spaces, clear lane boundaries |
| All 4 cars visible and moving | Players need to see everyone at once | LOW | Board game convention — everything is on-screen |
| Live position indicator (1st/2nd/3rd/4th) | Racing means knowing who is winning right now | LOW | Update each time any car moves; large, always visible |
| Lap counter | Players need to know progress toward end | LOW | "Lap 1 of 2" displayed clearly; not hidden in a menu |
| Animated dice roll | Rolling and movement is the core action — it must feel physical and exciting | MEDIUM | The dice animation is where all the game-feel juice lives |
| Turn-by-turn result clarity | What happened this turn? Who moved how far? | MEDIUM | Log or callout per turn; kids can't parse ambiguity |
| Corner event feedback | Tires rolling must feel distinct from normal movement | MEDIUM | Visual/sound difference between normal roll and corner check |
| Race end screen with positions | Show who won and what prize each racer earned | LOW | Must display 1st-4th clearly; prize amount shown |
| Upgrade shop between races | The earn-to-upgrade loop requires a shop | MEDIUM | Must be navigable without reading; icons carry the weight |
| Current balance displayed at all times | Economy only works if players can see their money | LOW | Large coin/money counter; always visible in shop |
| Upgrade effect communicated | Players need to understand what buying does | MEDIUM | Show dice range change (e.g., "Roll 2-6 instead of 1-4") |
| Restart / play again | Sessions must be continuable without reload | LOW | Button on race-end screen; preserves upgrades |
| Responsive layout | Kids are on phones and tablets as often as desktops | MEDIUM | Square track must render readably on portrait mobile |
| Pixel art visual style | Aesthetic contract with target audience | MEDIUM | 8/16-bit retro; sprites for cars, track tiles, dice faces |

### Differentiators (Competitive Advantage)

Features that set Klesstinn Rally apart. The genre is thin enough that correctness is almost a differentiator — but these are the elements that make the loop memorable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Simultaneous turn resolution | All 4 cars roll and move in the same turn, not sequential | MEDIUM | Removes waiting; every round has 4 things happening at once — rare in digital turn-based games |
| Tire-check drama at corners | The corner roll is a distinct, named event with its own consequence | LOW | Creates a recurring tension spike; corner = suspense moment |
| Economy tier progression (5 levels) | Granular upgrade steps reward multiple races, not just one big jump | LOW | More satisfying than binary "bad/good"; kids feel incremental improvement |
| Asymmetric upgrade axes | Engine vs tires is a meaningful strategic choice, even for young players | LOW | Kids choose: go fast or survive corners? Simple but real |
| Prize money differential by position | 4th still earns something (75); 1st earns much more (400) | LOW | Avoids punishing bad luck; comeback is always possible |
| "Endless" session structure | No season end; kids race as long as they want | LOW | Respects child autonomy; no pressure of a fixed end state |
| Named AI opponents with cars | Opponents as characters, not anonymous | LOW | Even simple names/car sprites make AI feel like rivals, not robots |
| Starting cash giving immediate agency | 100 coins before first race means first choice is immediate | LOW | Kids get to do something before the first race even runs |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem like additions but undermine the core loop for this audience and scope.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Multiplayer (vs real players) | Racing is inherently social | Requires backend, matchmaking, latency handling, session management — all out of scope for V1; also removes the "play anytime" casual hook | Three AI opponents named and differentiated enough to feel social |
| Tile events (random track events) | Adds variety and unpredictability | Creates rules complexity that exceeds the cognitive load ceiling for 7-year-olds; also requires balancing per-tile; conflicts with "readable at a glance" requirement | Corner checks already provide the unpredictability spike |
| Tire degradation during race | Adds simulation depth | Adds a stat that must be tracked and displayed during a race; kids cannot watch multiple degrading meters while tracking position; creates "hidden penalty" frustration | Tire upgrade tier handles between-race consequence without mid-race bookkeeping |
| Sabotage mechanics | Player interaction makes racing feel competitive | Negative interactions (slowing others, blocking) frustrate young players; punishes the leader; creates zero-sum tension that feels unfair, not fun | The natural rubber-band effect of dice variance handles catch-up without sabotage |
| Leaderboards / accounts | Persistence and social proof | Requires backend; raises COPPA concerns for under-13; session-only is simpler and more private | Endless mode gives intrinsic goal: "can I max out my upgrades?" |
| Gear shifting | Simulation realism | Formula D uses gears as its core mechanic — it works there because the gear choice is the strategic action. Here, dice roll is the action; layering gear choice adds a second decision per turn with no payoff for kids | Upgrade tier handles the "car getting faster" feeling across races, not within them |
| Animated track / camera follow | Cinematic feel | If the camera follows a single car, the player loses sight of rivals — the entire board-game-style overview is the core UX value | Fixed top-down view of the full track; all cars always visible |
| Complex AI difficulty settings | Accessibility for all skill levels | Young audience; settings menus add cognitive overhead before play begins; also implies failure modes ("I picked the wrong difficulty") | Simple AI that spends money when it can afford upgrades; natural dice variance creates spread |

---

## Feature Dependencies

```
Race Track Render
    └──requires──> Car Position Tracking
                       └──requires──> Movement Resolution (dice + corner logic)
                                          └──requires──> Dice Roll Animation

Position Indicator (1st/2nd/3rd/4th)
    └──requires──> Car Position Tracking

Race End Screen
    └──requires──> Position Indicator
    └──requires──> Prize Money Calculation

Upgrade Shop
    └──requires──> Race End Screen (must have completed a race to shop)
    └──requires──> Current Balance Display
    └──enhances──> Dice Roll Animation (upgraded engine shows different dice face)

Corner Check (Tire Roll)
    └──requires──> Race Track Render (corners must be marked)
    └──requires──> Dice Roll Animation (reuses system, distinct visual)
    └──enhances──> Upgrade Shop (makes tire upgrades feel meaningful)

AI Opponents
    └──requires──> Movement Resolution
    └──requires──> Prize Money Calculation (AI earns and spends too)
    └──requires──> Upgrade Shop logic (AI must be able to buy upgrades)

Lap Counter
    └──requires──> Car Position Tracking (detect lap crossing)

Endless Mode
    └──requires──> Race End Screen
    └──requires──> Upgrade Shop
    └──conflicts──> Season/Campaign structure (intentionally excluded)

Simultaneous Turn Resolution
    └──requires──> Movement Resolution for all 4 cars per round
    └──conflicts──> Sequential turn order (choose one model; simultaneous chosen)
```

### Dependency Notes

- **Race Track Render requires Car Position Tracking:** The track is meaningless without cars on it; these are effectively built together.
- **Corner Check requires Dice Roll Animation:** The same animation system handles both normal movement rolls and corner penalty rolls — reuse is intentional.
- **AI Opponents require Upgrade Shop logic:** AI must be able to participate in the economy to stay competitive across multiple races; a static AI will fall behind maxed-out player cars.
- **Simultaneous Turn Resolution conflicts with Sequential turn order:** This is the core model choice. Simultaneous resolution (all cars roll each round) is chosen over sequential (player, then AI 1, then AI 2, then AI 3) because it eliminates waiting and mirrors the board-game convention of everyone moving together.

---

## MVP Definition

### Launch With (v1)

Minimum viable loop: race, earn, upgrade, race again.

- [x] Square track (~20 spaces, 4 corners, 2 laps) rendered top-down
- [x] 4 cars (1 player, 3 AI) visible and positioned on track
- [x] Simultaneous turn resolution — all 4 cars roll and move per round
- [x] Engine dice determines movement range (tier-dependent)
- [x] Corner check — tire dice applies penalty on low roll at each corner
- [x] Live position indicator (1st/2nd/3rd/4th) updating each round
- [x] Lap counter visible at all times
- [x] Animated dice rolls — feels physical, not instant
- [x] Turn result log or callout — what happened this round
- [x] Race end screen — positions, prizes per racer
- [x] Upgrade shop — engine (5 tiers) and tires (5 tiers)
- [x] Current balance always visible
- [x] Upgrade cost and effect clearly shown (dice range before/after)
- [x] Starting cash of 100
- [x] AI opponents spend money on upgrades when affordable
- [x] Pixel art visual style — cars, track tiles, dice faces
- [x] Responsive layout — playable portrait mobile and desktop
- [x] "Race again" / endless mode — no fixed season end

### Add After Validation (v1.x)

Add once core loop is confirmed fun (at least 10 full sessions by target audience).

- [ ] Sound effects — dice roll, movement, corner penalty, win fanfare — adds significant juice for no structural cost
- [ ] Car sprite variants — even 3-4 different pixel cars for AI makes them feel like characters
- [ ] Upgrade preview animation — show dice rolling with new range before purchase
- [ ] Subtle race-start sequence — countdown "3-2-1-GO!" adds ceremony
- [ ] Turn recap summary — at round end, show all 4 results in one panel before advancing

### Future Consideration (v2+)

Defer until product-market fit with target audience is established.

- [ ] Tile events — track spaces that trigger bonuses or hazards; requires significant balancing
- [ ] Tire degradation — mid-race tire wear meter; adds cognitive load
- [ ] Multiplayer — requires backend infrastructure and is out of scope
- [ ] Unlockable car skins — cosmetic progression; worth adding if engagement is high
- [ ] Season/championship mode — fixed number of races with a trophy; competes with endless simplicity

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Animated dice roll | HIGH | MEDIUM | P1 |
| Live position indicator | HIGH | LOW | P1 |
| Race track render + car movement | HIGH | MEDIUM | P1 |
| Corner check with tire dice | HIGH | LOW | P1 |
| Race end screen with prizes | HIGH | LOW | P1 |
| Upgrade shop (engine + tires, 5 tiers each) | HIGH | MEDIUM | P1 |
| Simultaneous turn resolution | HIGH | MEDIUM | P1 |
| Lap counter | HIGH | LOW | P1 |
| AI opponent with upgrade spending | MEDIUM | MEDIUM | P1 |
| Responsive layout | HIGH | MEDIUM | P1 |
| Turn result feedback / callout | MEDIUM | LOW | P1 |
| Starting cash (100) | LOW | LOW | P1 |
| Sound effects | HIGH | LOW | P2 |
| Car sprite variants for AI | MEDIUM | LOW | P2 |
| Race-start countdown | MEDIUM | LOW | P2 |
| Turn recap summary panel | MEDIUM | LOW | P2 |
| Tile events | MEDIUM | HIGH | P3 |
| Tire degradation | LOW | MEDIUM | P3 |
| Season/championship mode | LOW | MEDIUM | P3 |
| Unlockable cosmetics | LOW | MEDIUM | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when core loop is stable
- P3: Nice to have, future consideration

---

## Competitor Feature Analysis

Direct browser-based turn-based dice racing games for kids are rare. Comparisons are drawn from closest analogs.

| Feature | Formula D (board game) | Cubitos (board game) | Klesstinn Rally (planned) |
|---------|------------------------|----------------------|---------------------------|
| Movement mechanic | Gear-shift dice; mandatory full roll | Dice-building; push-your-luck | Fixed dice range by upgrade tier |
| Corner mechanic | Must stop N times in corner or take damage | No corner mechanic | Single corner roll; tire tier affects penalty |
| Upgrade system | None (cars are fixed) | Buy new dice during race | Between-race shop, 5 tiers per axis |
| Economy | None | Earn during race | Earn prize money by position |
| AI opponents | N/A (physical board game) | N/A (physical board game) | 3 opponents, simple spend logic |
| Session length | 45-90 min | 45-75 min | ~5-10 min per race (target) |
| Target audience | Teens/adults | Teens/adults | Kids 7-13 |
| Turn structure | Sequential per player | Simultaneous dice phase | Simultaneous all-cars-per-round |
| Visual feedback | Physical components | Physical components | Pixel art, animated, browser |

Klesstinn Rally's primary differentiator in this space is combining the short session length and immediate animation feedback of a casual browser game with the meaningful economy and upgrade progression of a board game economy — neither reference game achieves both.

---

## Sources

- [Best Racing Board Games — The Meeples Herald](https://meeplesherald.com/blogs/best-racing-board-games/) (MEDIUM confidence)
- [Formula D board game rules — Wikipedia](https://en.wikipedia.org/wiki/Formula_D_(board_game)) (HIGH confidence — primary source)
- [Formula D Strategic Analysis — Board Game Business](https://boardgame.business/formula-d-strategic-analysis/) (MEDIUM confidence)
- [Cubitos dice-building racing game review — The Board Game Family](https://www.theboardgamefamily.com/2021/02/cubitos-dice-game-review/) (MEDIUM confidence)
- [UX Design for Kids — Ramotion Agency](https://www.ramotion.com/blog/ux-design-for-kids/) (MEDIUM confidence)
- [UX for Gen Alpha Kids — BitskingDOM](https://bitskingdom.com/blog/ux-design-gen-alpha-preteens/) (MEDIUM confidence — 2025)
- [Usability Heuristics Applied to Board Games — Nielsen Norman Group](https://www.nngroup.com/articles/usability-heuristics-board-games/) (HIGH confidence)
- [Artificial intelligence in video games — Wikipedia](https://en.wikipedia.org/wiki/Artificial_intelligence_in_video_games) — rubber-band AI pattern (HIGH confidence)
- [Top Turn Based Racing games — itch.io](https://itch.io/games/tag-racing/tag-turn-based) — genre landscape (MEDIUM confidence)
- [Delta Vector — Turn Based Racing (Steam)](https://store.steampowered.com/app/3437390/Delta_Vector__Turn_Based_Racing/) — contemporary example (MEDIUM confidence)

---

*Feature research for: Klesstinn Rally — browser-based turn-based dice racing game*
*Researched: 2026-04-12*
