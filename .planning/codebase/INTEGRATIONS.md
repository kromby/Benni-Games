# External Integrations

**Analysis Date:** 2026-04-12

## APIs & External Services

**Image Assets:**
- FH.is logo - External image referenced in FH clicker game
  - Service: fh.is website
  - URL: `https://fh.is/wp-content/uploads/2021/12/fh-icon.svg`
  - Location: `games/my-clicker-game/index.html`
  - Type: Static image asset (SVG logo)

**Web Links:**
- FH.is website - External website link
  - URL: `https://fh.is`
  - Location: `games/my-clicker-game/index.html`
  - Type: Navigation link (target="_blank", rel="noopener")

## Data Storage

**Databases:**
- Not applicable - No database used

**Browser Storage:**
- localStorage API - Client-side game state persistence
  - Keys by game:
    - `klesstann-save` (`games/klesstann/game.js`)
    - `fh-clicker-save` (`games/my-clicker-game/game.js`)
    - `life2.0_save` (`games/life2/game.js`)
  - Data Format: JSON serialized game state
  - Auto-save interval: 30,000ms (30 seconds) for Klesstann and FH clicker

**File Storage:**
- Local filesystem only - Static game assets (images, CSS)
- Klesstann assets: `games/klesstann/images/` (referenced: `logo.png`)
- No cloud file storage used

**Caching:**
- Browser cache only (standard HTTP caching)
- No explicit caching mechanism implemented

## Authentication & Identity

**Auth Provider:**
- None - Games are public, no user authentication required
- No login/logout system
- No user account management

## Monitoring & Observability

**Error Tracking:**
- Not detected - No error tracking service integrated

**Logs:**
- Console logging (implicit via `console.log()`/`console.error()`)
- No centralized logging or monitoring

## CI/CD & Deployment

**Hosting:**
- Azure Static Web Apps
  - App deployed at: Azure Static Web Apps resource named "gentle-meadow-071f21603"
  - Region: Configured in Azure Portal

**CI Pipeline:**
- GitHub Actions - Workflow file: `.github/workflows/azure-static-web-apps-gentle-meadow-071f21603.yml`
- Trigger: Push to `main` branch or pull requests to `main`
- Deployment steps:
  1. Checkout repository with submodules
  2. Run Azure Static Web Apps Deploy action (v1)
  3. Upload files from repo root (`./`) with no build step (`skip_app_build: true`)

**Secrets:**
- `AZURE_STATIC_WEB_APPS_API_TOKEN_GENTLE_MEADOW_071F21603` - Azure deployment token (GitHub secret)
- `GITHUB_TOKEN` - GitHub-provided token for PR integration

## Environment Configuration

**Required env vars:**
- None - No environment variables required for local development or production

**Secrets location:**
- GitHub Secrets (for deployment only)
- Not stored in repository

## Webhooks & Callbacks

**Incoming:**
- Not detected - No webhook endpoints

**Outgoing:**
- Not detected - No outgoing webhooks

## External Image/Asset References

**Runtime Loaded Assets:**
- FH logo: `https://fh.is/wp-content/uploads/2021/12/fh-icon.svg` (FH clicker game)
- Klesstann logo: `images/logo.png` (local file reference in `games/klesstann/style.css`)

---

*Integration audit: 2026-04-12*
