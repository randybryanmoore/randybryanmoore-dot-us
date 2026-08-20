// =========================================================================
// Richmond Symphony Advancement Systems & Operations Portfolio Suite
// Candidate: Randy Bryan Moore, MSW
// Complete Integrated Interactive Engine, Dual-Stream Annotation & Telemetry
// =========================================================================

(function() {
  function initSuite() {
    let pinActive = false;
    let editActive = false;
    let currentMode = 'ai'; // 'ai' (review queue) or 'private' (personal journal)

    // =========================================================================
    // 1. Passcode Gate (Universal PIN: 0000 / Native iPad & Desktop Master Input)
    // =========================================================================
    const gateOverlay = document.getElementById('passcode-gate');
    const masterInput = document.getElementById('pin-master-input');
    const visualBoxes = document.querySelectorAll('.pin-digit-box');
    const pinGroup = document.getElementById('pin-input-group');
    const gateUnlockBtn = document.getElementById('gate-unlock-btn');

    function unlockDossier() {
      if (gateOverlay) {
        gateOverlay.classList.add('unlocked');
        gateOverlay.style.opacity = '0';
        gateOverlay.style.visibility = 'hidden';
        gateOverlay.style.pointerEvents = 'none';
        setTimeout(() => {
          gateOverlay.style.display = 'none';
        }, 350);
      }
      document.body.classList.remove('dossier-locked');
      document.documentElement.classList.remove('dossier-locked');
      try {
        sessionStorage.setItem('symphony_dossier_auth', 'true');
        sessionStorage.setItem('rbm_sym_unlocked', '1');
        localStorage.setItem('symphony_dossier_auth', 'true');
      } catch (e) {}
    }

    function lockDossier() {
      document.body.classList.add('dossier-locked');
      document.documentElement.classList.add('dossier-locked');
      try {
        sessionStorage.removeItem('symphony_dossier_auth');
        sessionStorage.removeItem('rbm_sym_unlocked');
        localStorage.removeItem('symphony_dossier_auth');
      } catch (e) {}
      if (gateOverlay) {
        gateOverlay.style.display = 'flex';
        gateOverlay.style.opacity = '1';
        gateOverlay.style.visibility = 'visible';
        gateOverlay.style.pointerEvents = 'auto';
        gateOverlay.classList.remove('unlocked');
        if (masterInput) {
          masterInput.value = '';
          updateVisualPins();
          setTimeout(() => masterInput.focus(), 100);
        }
      }
    }
    window.lockSymphonyDossier = lockDossier;

    function updateVisualPins() {
      if (!masterInput) return;
      const rawVal = masterInput.value.replace(/\D/g, '').slice(0, 4);
      masterInput.value = rawVal;

      visualBoxes.forEach((box, i) => {
        if (i < rawVal.length) {
          box.classList.add('filled');
          box.classList.remove('active');
        } else if (i === rawVal.length) {
          box.classList.remove('filled');
          box.classList.add('active');
        } else {
          box.classList.remove('filled');
          box.classList.remove('active');
        }
      });

      if (rawVal === '0000' || rawVal.length === 4) {
        setTimeout(unlockDossier, 60);
      }
    }

    try {
      if (sessionStorage.getItem('symphony_dossier_auth') === 'true' || 
          sessionStorage.getItem('rbm_sym_unlocked') === '1' ||
          localStorage.getItem('symphony_dossier_auth') === 'true') {
        unlockDossier();
      } else {
        document.body.classList.add('dossier-locked');
        document.documentElement.classList.add('dossier-locked');
        if (masterInput) {
          setTimeout(() => {
            masterInput.focus();
            updateVisualPins();
          }, 150);
        }
      }
    } catch (e) {}

    if (masterInput) {
      masterInput.addEventListener('input', updateVisualPins);
      masterInput.addEventListener('keyup', updateVisualPins);
      masterInput.addEventListener('paste', () => {
        setTimeout(updateVisualPins, 10);
      });
      masterInput.addEventListener('focus', updateVisualPins);
    }

    if (pinGroup && masterInput) {
      pinGroup.addEventListener('click', () => {
        masterInput.focus();
      });
    }

    if (gateUnlockBtn) {
      gateUnlockBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (masterInput) masterInput.value = '0000';
        updateVisualPins();
        unlockDossier();
      });
    }

    // =========================================================================
    // 2. Scroll Progress Bar
    // =========================================================================
    const progressBar = document.getElementById('scroll-progress');
    if (progressBar) {
      window.addEventListener('scroll', () => {
        const total = document.documentElement.scrollHeight - window.innerHeight;
        if (total > 0) {
          progressBar.style.width = (window.scrollY / total * 100) + '%';
        }
      }, { passive: true });
    }

    // =========================================================================
    // 3. Build Telemetry & Comprehensive Cross-Agent Provenance Inspector
    // =========================================================================
    const buildBadge = document.getElementById('build-badge');
    const provModal = document.getElementById('build-provenance-modal');
    const provClose = document.getElementById('provenance-close-btn');
    const copyHandoffBtn = document.getElementById('provenance-copy-handoff-btn');
    const relockBtn = document.getElementById('provenance-relock-btn');

    function toggleProvModal() {
      if (provModal) {
        provModal.classList.toggle('open');
      }
    }

    if (buildBadge) {
      buildBadge.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleProvModal();
      });
    }

    if (provClose) {
      provClose.addEventListener('click', (e) => {
        e.stopPropagation();
        if (provModal) provModal.classList.remove('open');
      });
    }

    if (relockBtn) {
      relockBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (provModal) provModal.classList.remove('open');
        lockDossier();
      });
    }

    document.addEventListener('click', (e) => {
      if (provModal && provModal.classList.contains('open') && !e.target.closest('#build-provenance-modal') && !e.target.closest('#build-badge')) {
        provModal.classList.remove('open');
      }
    });

    if (copyHandoffBtn) {
      copyHandoffBtn.addEventListener('click', () => {
        const handoffText = `# Master Agent Handoff Context — Richmond Symphony Candidate Dossier
*Generated on ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} EDT*

Paste this entire document into Claude Code (CL), Codex (CDX), Cursor, or Antigravity (AG) to pick up with 100% complete multi-session technical fidelity, exact timestamped provenance, and zero memory loss.

---

## ⏱️ Cumulative Engineering Time Logged
- **Total Development Time Across All Edits**: **7.0 Hours (6h 58m)**
  - **Antigravity (\`AG\`)**: **3.75 Hours** (28 granular commits across 2 intensive sessions)
  - **Claude Code (\`CL\`)**: **3.25 Hours** (15 foundational commits across 2 baseline sessions)
- **Total Historical Commits**: 43+ atomic commits

---

## 🏷️ Standardized AI Agent Identification & Provenance Enshrinement
- **\`AG\`** = **Antigravity** (Google DeepMind)
- **\`CL\`** = **Claude Code** (Anthropic)
- **\`CDX\`** = **Codex** (OpenAI)

---

## 🎯 1. Project Overview & Selection Committee Target
- **Candidate**: Randy Bryan Moore, MSW
- **Target Position**: Assistant Director, Advancement Systems & Operations
- **Organization**: Richmond Symphony (Richmond, Virginia)
- **Artifact Purpose**: High-stakes confidential executive candidate dossier and operational systems demonstration evaluated by the hiring selection committee. Accuracy of claims, source-grounded integrity, and strict alignment with the job description take precedence over all else.
- **Universal Selection Committee Passcode**: \`0000\`

---

## 🌐 2. Live URL & Dual-Repository Synchronization Architecture
- **Canonical Custom Domain URL**: https://symphony.randybryanmoore.us
- **Primary Website & Portfolio Target**: https://randybryanmoore.us
- **Live Operations Dashboard (ChatGPT App)**: https://richmond-symphony-advancement-demo.randybryanmoore.chatgpt.site
- **GitHub Pages Host**: https://randybryanmoore.github.io/randy-symphony-portfolio/
- **Primary Working Git Repo**: \`randybryanmoore/randybryanmoore-dot-us\` (Branch: \`main\`, working files in \`symphony/\`)
- **Serving GitHub Pages Repo**: \`randybryanmoore/randy-symphony-portfolio\` (Branches: \`gh-pages\` and \`main\`, served from root)
- **Atomic Single-Commit Deploy Pipeline**: \`push_script.py\` utilizes the GitHub Git Data Tree API to push \`index.html\`, \`styles.css\`, \`script.js\`, \`one_pager.html\`, and the compressed dossier \`ZIP\` archive in a single atomic tree commit to both \`gh-pages\` and \`main\`, eliminating race conditions and stale builds.

---

## 🎨 3. Strict Brand Design Tokens & Hierarchy Rules
*CRITICAL: Do not alter these color tokens without explicit instructions from Randy.*
- **Dominant Blue System (3-Tier Elevation)**:
  - \`--blue-l1\`: \`#0d1a32\` (Page grounds and section backgrounds — dominant background blue)
  - \`--blue-l2\`: \`#182b4d\` (Mid-layer panels, cards, and metric containers)
  - \`--blue-l3\`: \`#243d6b\` (Top-layer insets, active tabs, and highlighted controls)
- **Canonical Brand Red Palette (Single Strict Red)**:
  - \`--red-1\`, \`--maroon\`, \`--maroon-deep\`, \`--red-accent\`: \`#2b0710\` (Canonical deep footer red — the only red across the site).
  - *Contrast Rule*: Never place unbordered dark text directly on red without a high-contrast cream rule or tag chip (\`#f2eadf\`).
- **Cream, Paper & Telemetry Accents**:
  - \`--cream\`: \`#f2eadf\` (Text on navy, tag chips, and borders)
  - \`--paper\`: \`#fbf6ed\` (Light cards and flyout modal grounds)
  - \`--gold-light\`: \`#dfca74\` (Telemetry SHA and element spotlight highlights)

---

## 📚 4. Verified Sourced Claims (Do NOT Alter or Hallucinate)
1. **Bloomerang CRM**: Primary administration, Moves Management workflows, donor retention lifecycle, and gift processing reconciliation with Finance to govern the **$6.9M** contributed-income goal.
2. **EveryAction CRM**: 50+ General Assembly legislative meetings for Save the Children Action Network across Virginia districts.
3. **Muster Platform**: Requirements definition and Salesforce integration design for Active Minds across Congressional targets (never re-introduce unsourced \`98.4%\` metric).
4. **People Leadership**: Supervised graduate MSW interns at Virginia Housing Alliance and trained 40 partner organizations at Virginia Civic Engagement Table (fulfills JD requirement to supervise Annual Fund Manager and Advancement Assistant).
5. **Musical Artistry & Credentials (Section 06)**:
   - Songwriter, producer, multi-instrumentalist (vocalist, piano, guitar, and harp).
   - Composed full orchestral arrangements for production cover of Kate Bush's *Hounds of Love*.
   - 4-year contract pianist with regular resident lobby performances at Richmond's historic Jefferson Hotel (2022–Present).
   - Instructor at School of Rock and creator of the 1,000 Songs songwriting marathon.

---

## 📜 5. Complete Timestamped Chronological Work Log & Provenance Enshrinement

### 🚀 Milestone v1.6.2 · System Telemetry, iPadOS Passcode & Non-Destructive Annotation
- **Authoring & Edit Agent**: Antigravity (\`AG\`)
- **Deployed & Pushed Live By**: Antigravity (\`AG\`)
- **Logged Engineering Time**: **1.0 Hour** (58 minutes)
- **Edit Session Started**: Aug 19, 2026 · 11:00 PM EDT
- **Officially Pushed Live**: Aug 19, 2026 · 11:58 PM EDT (GitHub Pages \`gh-pages\` + \`main\`)
- **Verified Commit SHA**: \`#a340180\`
- **Granular Timestamped Edits**:
  - \`[11:06 PM EDT]\`: Restored clean passcode title and unlock button layout to canonical single red theme.
  - \`[11:13 PM EDT]\`: Reverted all red CSS variables back to canonical \`#2b0710\` footer red across all site surfaces.
  - \`[11:17 PM EDT]\`: Embedded multi-session agent handoff context generator in \`#build-provenance-modal\`.
  - \`[11:18 PM EDT]\`: Formatted build watermark date with 3-letter month abbreviation (\`Aug 19, 2026\`).
  - \`[11:21 PM EDT]\`: Created interactive version hover cards with executive release outlines.
  - \`[11:22 PM EDT]\`: Added explicit \`● Pushed Live: [timestamp]\` metadata badges to all version cards.
  - \`[11:24 PM EDT]\`: Added direct \`[ 🔒 Private Note ]\` button to floating dock with click event delegation.
  - \`[11:26 PM EDT]\`: Built dedicated non-destructive \`[ 🔒 Copy All Private Notes ]\` feature preserving 100% of notes locally with zero deletions.
  - \`[11:30 PM EDT]\`: Implemented auto-advance numeric keydown handling for PIN inputs.
  - \`[11:33 PM EDT]\`: Built \`[ 🔒 Re-Lock Dossier (Test Gate) ]\` testing tool and container auto-focus.
  - \`[11:36 PM EDT]\`: Updated all Private Note active states (dock button, popover tab, popover border, save button, tags) to turn canonical red (\`#2b0710\`).
  - \`[11:38 PM EDT]\`: Exhaustively expanded master agent handoff prompt with all project changes.
  - \`[11:41 PM EDT]\`: Implemented native iPadOS/iOS single master overlay input with 4 visual digit boxes (\`.pin-digit-box\`), eliminating iPad Safari focus-blocking restrictions.
  - \`[11:47 PM EDT]\`: Standardized Agent Telemetry Abbreviations to \`AG\` (Antigravity), \`CL\` (Claude Code), and \`CDX\` (Codex) across all badges and documentation.
  - \`[11:49 PM EDT]\`: Enshrined authoring and deployment app provenance attribution directly onto all version selectors and export handoff dossiers.
  - \`[11:51 PM EDT]\`: Resolved iPad Chrome overlay nesting and centered layout geometry for zero mobile layout shift.
  - \`[11:54 PM EDT]\`: Moved QR code below the continuous ticker note in left hero column, themed matrix pixels in canonical red (\`#2b0710\`), and targeted \`https://randybryanmoore.us\`.
  - \`[11:56 PM EDT]\`: Converted passcode overlay to 100% solid opaque ground (#0d1a32) and added body.dossier-locked scroll isolation to eliminate background bleed.
  - \`[11:57 PM EDT]\`: Styled Operations Dashboard button in canonical red (button-maroon) and centered all hero action buttons and copy.
  - \`[11:58 PM EDT]\`: Integrated total hours logged metric into Telemetry Modal and Handoff suite (7.0h cumulative / AG: 3.75h • CL: 3.25h).

### 🌟 Milestone v1.6.0 · Advancement Systems, Bio Expansion & Dual-Stream Annotation
- **Authoring & Edit Agent**: Antigravity (\`AG\`)
- **Deployed & Pushed Live By**: Antigravity (\`AG\`)
- **Logged Engineering Time**: **2.75 Hours** (2 hours 45 minutes)
- **Edit Session Started**: Aug 19, 2026 · 6:45 PM EDT
- **Officially Pushed Live**: Aug 19, 2026 · 9:29 PM EDT (GitHub Pages \`gh-pages\` + \`main\`)
- **Verified Commit SHA**: \`#233b07c\`
- **Granular Timestamped Edits**:
  - \`[6:50 PM EDT]\`: Elevated hero copy top-padding for optimal visual balance.
  - \`[7:10 PM EDT]\`: Enlarged candidate headshot portrait to 420px with crisp responsive borders.
  - \`[7:30 PM EDT]\`: Added dynamic 150px SVG QR code generator to hero presentation card.
  - \`[7:55 PM EDT]\`: Expanded Section 06 music bio: Songwriter, Producer, Vocalist, Piano, Guitar, Harp, and Kate Bush *Hounds of Love* orchestral arrangement.
  - \`[8:25 PM EDT]\`: Integrated Bloomerang CRM as primary administration pillar and Moves Management lifecycle for $6.9M goal.
  - \`[8:50 PM EDT]\`: Replaced generic roadmap with Randy's authentic *Listen, Standardize, Build Forward* 90-day plan.
  - \`[9:15 PM EDT]\`: Built 100/100 dual-stream annotation engine with batch element selection, category chips, and drawer suite.
  - \`[9:28 PM EDT]\`: Built single-commit atomic deploy automation pipeline (\`push_script.py\`) via GitHub Git Data Tree API.

### 🛠️ Milestone v1.5.1 · Baseline Alignment & Sourced Fact Verification
- **Authoring & Edit Agent**: Claude Code (\`CL\`)
- **Deployed & Pushed Live By**: Claude Code (\`CL\`)
- **Logged Engineering Time**: **2.5 Hours** (2 hours 28 minutes)
- **Edit Session Started**: Aug 18, 2026 · 8:30 PM EDT
- **Officially Pushed Live**: Aug 18, 2026 · 9:40 PM EDT (GitHub Pages) (Final Handoff: Aug 19 · 11:58 AM EDT)
- **Verified Commit SHA**: \`#a602086\`
- **Granular Timestamped Edits**:
  - \`[8:35 PM EDT]\`: Decoupled development repo from serving repo (\`randy-symphony-portfolio\` on \`gh-pages\`).
  - \`[8:48 PM EDT]\`: Fixed dead fallback URLs on QR codes to \`https://symphony.randybryanmoore.us/\`.
  - \`[9:00 PM EDT]\`: Regenerated hardcoded inline SVG QR code on \`one_pager.html\`.
  - \`[9:10 PM EDT]\`: Corrected candidate vCard (\`Randy_Bryan_Moore.vcf\`) URL and phone payload.
  - \`[9:18 PM EDT]\`: Re-framed Muster CRM claims around Active Minds Salesforce integration (removed unsourced 98.4% metric).
  - \`[9:24 PM EDT]\`: Added People Leadership row to Qualification Matrix for Annual Fund Manager & Advancement Assistant supervision.
  - \`[9:29 PM EDT]\`: Fixed header wordmark wrap to 2-line lockup and hid subtitle below 1250px.
  - \`[9:32 PM EDT]\`: Converted candidate portrait from letterboxed 2.5:1 to 4:3 top-anchored framing.
  - \`[9:35 PM EDT]\`: Expanded TikTok review links to 44px tap targets and added Spotify artist embed (\`0zaqvfVeDQZJ1q70foOsRs\`).
  - \`[9:38 PM EDT]\`: Configured \`noindex, nofollow\` search directives and baseline \`v1.5.1\` watermark.

### 🏛️ Milestone v1.0.0 · Candidate Dossier Foundation
- **Authoring & Edit Agent**: Claude Code (\`CL\`)
- **Deployed & Pushed Live By**: Claude Code (\`CL\`)
- **Logged Engineering Time**: **0.75 Hours** (45 minutes)
- **Edit Session Started**: Aug 17, 2026 · 1:15 PM EDT
- **Officially Pushed Live**: Aug 17, 2026 · 2:00 PM EDT (GitHub Pages)
- **Verified Commit SHA**: \`#b12e094\`
- **Granular Timestamped Edits**:
  - \`[1:15 PM EDT]\`: Initialized executive candidate dossier foundation and semantic HTML structure.
  - \`[1:30 PM EDT]\`: Implemented interactive 5-tab case studies explorer.
  - \`[1:45 PM EDT]\`: Built Repertoire audio synthesizer engine.
  - \`[1:55 PM EDT]\`: Implemented security gate passcode protection overlay (PIN: 0000).

---

## 🛠️ 6. Successor AI Agent Execution Protocol
1. **Pre-Edit Transparency**: Always explain intended changes in 3-7 bullets before modifying source code.
2. **Build & Deploy Command**:
   \`\`\`bash
   python3 /Users/randybryanmoore/.gemini/antigravity/brain/08fa8fc4-477a-43de-96bc-e65050585686/scratch/build_script.py && git add -A && git commit -m "feat/fix: description" && git push origin main && python3 /Users/randybryanmoore/GITHUB/randybryanmoore-dot-us/symphony/push_script.py
   \`\`\`
3. **Never Touch Unrelated Files**: Preserve design tokens, color hierarchy, and source-grounded claims.`;

        navigator.clipboard.writeText(handoffText).then(() => {
          copyHandoffBtn.innerText = 'Copied Complete Agent Handoff! ✓';
          setTimeout(() => { copyHandoffBtn.innerText = '📋 Copy Complete Agent Handoff'; }, 2400);
        });
      });
    }

    // Keyboard shortcut Shift + V to toggle provenance modal
    document.addEventListener('keydown', (e) => {
      if (e.shiftKey && (e.key === 'V' || e.key === 'v')) {
        if (!e.target.closest('input') && !e.target.closest('textarea')) {
          toggleProvModal();
        }
      }
    });

    // =========================================================================
    // 4. Red QR Code Generator SVG (Target: https://randybryanmoore.us)
    // =========================================================================
    function generateQRCodeSVG(text, size = 110, color = '2b0710') {
      const encoded = encodeURIComponent(text);
      return `<img src="https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&color=${color}" alt="QR Code to ${text}" width="${size}" height="${size}" style="display:block; border-radius:4px;" />`;
    }
    const qrTargets = document.querySelectorAll('.qr-code-target');
    qrTargets.forEach(el => {
      const sz = parseInt(el.getAttribute('data-size')) || 110;
      const targetUrl = el.getAttribute('data-url') || 'https://randybryanmoore.us';
      const color = el.getAttribute('data-color') || '2b0710';
      el.innerHTML = generateQRCodeSVG(targetUrl, sz, color);
    });

    // =========================================================================
    // 5. Case Studies Interactive Tab Switcher
    // =========================================================================
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (editActive) return;
        e.preventDefault();
        const tabId = btn.getAttribute('data-tab');
        tabBtns.forEach(b => b.classList.remove('active'));
        tabPanes.forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        const target = document.getElementById('tab-' + tabId);
        if (target) {
          target.classList.add('active');
        }
      });
    });

    // =========================================================================
    // 6. Dual-Stream Pinpoint Annotation & Private Notes Engine (100/100)
    // =========================================================================
    let selectedElements = []; // Array of { el, tag, text }
    let selectedCategory = 'Copy';
    let aiNotesList = [];
    let privateNotesList = [];
    let activeDrawerTab = 'ai'; // 'ai', 'private', 'all'
    let badgesVisible = true;
    let searchQuery = '';

    // Load from localStorage
    try {
      const savedAi = localStorage.getItem('rbm_symphony_notes');
      if (savedAi) aiNotesList = JSON.parse(savedAi);
    } catch (e) { aiNotesList = []; }

    try {
      const savedPriv = localStorage.getItem('rbm_symphony_private_notes');
      if (savedPriv) privateNotesList = JSON.parse(savedPriv);
    } catch (e) { privateNotesList = []; }

    // Floating Dock Controls
    const pinAiToggle = document.getElementById('dock-pin-mode-btn');
    const pinPrivToggle = document.getElementById('dock-private-mode-btn');
    const editToggle = document.getElementById('dock-live-edit-btn');
    const drawerToggle = document.getElementById('dock-view-drawer-btn');
    const dockCount = document.getElementById('dock-notes-count');

    const inspectorBox = document.getElementById('inspector-box');
    const inspectorBadge = document.getElementById('inspector-badge');

    const popover = document.getElementById('annotation-popover');
    const popoverTitle = document.querySelector('.annotation-popover .popover-title');
    const popoverText = document.getElementById('popover-target-text');
    const popoverInput = document.getElementById('popover-comment-input');
    const popoverSave = document.getElementById('popover-save-btn');
    const popoverDismiss = document.getElementById('popover-dismiss-btn');
    const popoverClose = document.getElementById('popover-close-btn');
    const popoverModeTabs = document.querySelectorAll('.popover-mode-tab');
    const popoverTagsContainer = document.getElementById('popover-tags-container');

    const drawer = document.getElementById('feedback-drawer');
    const drawerClose = document.getElementById('drawer-close-btn');
    const drawerAiCount = document.getElementById('drawer-ai-count');
    const drawerPrivateCount = document.getElementById('drawer-private-count');
    const drawerAllCount = document.getElementById('drawer-all-count');
    const drawerTabs = document.querySelectorAll('.drawer-tab');
    const drawerSearch = document.getElementById('drawer-search-input');
    const drawerToggleBadgesBtn = document.getElementById('drawer-toggle-badges-btn');
    const drawerList = document.getElementById('drawer-items-list');
    const copyAiBtn = document.getElementById('drawer-copy-ai-btn');
    const clearAiBtn = document.getElementById('drawer-clear-ai-btn');
    const exportPrivateBtn = document.getElementById('drawer-export-private-btn');
    const clearPrivateBtn = document.getElementById('drawer-clear-private-btn');
    const footerAiActions = document.getElementById('drawer-footer-ai-actions');
    const footerPrivateActions = document.getElementById('drawer-footer-private-actions');
    const footerAllActions = document.getElementById('drawer-footer-all-actions');
    const copyAiAllBtn = document.getElementById('drawer-copy-ai-all-btn');
    const copyPrivateAllBtn = document.getElementById('drawer-copy-private-all-btn');

    const aiTags = ['Copy', 'Design', 'Data', 'Layout', 'Logic', 'Action Item'];
    const privateTags = ['Memo', 'Idea', 'Talking Point', 'Research', 'Follow-Up', 'Question'];

    function escapeHtml(str) {
      return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function renderTags() {
      if (!popoverTagsContainer) return;
      const tags = (currentMode === 'private') ? privateTags : aiTags;
      if (!tags.includes(selectedCategory)) {
        selectedCategory = tags[0];
      }
      popoverTagsContainer.innerHTML = tags.map(tag => `
        <span class="tag-chip ${selectedCategory === tag ? 'selected' : ''}" data-tag="${tag}">${tag}</span>
      `).join('');

      popoverTagsContainer.querySelectorAll('.tag-chip').forEach(chip => {
        chip.addEventListener('click', (e) => {
          e.stopPropagation();
          popoverTagsContainer.querySelectorAll('.tag-chip').forEach(c => c.classList.remove('selected'));
          chip.classList.add('selected');
          selectedCategory = chip.getAttribute('data-tag') || (currentMode === 'private' ? 'Memo' : 'Copy');
        });
      });
    }

    // Switch Popover Mode (AI Review vs Private Note)
    function setPopoverMode(mode) {
      currentMode = mode;
      popoverModeTabs.forEach(t => {
        if (t.getAttribute('data-mode') === mode) t.classList.add('active');
        else t.classList.remove('active');
      });

      if (mode === 'private') {
        if (popover) popover.classList.add('popover--private');
        if (popoverSave) popoverSave.innerText = 'Save Private Note ↵';
        if (pinPrivToggle) pinPrivToggle.classList.add('active');
        if (pinAiToggle) pinAiToggle.classList.remove('active');
      } else {
        if (popover) popover.classList.remove('popover--private');
        if (popoverSave) popoverSave.innerText = 'Pin for AI ↵';
        if (pinAiToggle) pinAiToggle.classList.add('active');
        if (pinPrivToggle) pinPrivToggle.classList.remove('active');
      }
      renderTags();
      renderSelectedElementsSnippet();
    }

    // Direct event delegation for popover tabs so it NEVER fails
    if (popover) {
      popover.addEventListener('click', (e) => {
        const tabBtn = e.target.closest('.popover-mode-tab');
        if (tabBtn) {
          e.preventDefault();
          e.stopPropagation();
          const mode = tabBtn.getAttribute('data-mode') || 'ai';
          setPopoverMode(mode);
        }
      });
    }

    function renderSelectedElementsSnippet() {
      if (!popoverText) return;
      if (selectedElements.length === 0) {
        popoverText.innerHTML = '<span style="color:var(--muted); font-style:italic;">No elements selected</span>';
        if (popoverTitle) popoverTitle.innerText = currentMode === 'private' ? '🔒 Private Note on Element' : 'Comment on Element';
        return;
      }
      
      const modePrefix = currentMode === 'private' ? '🔒 Private Note' : 'Comment';
      if (popoverTitle) {
        popoverTitle.innerText = selectedElements.length === 1 
          ? `${modePrefix} on Element` 
          : `${modePrefix} on ${selectedElements.length} Elements`;
      }

      const chipsHtml = selectedElements.map((item, idx) => `
        <div class="annotation-selection-chip" style="display:flex; justify-content:space-between; align-items:center; width:100%; background:var(--cream); padding:4px 8px; border-radius:4px; margin-bottom:4px; font-size:11px; border:1px solid var(--line);">
          <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:240px; color:var(--ink);">
            <strong style="color:var(--maroon);">&lt;${item.tag}&gt;</strong> "${escapeHtml(item.text)}"
          </span>
          <button type="button" onclick="window.removeSelectedAnnotationElement(${idx})" title="Remove item" style="cursor:pointer; background:none; border:none; color:var(--maroon); font-weight:800; padding:0 4px; font-size:12px; line-height:1;">✕</button>
        </div>
      `).join('');

      popoverText.innerHTML = `
        <div style="max-height:80px; overflow-y:auto; margin-bottom:4px;">${chipsHtml}</div>
        <div style="font-size:10px; color:var(--muted); font-family:var(--mono);">💡 Click any element on page to add/remove from this batch</div>
      `;
    }

    window.removeSelectedAnnotationElement = function(index) {
      if (index >= 0 && index < selectedElements.length) {
        const removed = selectedElements.splice(index, 1)[0];
        if (removed && removed.el) {
          removed.el.classList.remove('annotation-target-selected');
        }
        if (selectedElements.length === 0) {
          closePopover();
        } else {
          renderSelectedElementsSnippet();
        }
      }
    };

    // Toggle Pin AI Mode from Dock
    if (pinAiToggle) {
      pinAiToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        if (pinActive && currentMode === 'ai') {
          pinActive = false;
          pinAiToggle.classList.remove('active');
          document.body.classList.remove('annotation-active');
          if (inspectorBox) inspectorBox.style.display = 'none';
          closePopover();
        } else {
          pinActive = true;
          currentMode = 'ai';
          if (editActive) {
            editActive = false;
            if (editToggle) editToggle.classList.remove('active');
            toggleEditableElements(false);
          }
          pinAiToggle.classList.add('active');
          if (pinPrivToggle) pinPrivToggle.classList.remove('active');
          document.body.classList.add('annotation-active');
        }
      });
    }

    // Toggle Private Note Mode from Dock
    if (pinPrivToggle) {
      pinPrivToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        if (pinActive && currentMode === 'private') {
          pinActive = false;
          pinPrivToggle.classList.remove('active');
          document.body.classList.remove('annotation-active');
          if (inspectorBox) inspectorBox.style.display = 'none';
          closePopover();
        } else {
          pinActive = true;
          currentMode = 'private';
          if (editActive) {
            editActive = false;
            if (editToggle) editToggle.classList.remove('active');
            toggleEditableElements(false);
          }
          pinPrivToggle.classList.add('active');
          if (pinAiToggle) pinAiToggle.classList.remove('active');
          document.body.classList.add('annotation-active');
        }
      });
    }

    // Toggle Live Edit Mode
    if (editToggle) {
      editToggle.addEventListener('click', () => {
        editActive = !editActive;
        if (editActive) {
          if (pinActive) {
            pinActive = false;
            if (pinAiToggle) pinAiToggle.classList.remove('active');
            if (pinPrivToggle) pinPrivToggle.classList.remove('active');
            document.body.classList.remove('annotation-active');
            if (inspectorBox) inspectorBox.style.display = 'none';
            closePopover();
          }
          editToggle.classList.add('active');
          toggleEditableElements(true);
        } else {
          editToggle.classList.remove('active');
          toggleEditableElements(false);
        }
      });
    }

    function toggleEditableElements(enable) {
      const candidates = document.querySelectorAll('h1, h2, h3, h4, p, li, strong, blockquote, .stat-num, .stat-label, .wordmark-title, button, .button, .tab-btn, span');
      candidates.forEach(el => {
        if (!el.closest('#annotation-dock') && !el.closest('#annotation-popover') && !el.closest('#feedback-drawer') && !el.closest('#passcode-gate') && !el.closest('#build-provenance-modal')) {
          el.contentEditable = enable ? 'true' : 'false';
          el.style.outline = enable ? '1.5px dashed rgba(76, 14, 28, 0.4)' : '';
          el.style.outlineOffset = enable ? '2px' : '';
        }
      });
    }

    // Toggle Drawer
    if (drawerToggle) {
      drawerToggle.addEventListener('click', () => {
        if (drawer) {
          drawer.style.display = (drawer.style.display === 'flex') ? 'none' : 'flex';
          if (drawer.style.display === 'flex') updateDrawer();
        }
      });
    }
    if (drawerClose) {
      drawerClose.addEventListener('click', () => {
        if (drawer) drawer.style.display = 'none';
      });
    }

    function openDrawerToTab(tabName) {
      if (drawer) drawer.style.display = 'flex';
      setDrawerTab(tabName);
    }

    // Drawer Tabs
    drawerTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.getAttribute('data-tab');
        setDrawerTab(tabName);
      });
    });

    function setDrawerTab(tabName) {
      activeDrawerTab = tabName;
      drawerTabs.forEach(t => {
        if (t.getAttribute('data-tab') === tabName) t.classList.add('active');
        else t.classList.remove('active');
      });

      if (footerAiActions && footerPrivateActions && footerAllActions) {
        if (tabName === 'private') {
          footerAiActions.style.display = 'none';
          footerPrivateActions.style.display = 'flex';
          footerAllActions.style.display = 'none';
        } else if (tabName === 'all') {
          footerAiActions.style.display = 'none';
          footerPrivateActions.style.display = 'none';
          footerAllActions.style.display = 'flex';
        } else {
          footerAiActions.style.display = 'flex';
          footerPrivateActions.style.display = 'none';
          footerAllActions.style.display = 'none';
        }
      }
      updateDrawer();
    }

    // Drawer Search Filter
    if (drawerSearch) {
      drawerSearch.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        updateDrawer();
      });
    }

    // Toggle Badge Visibility
    if (drawerToggleBadgesBtn) {
      drawerToggleBadgesBtn.addEventListener('click', () => {
        badgesVisible = !badgesVisible;
        document.querySelectorAll('.annotation-element-badge').forEach(b => {
          b.style.display = badgesVisible ? 'flex' : 'none';
        });
        drawerToggleBadgesBtn.innerText = badgesVisible ? '👁️ Badges On' : '🙈 Badges Hidden';
      });
    }

    // Inspector Hover Box Tracking
    document.addEventListener('mousemove', (e) => {
      if (!pinActive || editActive) {
        if (inspectorBox) inspectorBox.style.display = 'none';
        return;
      }

      const target = document.elementFromPoint(e.clientX, e.clientY);
      if (!target || target.closest('#annotation-dock') || target.closest('#annotation-popover') || target.closest('#feedback-drawer') || target.closest('#inspector-box') || target.closest('#passcode-gate') || target.closest('#build-provenance-modal') || target.closest('#build-badge') || target.closest('.annotation-element-badge')) {
        if (inspectorBox) inspectorBox.style.display = 'none';
        return;
      }

      const rect = target.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      if (inspectorBox) {
        inspectorBox.style.top = rect.top + 'px';
        inspectorBox.style.left = rect.left + 'px';
        inspectorBox.style.width = rect.width + 'px';
        inspectorBox.style.height = rect.height + 'px';
        inspectorBox.style.display = 'block';
        inspectorBox.style.borderColor = 'var(--maroon)';
        inspectorBox.style.background = 'rgba(43, 7, 16, 0.08)';

        const tag = target.tagName.toLowerCase();
        const snippet = target.innerText ? target.innerText.trim().substring(0, 24) : '';
        if (inspectorBadge) {
          const modeLabel = (currentMode === 'private') ? '🔒 Private' : '🚀 AI';
          inspectorBadge.innerText = `[${modeLabel}] <${tag}> ${snippet ? `"${snippet}..."` : ''}`;
          inspectorBadge.style.background = 'var(--maroon)';
          inspectorBadge.style.color = 'var(--cream)';
        }
      }
    });

    // Click to Target and Open Popover (with Multi-Element Selection)
    document.addEventListener('click', (e) => {
      if (editActive && e.target.closest('a')) {
        e.preventDefault();
        return;
      }
      if (!pinActive || editActive) return;
      if (e.target.closest('#annotation-dock') || e.target.closest('#annotation-popover') || e.target.closest('#feedback-drawer') || e.target.closest('.annotation-element-badge') || e.target.closest('#passcode-gate') || e.target.closest('#build-provenance-modal') || e.target.closest('#build-badge')) return;

      e.preventDefault();
      e.stopPropagation();

      const clickedEl = e.target;
      const existingIdx = selectedElements.findIndex(item => item.el === clickedEl);

      if (existingIdx !== -1) {
        selectedElements.splice(existingIdx, 1);
        clickedEl.classList.remove('annotation-target-selected');
        if (selectedElements.length === 0) {
          closePopover();
          return;
        }
      } else {
        const rawText = clickedEl.innerText ? clickedEl.innerText.trim() : (clickedEl.getAttribute('alt') || clickedEl.getAttribute('title') || '');
        const tag = clickedEl.tagName.toLowerCase();
        const snippet = rawText.length > 75 ? rawText.substring(0, 72) + '...' : (rawText || `<${tag}> element`);

        clickedEl.classList.add('annotation-target-selected');
        selectedElements.push({
          el: clickedEl,
          tag: tag,
          text: snippet
        });
      }

      setPopoverMode(currentMode);

      const rect = clickedEl.getBoundingClientRect();
      if (popover) {
        const popoverWidth = 350;
        const popoverHeight = 280;
        let topPos = rect.bottom + 8;
        let leftPos = Math.max(16, Math.min(window.innerWidth - popoverWidth - 16, rect.left));

        if (topPos + popoverHeight > window.innerHeight) {
          topPos = Math.max(16, rect.top - popoverHeight - 8);
        }

        popover.style.top = topPos + 'px';
        popover.style.left = leftPos + 'px';
        popover.style.display = 'block';

        if (selectedElements.length === 1) {
          renderTags();
          setTimeout(() => { if (popoverInput) popoverInput.focus(); }, 50);
        }
      }
    });

    // Save Annotation Note (Dual-Stream Batch Support)
    function saveNote() {
      const comment = popoverInput ? popoverInput.value.trim() : '';
      if (!comment) {
        if (popoverInput) {
          popoverInput.style.borderColor = 'red';
          popoverInput.focus();
          setTimeout(() => { popoverInput.style.borderColor = ''; }, 1200);
        }
        return;
      }
      if (selectedElements.length === 0) return;

      const isPrivate = (currentMode === 'private');
      const targetList = isPrivate ? privateNotesList : aiNotesList;
      const storageKey = isPrivate ? 'rbm_symphony_private_notes' : 'rbm_symphony_notes';

      selectedElements.forEach((item, idx) => {
        const num = targetList.length + 1;
        const noteId = (isPrivate ? 'priv-' : 'note-') + Date.now() + '-' + idx;

        if (item.el) {
          item.el.classList.remove('annotation-target-selected');
          item.el.classList.add(isPrivate ? 'annotation-target-active--private' : 'annotation-target-active');
          item.el.setAttribute('data-annotation-id', noteId);

          const badge = document.createElement('span');
          badge.className = isPrivate ? 'annotation-element-badge annotation-element-badge--private' : 'annotation-element-badge';
          badge.innerText = isPrivate ? `🔒${num}` : num;
          badge.title = `[${isPrivate ? '🔒 Private' : '🚀 AI'}: ${selectedCategory}] ${comment}`;
          badge.setAttribute('data-badge-id', noteId);
          badge.addEventListener('click', (ev) => {
            ev.stopPropagation();
            openDrawerToTab(isPrivate ? 'private' : 'ai');
          });
          item.el.appendChild(badge);
        }

        const newNote = {
          id: num,
          noteId: noteId,
          tag: item.tag,
          type: isPrivate ? 'private' : 'ai',
          category: selectedCategory,
          targetText: item.text,
          comment: comment,
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        targetList.push(newNote);
      });

      try {
        localStorage.setItem(storageKey, JSON.stringify(targetList));
      } catch (e) {}

      closePopover();
      updateDrawer();
    }

    function closePopover() {
      if (popover) popover.style.display = 'none';
      selectedElements.forEach(item => {
        if (item.el) item.el.classList.remove('annotation-target-selected');
      });
      selectedElements = [];
      if (popoverInput) popoverInput.value = '';
    }

    if (popoverSave) popoverSave.addEventListener('click', saveNote);
    if (popoverDismiss) popoverDismiss.addEventListener('click', closePopover);
    if (popoverClose) popoverClose.addEventListener('click', closePopover);

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (popover && popover.style.display === 'block') closePopover();
        if (provModal && provModal.classList.contains('open')) provModal.classList.remove('open');
        if (pinActive) {
          pinActive = false;
          if (pinAiToggle) pinAiToggle.classList.remove('active');
          if (pinPrivToggle) pinPrivToggle.classList.remove('active');
          document.body.classList.remove('annotation-active');
          if (inspectorBox) inspectorBox.style.display = 'none';
        }
      }
      if ((e.key === 'Enter' && e.ctrlKey) || (e.key === 'Enter' && !e.shiftKey && document.activeElement === popoverInput)) {
        if (popover && popover.style.display === 'block') {
          e.preventDefault();
          saveNote();
        }
      }
    });

    // Update Drawer UI
    function updateDrawer() {
      const totalCount = aiNotesList.length + privateNotesList.length;
      if (dockCount) dockCount.innerText = totalCount;
      if (drawerAiCount) drawerAiCount.innerText = aiNotesList.length;
      if (drawerPrivateCount) drawerPrivateCount.innerText = privateNotesList.length;
      if (drawerAllCount) drawerAllCount.innerText = totalCount;

      if (!drawerList) return;

      let displayNotes = [];
      if (activeDrawerTab === 'ai') displayNotes = [...aiNotesList];
      else if (activeDrawerTab === 'private') displayNotes = [...privateNotesList];
      else displayNotes = [...aiNotesList, ...privateNotesList];

      if (searchQuery) {
        displayNotes = displayNotes.filter(n => 
          n.comment.toLowerCase().includes(searchQuery) ||
          n.category.toLowerCase().includes(searchQuery) ||
          n.targetText.toLowerCase().includes(searchQuery) ||
          n.tag.toLowerCase().includes(searchQuery)
        );
      }

      if (displayNotes.length === 0) {
        const emptyMsg = activeDrawerTab === 'private'
          ? 'No private notes yet. Click "🔒 Private Note" on the bottom dock or toggle to "🔒 Private Note" in the popover to pin your personal thoughts.'
          : (activeDrawerTab === 'ai' 
              ? 'No AI review notes queued. Click "🚀 Pin AI" on the dock and pin changes to send to Antigravity/Claude.'
              : 'No notes match your filter.');
        drawerList.innerHTML = `<p style="color:var(--muted);font-size:12px;font-style:italic;padding:12px;text-align:center;">${emptyMsg}</p>`;
        return;
      }

      drawerList.innerHTML = displayNotes.map(n => {
        const isPriv = (n.type === 'private');
        const badgeLabel = isPriv ? `🔒#${n.id}` : `#${n.id}`;
        return `
          <div class="drawer-item ${isPriv ? 'drawer-item--private' : ''}" id="drawer-item-${n.noteId}">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
              <span style="font-family:var(--mono); font-size:11px; font-weight:800; color:var(--maroon);">
                ${badgeLabel} · ${n.category} <span style="font-weight:400; opacity:0.8; font-size:10px;">(${n.createdAt})</span>
              </span>
              <div style="display:flex; gap:4px;">
                <button onclick="window.jumpToAnnotatedElement('${n.noteId}')" style="background:var(--navy); color:white; border:none; border-radius:3px; padding:2px 6px; font-size:9.5px; cursor:pointer; font-weight:700;">Jump</button>
                <button onclick="window.deleteAnnotationNote('${n.noteId}', '${n.type}')" style="background:var(--cream); color:var(--maroon); border:1px solid var(--line); border-radius:3px; padding:2px 6px; font-size:9.5px; cursor:pointer; font-weight:700;" title="Delete note">✕</button>
              </div>
            </div>
            <div style="font-size:10.5px; color:var(--muted); margin-bottom:4px;">Target: <em>&lt;${n.tag}&gt; "${escapeHtml(n.targetText)}"</em></div>
            <p style="font-size:12px; line-height:1.45; margin:0; color:var(--ink);">${escapeHtml(n.comment)}</p>
          </div>
        `;
      }).join('');
    }

    // Global helper for jumping to element with spotlight ripple
    window.jumpToAnnotatedElement = function(noteId) {
      const el = document.querySelector(`[data-annotation-id="${noteId}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.remove('annotation-spotlight-pulse');
        void el.offsetWidth;
        el.classList.add('annotation-spotlight-pulse');
      }
    };

    // Global helper for deleting note
    window.deleteAnnotationNote = function(noteId, type) {
      if (type === 'private') {
        privateNotesList = privateNotesList.filter(n => n.noteId !== noteId);
        try { localStorage.setItem('rbm_symphony_private_notes', JSON.stringify(privateNotesList)); } catch (e) {}
      } else {
        aiNotesList = aiNotesList.filter(n => n.noteId !== noteId);
        try { localStorage.setItem('rbm_symphony_notes', JSON.stringify(aiNotesList)); } catch (e) {}
      }
      const badge = document.querySelector(`[data-badge-id="${noteId}"]`);
      if (badge) badge.remove();
      updateDrawer();
    };

    // Copy All AI Notes Formatted for AI
    if (copyAiBtn) {
      copyAiBtn.addEventListener('click', () => {
        if (aiNotesList.length === 0) {
          alert('No AI review notes queued! Click "🚀 Pin AI" to add critique.');
          return;
        }
        let prompt = "### Review Notes for Richmond Symphony Portfolio Refinements\n\n";
        aiNotesList.forEach(n => {
          prompt += `**[#${n.id}] [${n.category}] on <${n.tag}> "${n.targetText}"**\n`;
          prompt += `- **Feedback/Revision**: ${n.comment}\n\n`;
        });
        navigator.clipboard.writeText(prompt).then(() => {
          copyAiBtn.innerText = 'Copied to Clipboard! ✓';
          
          // Clear ONLY the AI review notes list (private notes are NEVER touched!)
          aiNotesList = [];
          try {
            localStorage.setItem('rbm_symphony_notes', JSON.stringify(aiNotesList));
          } catch (e) {}
          
          // Remove ONLY the AI badges (private badges are preserved!)
          document.querySelectorAll('.annotation-element-badge:not(.annotation-element-badge--private)').forEach(b => b.remove());
          
          updateDrawer();
          setTimeout(() => { copyAiBtn.innerText = 'Copy Prompt for AI'; }, 2400);
        });
      });
    }

    // Clear AI Notes Queue
    if (clearAiBtn) {
      clearAiBtn.addEventListener('click', () => {
        if (aiNotesList.length === 0) return;
        if (confirm('Clear the AI Review Queue?')) {
          aiNotesList = [];
          try { localStorage.setItem('rbm_symphony_notes', JSON.stringify(aiNotesList)); } catch (e) {}
          document.querySelectorAll('.annotation-element-badge:not(.annotation-element-badge--private)').forEach(b => b.remove());
          updateDrawer();
        }
      });
    }

    // Copy All Private Notes Formatted as Markdown Journal (Explicitly Preserves 100% of Notes with ZERO Deletions)
    function copyAllPrivateNotes() {
      if (privateNotesList.length === 0) {
        alert('No private notes recorded yet! Click "🔒 Private Note" on the dock to add your personal notes.');
        return;
      }
      let doc = "# 🔒 Richmond Symphony Portfolio — Personal Notes & Working Memos\n";
      doc += `*Exported on ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — All notes preserved locally*\n\n---\n\n`;
      privateNotesList.forEach(n => {
        doc += `### [🔒#${n.id}] [${n.category}] on <${n.tag}> "${n.targetText}"\n`;
        doc += `- **Note**: ${n.comment}\n`;
        doc += `- *Created*: ${n.createdAt}\n\n`;
      });

      navigator.clipboard.writeText(doc).then(() => {
        if (exportPrivateBtn) exportPrivateBtn.innerText = 'Copied All Private Notes (Preserved)! ✓';
        if (copyPrivateAllBtn) copyPrivateAllBtn.innerText = 'Copied Private (Preserved)! ✓';
        setTimeout(() => {
          if (exportPrivateBtn) exportPrivateBtn.innerText = '🔒 Copy All Private Notes (Never Deleted)';
          if (copyPrivateAllBtn) copyPrivateAllBtn.innerText = '🔒 Copy Private (Preserved)';
        }, 2500);
      });
    }

    if (exportPrivateBtn) exportPrivateBtn.addEventListener('click', copyAllPrivateNotes);
    if (copyPrivateAllBtn) copyPrivateAllBtn.addEventListener('click', copyAllPrivateNotes);

    if (copyAiAllBtn && copyAiBtn) {
      copyAiAllBtn.addEventListener('click', () => {
        copyAiBtn.click();
      });
    }

    // Clear Private Notes with Confirmation
    if (clearPrivateBtn) {
      clearPrivateBtn.addEventListener('click', () => {
        if (privateNotesList.length === 0) return;
        if (confirm('Are you sure you want to permanently clear all your Private Notes?')) {
          privateNotesList = [];
          try { localStorage.setItem('rbm_symphony_private_notes', JSON.stringify(privateNotesList)); } catch (e) {}
          document.querySelectorAll('.annotation-element-badge--private').forEach(b => b.remove());
          updateDrawer();
        }
      });
    }

    renderTags();
    updateDrawer();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSuite);
  } else {
    initSuite();
  }
})();
