# Benni games

Safn af litlum leikjum. Hver leikur er í eigin möppu og einangraður frá öðrum.

## Leikir

- **[FH clicker](games/my-clicker-game/)** – clicker-leikur með FH þema.
- **[life2.0](games/life2.0/)** – lífssímúla: vinna, kaupa mat, borða, sofa, stjórna orku og skapi (Fasi 1).

## Keyrsla staðbundið

Í rót verkefnisins:

```bash
npx serve .
```

eða:

```bash
python3 -m http.server 8000
```

Opna síðan `http://localhost:3000` (serve) eða `http://localhost:8000` (Python).

## Deploy á Azure Static Web Apps

1. Búið til **Static Web App** í Azure Portal og tengið við GitHub repo (eða notið Azure CLI).
2. Bætið við **GitHub secret** með deployment token frá Azure: `AZURE_STATIC_WEB_APPS_API_TOKEN`. (Ef Azure bjó til appið með GitHub tengingu getur það bætt við secret með öðru nafni – uppfærið þá `.github/workflows/azure-static-web-apps.yml` og notið það secret.)
3. Við push á `main` keyrir workflow í `.github/workflows/azure-static-web-apps.yml` og deployar innihaldi rótarinnar á Azure.

Uppbyggingin er static-only (engin build); workflow notar `app_location: "."` og `skip_app_build: true`.
