# Carry-Over Context — Richmond Symphony Dossier

**Generated 2026-08-18.** Paste this as the first message in a new session (Antigravity or otherwise).

---

## The job

Randy Bryan Moore, MSW (goes by Ran, he/him). Candidate for **Assistant Director, Advancement
Systems & Operations**, Richmond Symphony. $65K. Reports to CDO **Eboni Boadi**. Would supervise
Leah Coltrane (Annual Fund Manager) and Camryn Claude (Advancement Assistant).

Phone screen with Boadi happened Aug 12, 2026 — advanced. Now in the **in-person panel round**:
3 people, ~75 min, explicitly **behavioral/STAR**, at Dominion Energy Center. Ethan Scribano
(Accounting & HR Manager) offered Aug 19/20/21. **Date was never confirmed — verify before
assuming timing.**

## WHERE EVERYTHING LIVES

### 1. The code — `/Users/randybryanmoore/GITHUB/randybryanmoore-dot-us/symphony/`

| File | What it is |
|---|---|
| `index.html` | The dossier. Passcode gate, PIN `0000` (client-side only, not real security) |
| `styles.css` | Whole design system. Tokens documented in `:root` with contrast ratios |
| `one_pager.html` | Print handout. **Self-contained** — redefines all tokens inline so it renders without styles.css |
| `dashboard.html` | Ops dashboard demo, own separate palette — never audited |
| `script.js` | Gate, case-study tabs, audio console, annotation dock |
| `images/` | `headshot.jpg`, `jefferson-piano.jpg`, `press-portrait.jpg` |
| `header-art.{jpg,png,heic}` | Used by `dashboard.html` (it references the `.jpg`) |
| `Randy_Bryan_Moore_{Resume,Cover_Letter}.pdf` | **Ground truth for every factual claim** |
| `Randy_Bryan_Moore.vcf` | vCard |
| `assets/` | Empty dirs (`audio/`, `docs/`, `images/`) — nothing in them |

Git: repo `github.com/randybryanmoore/randybryanmoore-dot-us`, branch `website-source`,
committed `d456fc2`, **not pushed**. Remote has NO `symphony/` folder yet — pushing publishes it
for the first time. `git push -u origin website-source`

### 2. Source packet — the research corpus

```
~/Library/Mobile Documents/com~apple~CloudDocs/(( iCloud :: RBM ))/00 - Active :: Folder (Inbox)/
```

**`Richmond_Symphony_Panel_Interview_Source_Packet/`** ← start here, this is the good stuff:
```
03-Job-Description.txt        ← THE ACTUAL POSTING. Verify role claims against this.
04-BOARD-OF-DIRECTORS.txt     07-2025-2026-ROSTER.txt
05-ADMINISTRATION.txt         08-INDIVIDUAL-GIVING.txt
06-FAQ.txt                    09-COMMUNITY-CONCERTS.txt
10-ISNL-web.pdf   11-Perplexity-Research.txt   12-Nonprofit-Managment.txt   13-ChatGPT-Reasearch.txt
01/02 = the same FINAL cover letter + resume as in symphony/
```

**Financials (primary sources — use these over any summary):**
`FY22-Audit`, `FY23-Audit`, `FY24-Audit`, `FY25-Audit_The-Richmond-Symphony-The-Richmond-Symphony-Foundation.pdf`,
`FY24-990_Richmond-Symphony.pdf`, `The-Richmond-Symphony-Consolidated-6-30-2020-FS-Public.pdf`

**Org research:** `Richmond_Symphony_Current_Advancement_Fundraising_Sources_August_2026.pdf` ·
`Richmond_Symphony_People_Working_Relationships_Source_Guide_August_2026.pdf` ·
`Richmond_Symphony_Source_Downloads/Richmond_Symphony_2020-21_Impact_Report.pdf`

**His own material:** `Professional Experience MASTER DOC.pdf` (full career bank — *contains
sensitive personal history flagged "use carefully"; not for public-facing docs*) ·
`Randy_Bryan_Moore_Richmond_Symphony_Interview_Portfolio.pdf` (13-page designed portfolio he built
himself) · `Richmond Symphony | Interview Prep + First 90 Days.pdf` ·
`Randy-Bryan-Moore-...-Study-Guide-ElevenReader-Edition.docx` · `1000-songs-archive 8.26.pdf`

**Work samples:** `Advocacy Amplified...Active Minds.pdf` · `Young Adult Voter Guide 2024 (FINAL).pdf`
(unresolved authorship question) · `Virginia Congressional Housing Profiles.pdf`

### 3. Google Drive — folder `1NPA8PJLko2ROhD0DrQ6Xieg3T21iopaO`

- **AI Strategy Package** (`1hNaZCrMmAHMrgDQCXSG_u7uLJsZR4rJz`) — the Bloomerang-ships-AI research;
  source of the "govern the vendor's AI, don't pitch AI" framing used in the 90-day plan
- Interview Prep + First 90 Days (Google Doc `16X5CNqO4CtAXcQC8QOE1NtqhsrvcfH-ACRDRJRvEjbk`)
- Interview Study Guide PDF (`1HOpTKY8A68p7l6WpikGOY9TrmzHYu1Cz`) + ElevenReader ed. (`1rcPd-XJYL4-KDXmPedu0cO5cYnmtm-iN`)
- Advancement Interview Prep Console `.html` (`12y_BZwo1YV6PfmkKywYGfsMCr3_eC-Na`) — voice-rehearsal app

