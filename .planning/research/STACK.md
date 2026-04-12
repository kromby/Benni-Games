# Stack Research

**Domain:** Browser-based turn-based pixel art game (kids 7–13)
**Researched:** 2026-04-12
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Phaser 4 | 4.0.0 "Caladan" | Game rendering, scene management, input, audio, animation | The standard HTML5 game framework. Stable release dropped 2026-04-10 — exactly when this project starts. Has built-in pixel art mode (`pixelArt: true`), Scale Manager for mobile/desktop responsive layout, and Aseprite JSON import. Everything needed (sprites, tweens, scenes, audio, touch input) is batteries-included. WebGL by default with automatic Canvas fallback. |
| TypeScript | 6.x (via Vite) | Type safety, IDE autocompletion | Phaser 4 ships TypeScript definitions. Type safety is worth the setup overhead — game state bugs (wrong property names, wrong dice values) are caught at compile time, not during kid play sessions. |
| Vite | 8.x | Dev server, bundler, HMR | Official Phaser 4 recommendation: "select Vite" as bundler. Sub-50ms HMR. Produces single optimized output bundle. The Azure Static Web Apps workflow needs one pipeline change (`output_location: "dist"`) but pays for itself in fast iteration. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Phaser PixUI | latest (Feb 2026) | Pixel art UI components (buttons, panels, text) | Use for all in-game UI — the shop, position tracker, prize screen. Purpose-built for pixel art Phaser 4 games, saves building these from scratch. |
| howler.js | 2.x | Audio (backup only) | Only if Phaser 4's built-in audio proves inadequate. Phaser 4 has a Sound Manager — try it first. howler.js adds 7KB for marginal benefit in this use case. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Aseprite | Pixel art creation and animation | Industry standard for pixel art. Exports sprite sheets as PNG + JSON. Phaser 4 can load Aseprite JSON directly. Purchase once (~$20). |
| `npm create @phaserjs/game@latest` | Project scaffold | Official Phaser CLI. Select: Vite + TypeScript. Produces a working project in 30 seconds. |
| Vite dev server | Fast iteration | `npm run dev` — game visible at localhost instantly. HMR means dice animation tweaks show in under 1 second. |

## Installation

```bash
# Scaffold new Phaser 4 project (run from repo root, then move into games/klesstinn-rally/)
npm create @phaserjs/game@latest

# Or install manually into a new game directory
npm install phaser@4.0.0

# Dev dependencies (included in scaffold)
npm install -D vite typescript

# Optional: Phaser PixUI for in-game UI components
npm install phaser-pixui
```

