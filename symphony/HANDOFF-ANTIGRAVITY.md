# Handoff — Richmond Symphony Dossier

Paste everything below into Antigravity as your opening prompt.

---

You are picking up work on a confidential candidate dossier website. Read this
whole brief before touching anything — several things here are counterintuitive
and have already caused wasted work.

## What this is

A one-page dossier for **Randy Bryan Moore, MSW**, candidate for **Assistant
Director, Advancement Systems & Operations** at the **Richmond Symphony**.
It is a job application artifact that a hiring panel will read. Accuracy of
claims matters more than polish.

## CRITICAL — where the live site actually comes from

This trips everyone up. There are **two repos**, and the obvious one is wrong.

| | |
|---|---|
| **Live site** | https://symphony.randybryanmoore.us |
| **Served from** | `randybryanmoore/randy-symphony-portfolio`, branch **`gh-pages`**, files at **repo root** |
| **NOT served from** | `randybryanmoore/randybryanmoore-dot-us` |

`randybryanmoore-dot-us` contains a `symphony/` folder that looks like the site
and is a byte-identical copy, but **nothing under it is served**. Its `CNAME` is
the apex `randybryanmoore.us`. `https://randybryanmoore.us/symphony/` returns
**404** and always has.

The portfolio repo also has a `main` branch with a `pages.yml` workflow. Ignore
it — `main` holds only 370-byte stubs. I verified by byte-comparing the live
HTML against both branches: live is identical to `gh-pages`.

**Deploy = commit to `gh-pages` of `randy-symphony-portfolio`, files at root.**
Working copy is `symphony/` in `randybryanmoore-dot-us`, then copy files up to
the portfolio root. Keep both in sync or they drift.

Files that must be copied on every deploy: `index.html`, `styles.css`,
`script.js`, plus `one_pager.html`, `dashboard.html`, `images/*`,
`Randy_Bryan_Moore.vcf`, and the dossier `.zip` when those change.

## Cache-busting is mandatory

`index.html` references `styles.css?v=<epoch>` and `script.js?v=<epoch>`.
**Bump both on every change** or browsers serve stale CSS — this cost real time.

```bash
V=$(date +%s) && sed -i '' -E "s/(styles\.css\?v=)[0-9]+/\1$V/; s/(script\.js\?v=)[0-9]+/\1$V/" index.html
```

Even then, verify with a cache-busted URL: `https://symphony.randybryanmoore.us/?cb=1`
GitHub Pages takes 30–60s to propagate.

## The colour system — read before changing any colour

Randy is particular about this and we iterated a lot. Current state:

**Blue — three steps, all in `:root` tokens**

| Token | Hex | Role |
|---|---|---|
| `--blue-l1` | `#0d1a32` | section grounds — the dominant blue |
| `--blue-l2` | `#182b4d` | panels and cards |
| `--blue-l3` | `#243d6b` | insets resting on a panel |

**Red — one value only**

`--red: #2b0710`. Randy was explicit: *"this red is the only red that should be
used in this entire artifact."* Do not introduce a second red.

**Rules he stated, in his words:**
- "each color should be the darkest and deepest the furthest back then the layer
  on top is the mid shade and the top is the lightest hue"
- Blue is dominant, red is the accent
- Scale is numbered from L1, not L0

**The trap:** `#2b0710` on `#0d1a32` is **1.06:1** — the red is nearly invisible
against the blue. He knows; it's his call. Do not "fix" it by lightening the red
without asking. If red must read as red, it has to be *lighter* than the blue —
`#A31D33` gets 2.30:1, `#C9455C` gets 3.71:1.

**Consequence to watch:** with one flat red, nothing can sit *on* a red surface.
Two things already broke this way and are patched — roadmap stage tags are cream
chips with red text (9.9:1), and the footer contact box separates by a cream rule
instead of a fill. If you add anything on a red surface, it needs the same
treatment.

Everything routes through tokens at the top of `styles.css`. Changing a colour
should be a token edit, never a hunt. Beware `rgba()` overlays — several stray
shades came from translucent fills compositing over different grounds, which is
why the page once rendered ten distinct blues. Use solid token values.

## Content accuracy — do not undo these

I corrected claims that did not hold up against Randy's own source documents.

**1. Muster was misrepresented.** The site claimed *"Deployed Muster CRM across
all 55 Virginia legislative districts (98.4% deliverability)."* That merged two
different jobs:
- The 55 General Assembly meetings were **Save the Children Action Network**, on **EveryAction**
- **Muster** was **Active Minds**, integrating with **Salesforce**, segmented by **Congress**

**`98.4%` appears in no source document** — not the resume, the *Advocacy
Amplified* proposal, the interview portfolio, or the interview prep. It was
presented twice as a hard statistic. It is now removed. **Do not reintroduce
unsourced metrics.**

The section is now *"Muster Platform Evaluation & Integration Design,"* framed
using Randy's own line from his interview portfolio: *"The Muster work shows how
I define requirements, evaluate technology, think about integrations, and plan
adoption."* Stats are limited to what the resume and proposal support: 50+
legislative offices, a ten-organization coalition, Salesforce as integration
target, five specified tactics.

**2. Added a People Leadership row** to the alignment matrix. The job description
requires supervising the **Annual Fund Manager and Advancement Assistant** and
states *"Experience managing and developing staff is essential"* — the matrix had
no row for a required qualification. Evidence drawn strictly from the resume:
MSW field instruction and graduate intern supervision at Virginia Housing
Alliance, plus training 40 partner organizations at the Virginia Civic
Engagement Table.

