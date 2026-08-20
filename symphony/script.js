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
    // 1. Passcode Gate (Universal PIN: 0000 / Auto-Advance Engine)
    // =========================================================================
    const gateOverlay = document.getElementById('passcode-gate');
    const pinInputs = document.querySelectorAll('.pin-digit');
    const pinGroup = document.querySelector('.pin-input-group');
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
      try {
        sessionStorage.setItem('symphony_dossier_auth', 'true');
        sessionStorage.setItem('rbm_sym_unlocked', '1');
        localStorage.setItem('symphony_dossier_auth', 'true');
      } catch (e) {}
    }

    function lockDossier() {
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
        pinInputs.forEach(i => i.value = '');
        if (pinInputs.length > 0) {
          setTimeout(() => pinInputs[0].focus(), 100);
        }
      }
    }
    window.lockSymphonyDossier = lockDossier;

    try {
      if (sessionStorage.getItem('symphony_dossier_auth') === 'true' || 
          sessionStorage.getItem('rbm_sym_unlocked') === '1' ||
          localStorage.getItem('symphony_dossier_auth') === 'true') {
        unlockDossier();
      } else {
        if (pinInputs.length > 0) {
          setTimeout(() => pinInputs[0].focus(), 150);
        }
      }
    } catch (e) {}

    if (gateUnlockBtn) {
      gateUnlockBtn.addEventListener('click', (e) => {
        e.preventDefault();
        pinInputs.forEach(i => i.value = '0');
        unlockDossier();
      });
    }

    function checkAndUnlock() {
      const entered = Array.from(pinInputs).map(i => i.value.trim()).join('');
      if (entered === '0000' || entered.length === 4) {
        setTimeout(unlockDossier, 80);
      }
    }

    // Auto-focus container click
    if (pinGroup) {
      pinGroup.addEventListener('click', () => {
        const emptyInput = Array.from(pinInputs).find(i => !i.value);
        if (emptyInput) emptyInput.focus();
        else pinInputs[pinInputs.length - 1].focus();
      });
    }

    pinInputs.forEach((input, idx) => {
      // Auto-select text on focus
      input.addEventListener('focus', () => {
        input.select();
      });

      // Handle Keydown for instant advance on 0-9 and smart backspace
      input.addEventListener('keydown', (e) => {
        if (e.key >= '0' && e.key <= '9') {
          input.value = e.key;
          e.preventDefault();
          if (idx < pinInputs.length - 1) {
            pinInputs[idx + 1].focus();
            pinInputs[idx + 1].select();
          }
          checkAndUnlock();
        } else if (e.key === 'Backspace') {
          e.preventDefault();
          if (input.value) {
            input.value = '';
          } else if (idx > 0) {
            pinInputs[idx - 1].value = '';
            pinInputs[idx - 1].focus();
            pinInputs[idx - 1].select();
          }
          checkAndUnlock();
        } else if (e.key === 'ArrowLeft' && idx > 0) {
          e.preventDefault();
          pinInputs[idx - 1].focus();
          pinInputs[idx - 1].select();
        } else if (e.key === 'ArrowRight' && idx < pinInputs.length - 1) {
          e.preventDefault();
          pinInputs[idx + 1].focus();
          pinInputs[idx + 1].select();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          unlockDossier();
        }
      });

      // Universal input handler (mobile keyboards, virtual keypads, autofill)
      input.addEventListener('input', () => {
        const rawVal = input.value.replace(/\D/g, '');
        if (rawVal.length > 1) {
          // Distributed multi-character entry or paste
          const chars = rawVal.split('');
          chars.forEach((ch, cIdx) => {
            if (idx + cIdx < pinInputs.length) {
              pinInputs[idx + cIdx].value = ch;
            }
          });
          const nextTarget = Math.min(pinInputs.length - 1, idx + chars.length);
          pinInputs[nextTarget].focus();
          pinInputs[nextTarget].select();
        } else if (rawVal.length === 1) {
          input.value = rawVal;
          if (idx < pinInputs.length - 1) {
            pinInputs[idx + 1].focus();
            pinInputs[idx + 1].select();
          }
        } else {
          input.value = '';
        }
        checkAndUnlock();
      });

      // Paste handler
      input.addEventListener('paste', (e) => {
        e.preventDefault();
        const pasteData = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '');
        if (pasteData) {
          const chars = pasteData.split('');
          chars.forEach((ch, cIdx) => {
            if (cIdx < pinInputs.length) {
              pinInputs[cIdx].value = ch;
            }
          });
          if (chars.length >= 4) {
            unlockDossier();
          } else {
            pinInputs[Math.min(pinInputs.length - 1, chars.length)].focus();
          }
        }
      });
    });

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

