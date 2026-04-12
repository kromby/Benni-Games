# Retrospective

---

## Milestone: v1.0 — MVP

**Shipped:** 2026-04-12
**Phases:** 3 | **Plans:** 6 | **LOC:** ~1,537

### What Was Built

1. 20-space CSS Grid race track, 4 cars, dice movement, corner penalty, 2-lap race loop
2. Complete race engine: simultaneous turn resolution, finish detection, prize money, results screen
3. Economy data model: 5-tier engine/tire upgrades, prize money, AI personalities, home/shop views
4. Full earn-upgrade-race loop: shop buy mechanics, AI upgrade logic, navigation, human-verified
5. Pixel art identity: Press Start 2P font + PNG car sprites replacing colored circles
6. Mobile no-scroll race layout: `body.race-active` viewport lock, 375px-fit confirmed

### What Worked

- **Tight plan specs** — plans with exact line numbers and replacement code snippets were fast to execute with no ambiguity
- **Human-verify checkpoints** — catching UI issues early (Phase 2 shop redesign) saved rework
- **Zero-dependency constraint** — no build tooling meant instant feedback loop; pure DOM manipulation is auditable
- **Probability-based corner penalty** — cleaner than the original dice formula; correct call made during Phase 2

### What Was Inefficient

- **Missing VERIFICATION.md for Phases 1-2** — gsd-verifier was not run after those phases; caused gaps_found in audit (documentation-only, but requires manual closure)
- **SUMMARY.md requirements-completed fields incomplete** — several plans omitted `requirements-completed` frontmatter entries, requiring 3-source reconciliation at audit time
- **Phase 2 UI required multiple fix iterations** — home screen layout needed 4 fix commits after initial implementation; better UI-SPEC upfront could have reduced this

### Patterns Established

- `body.race-active` global class pattern for viewport lock (not scoped to media query)
- Probability-based corner penalty via `UPGRADE_TIERS_TIRES[car.tireTier]` lookup
- `resolveRound` finish detection after all cars process (avoids double-finish bug)
- Car sprite lookup via fixed `colorNames` array (player=red, ai1=blue, ai2=green, ai3=yellow)

### Key Lessons

1. Run `gsd-verifier` after each phase — don't defer to milestone audit
2. Fill `requirements-completed` in SUMMARY.md frontmatter during plan execution
3. UI-SPEC contracts for Phase 2 home/shop would have eliminated the fix-commit cycle
4. Integration checker is fast and thorough — good to run earlier as a sanity check

### Tech Debt Carried Forward

- **WR-01**: `loadGame` null-guard incomplete — null car entry silently discards all cars (game.js:625-664)
- **WR-04**: No breakpoint at 600-749px — small tablets may overflow
- **IN-02**: Unknown car ID → broken image path with no guard (game.js:155-157)
- Missing VERIFICATION.md for Phases 1 and 2

---

## Cross-Milestone Trends

| Milestone | Phases | Plans | LOC | Shipped |
|-----------|--------|-------|-----|---------|
| v1.0 MVP | 3 | 6 | ~1,537 | 2026-04-12 |
