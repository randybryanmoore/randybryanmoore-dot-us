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

## How to edit

- Prefer small, visible changes. Do not rewrite layout, navigation, or visual system unless asked.
- Do not casually edit `symphony/` — it validates and deploys on `main`.
- Leave `symphony_page.tsx` and `symphony_page_compiled.tsx` alone unless the user is working on that prototype.
- Preview the homepage by opening `index.html` in a browser. A deploy is not required to see local changes.

## Cursor Cloud specific instructions

This is a plain static site with no package manager, lockfile, or build step. `node` and `python3` are already present in the base image, so there are no dependencies to install.

- Serve locally with `python3 -m http.server 8391` from the repo root (port matches `.claude/launch.json`). Open the homepage at `http://localhost:8391/` and the dossier at `http://localhost:8391/symphony/`. Serve over HTTP rather than `file://` so the `symphony/` relative assets and `fetch`/`sessionStorage` gate behave correctly.
- The `symphony/` dossier is client-side passcode-gated. The universal dev PIN is `0000` (also shown in the on-screen error hint). Enter it to reach the dashboard when testing locally.
- Lint/validate the same way CI does (see `.github/workflows/symphony-pages.yml`): `node --check` on JS, `python3 -m py_compile` on the Python helpers, `python3 -m json.tool` on the JSON manifests, and `python3 symphony/push_script.py --verify` to check release-manifest digests. There is no automated test suite beyond these checks.
- `symphony/push_script.py --verify` compares SHA-256 digests in `symphony/release-manifest.json` against the on-disk PDFs and `symphony/Randy_Bryan_Moore_Richmond_Symphony_Dossier.zip`. If you change any dossier artifact, rebuild the ZIP with `python3 symphony/push_script.py --build` and update the manifest, or `--verify` (and the deploy workflow) will fail.