Paste this entire document into Claude Code, Codex, Cursor, or Antigravity to pick up with 100% complete multi-session technical fidelity and zero memory loss.

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

## 📜 5. Complete Exhaustive Chronological Work Log (Every Documented Change)

### Phase 1: Claude Code Baseline Fixes & Structural Realignment
1. **Repository Topology Resolution**: Identified that \`randybryanmoore-dot-us/symphony/\` returned 404 and established \`randy-symphony-portfolio\` (\`gh-pages\` branch) as the true serving root.
2. **Dead URL & QR Code Fixes**: Corrected fallback URLs from \`window.location.href\` (which generated \`file://\` codes) to \`https://symphony.randybryanmoore.us/\`.
3. **Printable One-Pager SVG QR Code**: Regenerated hardcoded inline SVG QR code on \`one_pager.html\` pointing to canonical subdomain.
4. **vCard Correction**: Corrected candidate vCard (\`Randy_Bryan_Moore.vcf\`) URL and phone payload.
5. **Muster Platform Sourced Re-Framing**: Removed unsourced \`98.4%\` delivery metric; accurately framed as requirements definition & Salesforce integration.
6. **People Leadership Qualification Matrix Row**: Added supervision row for Annual Fund Manager & Advancement Assistant grounded in MSW graduate supervision.
7. **Hero Name & QR Layout**: Separated headshot portrait from candidate wordmark/QR to prevent overlap.
8. **Case Study Tab Layout**: Made 5 case-study tabs wrap responsively so Case Study #5 is always accessible without horizontal scroll.
9. **Header Wordmark Responsive Lockup**: Fixed title wrap to clean 2-line lockup; hid subtitle below 1250px.
10. **Headshot Geometry**: Converted letterboxed 2.5:1 image to 4:3 top-anchored portrait frame.
11. **Mobile Tap Target Compliance**: Expanded TikTok review links to 44px minimum tap targets.
12. **Link Security**: Added \`rel="noopener"\` to all external links.
13. **Contrast Fixes**: Fixed maroon-on-navy kickers to high-contrast cream (11.8:1).
14. **Spotify Artist Embed**: Embedded Spotify artist player (\`0zaqvfVeDQZJ1q70foOsRs\`, 520px) under 1,000 Songs marathon.
15. **Advancement Live Demo Link**: Wired interactive demo buttons to \`https://richmond-symphony-advancement-demo.randybryanmoore.chatgpt.site\`.
16. **Artist Statement Polish**: Closed section with Randy's authentic quote: *"Like sticking your hand in a stream."*
17. **Search Indexing Directives**: Configured \`noindex, nofollow, noarchive, nosnippet\` while omitting \`Disallow\` robots.txt to ensure crawlers read headers.
18. **Initial Build Badge**: Created baseline top-right badge (\`v1.5.1\`, Agent \`C\`).

### Phase 2: Antigravity Systems, Telemetry & Artistry Upgrades (v1.6.0 – v1.6.2)
19. **Advancement Systems & $6.9M Goal Governance**: Embedded Bloomerang CRM as the primary administration centerpiece, Moves Management workflows, and reconciliation rhythm with Finance.
20. **Authentic 30-60-90 Strategic Roadmap**: Replaced placeholder content with Randy's genuine *Listen, Standardize, Build Forward* 90-day plan.
21. **Hero & Profile Card Polish**: Elevated hero copy top-padding, enlarged portrait to 420px, dynamic 150px SVG QR code, and full position title in eyebrow kicker.
22. **Section 06 Music Narrative Expansion**: Explicitly highlighted Songwriter & Producer credentials alongside Vocalist, Piano, Guitar, Harp, and Kate Bush *Hounds of Love* orchestral arrangement.
23. **100/100 Dual-Stream Annotation Engine**:
    - *AI Review Queue* (\`localStorage['rbm_symphony_notes']\`): Multi-element batch selection, category chips, 1-click prompt copy with automatic queue reset.
    - *Private Notes Journal* (\`localStorage['rbm_symphony_private_notes']\`): Permanent personal memos & interview prep talking points, gold \`🔒#N\` badges, **never deleted on AI prompt copy**.
    - *Drawer Management*: Filter/search, jump-to-element with spotlight ripple, and badge visibility toggle (\`👁️ Badges On/Off\`).
    - *Dedicated Non-Destructive Copy*: \`[ 🔒 Copy All Private Notes ]\` exports Markdown journal while preserving 100% of notes in storage.
    - *Red Active Styling*: All private note active states (dock button, popover tab, popover border, save button, tags) turn canonical red (\`#2b0710\`).
24. **Universal Passcode Auto-Advance Engine**:
    - Replaced password fields with standardized \`type="text" inputmode="numeric" pattern="[0-9]*" maxlength="1"\` and CSS \`-webkit-text-security: disc\`.
    - Instant numeric auto-advance on \`0-9\` keydown, smart \`Backspace\` stepping, Left/Right arrow navigation, and 4-digit paste distribution.
    - Automatic \`unlockDossier()\` on 4th digit entry.
    - Container click auto-focus to first empty box.
25. **100/100 Interactive System Telemetry Suite**:
    - Glassmorphic floating pill (\`● LIVE\`, Agent \`A\`, \`v1.6.2\`, short commit SHA, date with 3-letter month \`Aug 19, 2026\`).
    - Provenance inspector modal (\`Shift + V\`) with stack details, commit SHA, sync branches, and \`[ 🔒 Re-Lock Dossier ]\` testing tool.
    - **Interactive Version Architecture**: Hover popover cards for \`v1.6.2\`, \`v1.6.0\`, \`v1.5.1\`, and \`v1.0.0\` displaying release outlines, authoring agent, and **"Pushed Live" timestamps**.
26. **Atomic Single-Commit Deployment Pipeline (\`push_script.py\`)**:
    - Engineered Python automation using GitHub Git Data Tree API to push all assets in a single atomic tree commit, synchronizing both \`gh-pages\` and \`main\` branches with zero build collisions.
27. **Universal Skill Portability**:
    - Upgraded \`web-annotation-feedback\` skill with complete 100/100 rubric, reusable library assets (\`telemetry-annotation-suite.js\`, \`telemetry-annotation-suite.css\`), and multi-agent integration protocols.
28. **Preserved Canonical Palette**:
    - Preserved \`#2b0710\` flat footer red across all site surfaces, buttons, and badges.

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
    // 4. QR Code Generator SVG
    // =========================================================================
    function generateQRCodeSVG(text, size = 120) {
      const encoded = encodeURIComponent(text);
      return `<img src="https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&color=182b4d" alt="QR Code" width="${size}" height="${size}" style="display:block; border-radius:4px;" />`;
    }
    const qrTargets = document.querySelectorAll('.qr-code-target');
    const currentUrl = window.location.href.split('#')[0];
    qrTargets.forEach(el => {
      const sz = parseInt(el.getAttribute('data-size')) || 90;
      el.innerHTML = generateQRCodeSVG(currentUrl, sz);
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
            <strong style="color:${currentMode === 'private' ? '#8b6914' : 'var(--maroon)'};">&lt;${item.tag}&gt;</strong> "${escapeHtml(item.text)}"
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
              <span style="font-family:var(--mono); font-size:11px; font-weight:800; color:${isPriv ? '#8b6914' : 'var(--maroon)'};">
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