**Azure pipeline change required:**
```yaml
# In .github/workflows/azure-static-web-apps-*.yml, add build step:
app_location: "./games/klesstinn-rally"
output_location: "dist"
# Add before deploy:
# - run: npm install && npm run build
#   working-directory: ./games/klesstinn-rally
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Phaser 4 | Vanilla Canvas + DOM | If game complexity were lower (no animations, no sprite sheets, fewer moving objects). The existing Klesstann games make this call correctly — their mechanics are pure DOM. Klesstinn Rally has animated dice, 4 moving car sprites, track rendering, tweens — vanilla canvas saves setup at the cost of 3x the animation code. |
| Phaser 4 | Phaser 3 (3.90.0) | Phaser 3.90 is the last v3 release, all development moves to v4. Starting a new project on v3 now means future migration. v4 is stable as of 2026-04-10. |
| Phaser 4 | KAPLAY (Kaboom fork) | If targeting very rapid prototype only. KAPLAY's API is simpler but less scalable. Less production usage, smaller community, no Aseprite import. Not appropriate for a game targeting ongoing expansion. |
| Phaser 4 | PixiJS | If you only needed a rendering layer and were building your own game loop, scene management, and audio. PixiJS has no built-in game systems — you'd recreate what Phaser gives for free. |
| Phaser 4 | boardgame.io | boardgame.io specializes in multiplayer turn-based state management. Klesstinn Rally is explicitly single-player (V1). The framework's multiplayer infrastructure is dead weight. |
| Vite | No bundler (raw static) | Appropriate for the existing games (zero dependencies, ES5). Not appropriate here: TypeScript requires transpilation, Phaser 4 as an npm package requires bundling, and `import` statements don't work without a server in browser. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Phaser 3 | Last release was 3.90.0 in May 2025 — maintenance-only, all new development is Phaser 4. Starting on v3 now means near-term migration debt. | Phaser 4.0.0 |
| React/Vue for game canvas | React reconciliation and Phaser's game loop fight each other. React is appropriate for the surrounding HTML shell (if needed), not inside the canvas. Phaser 4 has its own scene/display list — a second UI framework duplicates responsibility. | Phaser 4 scenes for in-game UI, plain HTML for landing page shell |
| Three.js / Babylon.js | 3D engines. No 3D is needed — this is a 2D pixel art game. Massive bundle size, 3D concepts don't map to a flat track. | Phaser 4 |
| KAPLAY / Kaboom.js | Kaboom.js is unmaintained (Replit dropped it June 2024). KAPLAY is a community fork — younger ecosystem, limited production usage, no Aseprite support. | Phaser 4 |
| CSS animations for game sprites | CSS is great for UI transitions. It cannot represent the game loop, sprite sheet frame stepping, or timed tween sequences that dice rolls and car movement require. | Phaser 4 tweens + animation system |
| ES5 (matching existing games) | The existing games use ES5 for zero-tooling deployment. Klesstinn Rally needs a game framework (npm package), which requires a bundler anyway. Once you have a bundler, ES6+ modules, classes, and TypeScript cost nothing extra. | TypeScript via Vite |

## Stack Patterns by Variant

**Keeping zero build tooling (matching existing repo convention):**
- Not viable. Phaser 4 is an npm package — using it from CDN is possible but loses tree-shaking (adds ~1MB to load). The game's complexity (animated sprites, scene transitions, tweens) justifies the build step.
- If truly required: use Phaser 3 from CDN (`<script src="https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.min.js">`). This avoids the build pipeline but starts on a deprecated major version.

**If pixel art assets are not ready at build start:**
- Use Phaser's built-in Graphics API (`scene.add.graphics()`) to render placeholder rectangles with color-coded cars. This produces a playable prototype without any Aseprite files. Swap in real sprites later with no architecture change.

**If Azure pipeline modification is blocked:**
- Pre-build locally and commit the `dist/` directory. Messy but functional short-term. Better solution: add a build step to the workflow (15 minutes of work).

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| phaser@4.0.0 | vite@8.x | Official Phaser template uses Vite. No known conflicts. |
| phaser@4.0.0 | typescript@6.x | Phaser 4 ships its own `.d.ts` files. TypeScript 6 is compatible. |
| phaser@4.0.0 | Node.js 20.19+ or 22.12+ | Vite 8 requires Node 20.19+ or 22.12+. Phaser itself is browser-only, not a Node dependency. |
| phaser@4.0.0 | phaser-pixui | PixUI targets Phaser 4 specifically (released Feb 2026). Not compatible with Phaser 3. |

## Rationale: Why Phaser 4, Not Vanilla Canvas

The existing games (Klesstann, life2, FH Clicker) are correctly vanilla JS. Their mechanics are pure DOM: grids of HTML elements, CSS transitions, click handlers. No animation timeline, no sprite sheets, no physics-adjacent math.

Klesstinn Rally requires:
- 4 car sprites moving simultaneously around a track
- Animated dice rolls (frame-stepped sprite or tween sequence)
- Tween-based smooth car movement between track spaces
- Touch input on mobile that distinguishes tap (roll) from scroll
- Responsive canvas scaling to fill any screen without distortion

Each of these is a solved problem in Phaser 4 and a significant engineering problem in vanilla canvas. The Phaser overhead (~1MB bundle) is justified by eliminating roughly 800–1200 lines of animation, input, and scaling code that would otherwise need to be written and debugged.

## Sources

- https://phaser.io/download/stable — Phaser 4.0.0 "Caladan" confirmed stable, released 2026-04-10
- https://docs.phaser.io/phaser/getting-started/installation — Official install method: `npm create @phaserjs/game@latest`, Vite recommended
- https://phaser.io/news/2025/05/phaser-v390-released — Phaser 3.90 confirmed as final v3 release
- https://phaser.io/news/2026/02/phaser-pixel-art-ui-library — Phaser PixUI confirmed Phaser 4 compatible (Feb 2026)
- https://vite.dev/blog/announcing-vite7 — Vite 8 current as of April 2026
- https://github.com/phaserjs/phaser-editor-template-vite-ts — Official Phaser 4 + Vite + TypeScript template
- https://github.com/microsoft/typescript/releases — TypeScript 6.x current (March 2026 release)
- https://github.com/Shirajuki/js-game-rendering-benchmark — Performance comparison confirming Phaser competitive with other engines

---
*Stack research for: Klesstinn Rally — browser-based turn-based pixel art racing game*
*Researched: 2026-04-12*