### 4. Live brand source

`https://randybryanmoore.us` → stylesheet at `/assets/index-C87qpKNM.css`
**(hashed filename — it changes on redeploy; re-scrape the `<link>` tag if it 404s)**

### 5. Prior Claude Code sessions (same machine)

`local_348b3d9d-af76-4016-86bb-7598c53e6fea` "Design system sync" — earlier main-site one-pager work

## Design system — DO NOT invent values

All tokens pulled verbatim from the live site's real stylesheet:
`randybryanmoore.us/assets/index-C87qpKNM.css`. That file is the source of truth.

```
navy   #182B4D   maroon      #4C0E1C   paper      #FBF6ED
ink    #15221C   maroon-deep #2B0710   cream      #F2EADF
muted  #59645E   navy-deep   #0D1A32   paper-deep #E8DDCC
sage   #808370   ← the brand's ONLY green. 3.61:1 on paper.
                   Material only (rules/borders/washes). NEVER text.
```

Type: `Iowan Old Style` / `Avenir Next` / `SF Mono` — system stack, no webfonts.
Headings: weight **500**, letter-spacing **-0.035em**, line-height **0.98**. Big clamps.
Buttons: **pill** (999px), 13px/800, `.045em`, 48px min-height.
Kicker: mono 11px/800, `.14em`, uppercase, maroon.

**Page grammar:** full-bleed color bands (cream → navy → cream → maroon → …), numbered index rows
with `//` separators, oversized faint serif numerals bleeding off card corners. **Not** boxed cards
on cream — that was the wrong direction and got torn out.

## ⚠️ Accuracy — the important part

The original dossier **fabricated experience**. It claimed "10+ years administering Bloomerang,"
invented job titles, and wrong dates. All corrected against the two PDFs in this folder
(`Randy_Bryan_Moore_Resume.pdf`, `Randy_Bryan_Moore_Cover_Letter.pdf`) — **those are ground truth.
Verify any claim against them before publishing.**

**Real history:**
- Save the Children Action Network — Virginia State Manager, 12/24–11/25
- Active Minds — Policy Manager, 04/22–12/24
- Sen. Mark R. Warner — Outreach Representative, 08/20–04/22
- Virginia Housing Alliance — Director of Policy and Advocacy, 12/17–05/20
- Virginia Civic Engagement Table — Community Organizer, 02/17–12/17
- The Jefferson Hotel — contract pianist, 2022–present; School of Rock Midlothian, 2025–2026

**Disclosed gaps (he told Boadi these on the record — keep them stated, don't paper over):**
- Has **not** administered Bloomerang. Has 5 years hands-on **EveryAction**.
- Has **not** owned end-to-end gift processing / Finance reconciliation.
- Supervision = grad interns + MSW field instruction, not FTEs.
- Several roles under two years — needs a clean, non-defensive answer.

**Verified org facts safe to use:** Mission verbs perform/teach/champion. FY23 ~$890K deficit →
FY24 near-balance → FY25 ~$982K deficit; revenue grew each year — structural ~70/30
contributed-to-earned, not decline. Two legal entities: Richmond Symphony (EIN 54-6024033) and
Richmond Symphony Foundation (~$24.8M, EIN 54-1514987). Lacey Huszcza CEO; Boadi CDO since
May 2024; Matt Wilshire VP Artistic Planning; Priscilla Burbank Board Chair.

**Program names — do not get these wrong:** Symphony Series (NOT Masterworks) · Music at Hardywood
(NOT Rush Hour) · Neighborhood Series · Community Concerts · Family Concerts (NOT LolliPops) ·
**Come and Play** (NOT Side-by-Side, NOT Come Play With Us). "Symphony Under the Stars" is the
Virginia Symphony, not Richmond.

## Open items

1. **Interview date unconfirmed.**
2. **"For Our Future Fund"** was added to the VCET entry at Ran's request, but it is **not on the
   submitted resume** — site now differs from the packet Boadi has. Expect the question.
3. `Microsoft Office` appears inside **quoted** cover-letter text. Ran wanted it swapped to Google
   Workspace; changed only in the non-quoted competency list. Changing it inside quotation marks
   would falsify a dated quote — paraphrase instead if he wants it gone.
4. VHA "$18M → $125M, 45% PSH rise" figures live in old prep notes, **not re-verified**.
5. `dashboard.html` uses its own separate palette — never contrast-audited.
6. **"How I Think" section risk:** the line *"I'd rather be evaluated on how I think"* is strong, but
   in a STAR panel where he's already disclosed the Bloomerang gap it can read as deflecting it.
   Concrete result first, then pivot to method, is the safer order.

## Published artifacts

- Extended portfolio (QR target from the handout): `claude.ai/code/artifact/647185a4-9151-468c-aedf-ea7775401cc7`
- Flattened dossier snapshot: `claude.ai/code/artifact/225a7316-ac8e-403c-a5b7-9d5f466f7e14`

The one-pager's QR code encodes the **portfolio** URL. If that artifact URL ever changes, the QR
must be regenerated (`python3 -m qrcode`, brand navy `#182B4D` on white).

## Honest status

The palette, typography, and content accuracy are solid and measured (all text tokens pass WCAG AA;
zero fabricated claims remain). **The full visual render was never verified end-to-end** — the
browser tooling failed for most of that session, and only the top of the page was ever seen
rendered. Structure below the hero is code-verified, not eye-verified. Start by looking at it.