**3. Unresolved — flag to Randy, do not guess:** the site says **"Resident
Pianist"** in five places; his resume says **"Contract Pianist, lobby and wedding
performances."** The panel will read both documents.

## Still open — highest value work remaining

**Swap the invented roadmap for Randy's real one.** The site's 30-60-90 section
appears to be made up. His `Richmond Symphony | Interview Prep + First 90 Days.pdf`
contains a genuine, researched plan that is far better:

- **30 — Understand + Verify:** define the $6.9M goal, map Bloomerang and integrations, trace gift lifecycles, meet Advancement and Finance, identify risks and quick wins
- **60 — Standardize + Strengthen:** shared data standards, gift and acknowledgement workflows, reconciliation rhythm, initial dashboard, staff coaching
- **90 — Analyze + Build Forward:** review retention and pipeline, finalize reporting cadence, launch data-quality checks, create systems roadmap, evaluate one low-risk pilot

Unused lines from that document worth working in:

> **North Star:** Build trustworthy systems that protect donor intent, reduce
> staff friction, and turn relationship data into decisions.

> **Operating Promise:** I will listen before redesigning, protect donor intent,
> align Advancement and Finance, support staff, document the work, and use
> technology only where it creates measurable value.

**Other gaps against the real job description:**
- The **$6.9M** contributed-income goal is never referenced
- The JD makes him **primary administrator of Bloomerang**; the site leads with EveryAction and calls Bloomerang "readiness" — that ordering undersells him for this role
- **Moves management / portfolio tracking** named in the JD, absent from the site
- Core values — *inclusion, passion, quality, innovation, welcoming* — absent

## Review tooling and the build watermark

`<body data-review-tools="on">` at `index.html:65` controls the annotation dock,
live edit, inspector and notes drawer. Set to `"off"` to strip them from the DOM
entirely — not hidden, removed, with listeners and localStorage skipped. Override
per visit with `?review=1` or `?review=0`.

**The build watermark is deliberately independent of that switch** and stays
visible. Top right, at `index.html:66`:

```html
<div class="build-badge" id="build-badge" aria-hidden="true">
  <span class="build-badge-agent">C</span>
  <span class="build-badge-version">v1.5.1</span>
  <span class="build-badge-date">2026-08-18</span>
</div>
```

**Set the letter to `A` for Antigravity, bump the version, and update the date.**
Randy wants to see at a glance which tool last touched the page.

## What I fixed this session

- **QR encoded the wrong URL.** It used `window.location.href`, so a downloaded copy produced an unscannable `file://` code. Now falls back to the canonical URL unless served from a public host.
- **The printable handout's QR pointed at the dead apex URL.** `one_pager.html`'s QR is a hardcoded inline SVG — printed on paper it would have gone nowhere. Regenerated for `https://symphony.randybryanmoore.us/`.
- **The vCard had the same dead URL.** Corrected.
- **Hero QR overlapped the candidate name.** Restructured to a portrait row above a name/QR row.
- **Case study #5 was scrolled off-screen** in a horizontally scrolling tab bar with no affordance. Tabs now wrap; all five always visible.
- **Header wordmark** broke as "Randy Bryan Moore," / "MSW" and hit four lines on mobile. Now a fixed two-line lockup. Subtitle hidden below 1250px where the column collapses to ~115px.
- **Headshot was cut off** — a square photo letterboxed to 2.5:1. Frame is now 4:3 anchored to top.
- **"Open on TikTok" links were 14px tall** — now 44px tap targets.
- **`rel="noopener"`** added to all seven external links.
- **Invisible kicker** — "01 · Core Competencies" was maroon on navy at ~1.2:1, now 11.8:1.
- **Cream-on-cream text** in the alignment matrix after its section flipped to blue.
- **Review dock covered content** — now rests at 45% opacity, full on hover, with page bottom padding.
- **Musical Artistry moved to the closing section**; numbering and nav follow.
- **Spotify artist embed** added under the 1,000 Songs block (`0zaqvfVeDQZJ1q70foOsRs`, 520px). Randy should confirm it's the right profile.
- **Demo buttons** (header, hero, footer) now open `https://richmond-symphony-advancement-demo.randybryanmoore.chatgpt.site`.
- **Artist statement** closes on "Like sticking your hand in a stream." — his line, keep it.

## Verified state at handoff

All 11 public URLs return 200. Zero contrast failures across every text node.
No console errors, broken images, broken anchors, or duplicate IDs. All five
case-study tabs switch. Mobile 375px has no overflow and no undersized tap
targets. Nav order matches page order.

Search visibility is correct as-is: the page carries
`noindex, nofollow, noarchive, nosnippet, noimageindex`. There is deliberately
**no `robots.txt` on the subdomain** — a crawler must be able to fetch the page
to read the noindex directive. Do not add a `Disallow`.

## Known issues not fixed

- `images/jefferson-piano.jpg` is **716 KB** at 1152×1536, displayed far smaller — heaviest asset by 6×
- No Open Graph or Twitter card tags, so a shared link has no preview
- One heading-level jump
- `randybryanmoore-dot-us` carries a full duplicate of the site under `symphony/` that serves nothing — worth deciding whether it stays as backup or goes, so there's one source of truth

## Working style Randy expects

Verify in the browser, not by assumption — measure geometry and contrast rather
than eyeballing. Deploy and confirm live before saying something is done. When
his instruction conflicts with an accessibility or accuracy problem, do what he
asked and flag the consequence with numbers; don't silently override him.
