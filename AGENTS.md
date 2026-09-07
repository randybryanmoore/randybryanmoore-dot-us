# randybryanmoore-dot-us

Personal static site for Randy Bryan Moore (Ran), live at [randybryanmoore.us](https://randybryanmoore.us). Plain HTML, CSS, and JS. Do not convert the homepage into a React (or other SPA) app.

## Layout

| Path | Role |
|------|------|
| `index.html` | Personal homepage |
| `css/style.css` | Homepage styles |
| `js/main.js` | Homepage scripts |
| `symphony/` | Richmond Symphony candidate dossier (one-pager, resume, dashboard) |
| `.github/workflows/symphony-pages.yml` | Deploys `symphony/` to GitHub Pages |
| `.agents/skills/` | Project agent skills (mirrored in `.claude/skills/`) |

## Deploy

- Homepage: GitHub Pages from the repo root. Custom domain in `CNAME` is `randybryanmoore.us`.
- Dossier: GitHub Pages from `symphony/`. Custom domain in `symphony/CNAME` is `symphony.randybryanmoore.us`. Pushes to `main` that touch `symphony/**` run the workflow above.

## Model Context Protocol (MCP) Integration

- `.cursor/mcp.json` contains registered MCP servers (`fetch`, `github`, `ableton`, `openrouter`).
- **OpenRouter MCP**: Connects via remote HTTP/SSE (`https://mcp.openrouter.ai/mcp`).
  - Provides live model metadata, pricing, benchmark scores, credit balance, and test inference (`send-message`, `generate-image`).
  - Auth is handled via OAuth PKCE in Cursor Settings > MCP.
  - Verification & audit script: `python3 scripts/audit_openrouter_mcp.py`. Operational rules: `.cursor/rules/openrouter-mcp.mdc`.

## How to edit

- Prefer small, visible changes. Do not rewrite layout, navigation, or visual system unless asked.
- Do not casually edit `symphony/` — it validates and deploys on `main`.
- Leave `symphony_page.tsx` and `symphony_page_compiled.tsx` alone unless the user is working on that prototype.
- Preview the homepage by opening `index.html` in a browser. A deploy is not required to see local changes.

## User Shorthands & Interaction Rules

- **`4`**: User shorthand meaning execute, commit, push, ship, deploy, verify, and complete immediately without needing re-confirmation.

