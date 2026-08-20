// =========================================================================
// Richmond Symphony Advancement Systems & Operations Portfolio Suite
// Candidate: Randy Bryan Moore, MSW
// Complete Integrated Interactive Engine, Dual-Stream Annotation & Telemetry
// =========================================================================

(function() {
  function initSuite() {
    let pinActive = false;
    let editActive = false;

    // =========================================================================
    // 1. Passcode Gate (Universal PIN: 0000 / 1-Click Unlock)
    // =========================================================================
    const gateOverlay = document.getElementById('passcode-gate');
    const pinInputs = document.querySelectorAll('.pin-digit');
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

    try {
      if (sessionStorage.getItem('symphony_dossier_auth') === 'true' || 
          sessionStorage.getItem('rbm_sym_unlocked') === '1' ||
          localStorage.getItem('symphony_dossier_auth') === 'true') {
        unlockDossier();
      }
    } catch (e) {}

    if (gateUnlockBtn) {
      gateUnlockBtn.addEventListener('click', (e) => {
        e.preventDefault();
        pinInputs.forEach(i => i.value = '0');
        unlockDossier();
      });
    }

    pinInputs.forEach((input, idx) => {
      input.addEventListener('input', (e) => {
        if (e.target.value.length >= 1 && idx < pinInputs.length - 1) {
          pinInputs[idx + 1].focus();
        }
        const entered = Array.from(pinInputs).map(i => i.value).join('');
        if (entered === '0000' || entered.length === 4) {
          unlockDossier();
        }
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !e.target.value && idx > 0) {
          pinInputs[idx - 1].focus();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          unlockDossier();
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

    document.addEventListener('click', (e) => {
      if (provModal && provModal.classList.contains('open') && !e.target.closest('#build-provenance-modal') && !e.target.closest('#build-badge')) {
        provModal.classList.remove('open');
      }
    });

    if (copyHandoffBtn) {
      copyHandoffBtn.addEventListener('click', () => {
        const handoffText = `# Master Agent Handoff Context — Richmond Symphony Dossier

Paste this into Claude Code, Codex, or Antigravity to pick up with 100% complete multi-session memory and architectural fidelity.

---

## 🎯 Project Overview & Role Target
- **Candidate**: Randy Bryan Moore, MSW
- **Target Position**: Assistant Director, Advancement Systems & Operations
- **Organization**: Richmond Symphony (Richmond, Virginia)
- **Artifact Purpose**: Confidential executive candidate portfolio and operational dossier evaluated by the hiring selection committee. Accuracy of claims and strict alignment with the job description matter above all else.
- **Universal Selection Committee PIN**: \`0000\`

---

## 🌐 Live URL & Repository Architecture
- **Canonical Live URL**: https://symphony.randybryanmoore.us (via custom domain)
- **GitHub Pages Host**: https://randybryanmoore.github.io/randy-symphony-portfolio/
- **Primary Development Repo**: \`randybryanmoore/randybryanmoore-dot-us\` (Branch: \`main\`, working copy in \`symphony/\`)
- **Public Serving Repo**: \`randybryanmoore/randy-symphony-portfolio\` (Branches: \`gh-pages\` and \`main\`, served from root)
- **Deployment Pipeline**: Single atomic commit via GitHub Git Data Tree API (\`python3 push_script.py\`). Both \`gh-pages\` and \`main\` in the portfolio repo are synchronized atomically on every build.

---

## 🎨 Strict Brand Color Hierarchy & Rules
*Do not alter these tokens without explicit instructions from Randy.*
- **DOMINANT BLUE (3-Layer Depth)**:
  - \`--blue-l1\`: \`#0d1a32\` (Page and section ground — furthest back, dominant blue)
  - \`--blue-l2\`: \`#182b4d\` (Mid-layer panels, cards, and containers)
  - \`--blue-l3\`: \`#243d6b\` (Top-layer insets, active tabs, and highlighted controls)
- **FLAT FOOTER RED (Strict Single Palette)**:
  - \`--red-1\`, \`--maroon\`, \`--maroon-deep\`: \`#2b0710\` (Canonical deep red — the only red across the site).
  - *Rule*: Never place unbordered text directly on red without a high-contrast cream rule or tag chip (\`#f2eadf\`).
- **CREAM & PAPER ACCENTS**:
  - \`--cream\`: \`#f2eadf\`
  - \`--paper\`: \`#fbf6ed\`
  - \`--gold-light\`: \`#dfca74\` (Telemetry SHA and Private Note highlights)

---

## 📚 Sourced Claims & Verified Facts (Do NOT Alter or Hallucinate)
1. **Bloomerang CRM**: Primary administration, Moves Management workflows, and gift processing reconciliation with Finance to govern the **$6.9M** contributed-income goal.
2. **EveryAction**: 50+ General Assembly legislative meetings for Save the Children Action Network.
3. **Muster Platform**: Requirements definition and Salesforce integration design for Active Minds across Congressional targets (no unsourced deliverability percentages).
4. **People Leadership**: Supervised graduate MSW interns at Virginia Housing Alliance and trained 40 partner organizations at Virginia Civic Engagement Table (aligns with JD requirement to supervise Annual Fund Manager and Advancement Assistant).
5. **Musical Artistry (Section 06)**:
   - Songwriter, producer, multi-instrumentalist (vocalist, piano, guitar, and harp).
   - Composed full orchestral arrangements for production cover of Kate Bush's *Hounds of Love*.
   - 4-year contract pianist with regular resident lobby performances at Richmond's historic Jefferson Hotel (2022–Present).
   - Instructor at School of Rock and creator of the 1,000 Songs songwriting marathon.

---

## 📜 Comprehensive Chronological Work Log Across All Sessions

### Phase 1: Claude Code Baseline Fixes & Structural Alignment
- Fixed QR code fallback URLs to point to \`https://symphony.randybryanmoore.us/\`.
- Corrected Muster CRM claims to reflect source-grounded Salesforce integration facts.
- Added People Leadership row to the Alignment Matrix.
- Established the strict 3-step blue elevation and \`#2b0710\` red palette.
- Embedded Spotify artist player (\`0zaqvfVeDQZJ1q70foOsRs\`) and TikTok review links (44px tap targets).
- Configured \`data-review-tools="on"\` toggle and initial \`v1.5.1\` build badge.

### Phase 2: Antigravity Systems & Interactive Enhancements (v1.6.0 – v1.6.2)
- **Hero & Profile Card**: Elevated hero copy padding, enlarged candidate headshot to 420px, dynamic 150px mobile QR code, and full position title in top eyebrow kicker.
- **Section 06 Music Bio**: Enriched narrative highlighting Songwriter, Producer, Vocalist, Piano, Guitar, Harp, and Kate Bush *Hounds of Love* orchestral arrangement with dedicated brand badges.
- **100/100 Dual-Stream Annotation Suite**:
  - *AI Review Queue* (\`localStorage['rbm_symphony_notes']\`): Multi-element batch selection, category chips, 1-click Antigravity prompt copy + auto-reset.
  - *Private Notes Journal* (\`localStorage['rbm_symphony_private_notes']\`): Permanent personal memos & interview prep talking points, gold \`🔒#N\` badges, never deleted on AI prompt copy, separate Markdown export.
  - *Drawer Suite*: Tabs (\`AI Queue\`, \`Private Notes\`, \`All\`), search filter, smooth-scroll spotlight ripple jump, and badge visibility toggle.
- **100/100 Telemetry & Version Watermark**: Glassmorphic badge (\`● LIVE\`, version, commit SHA, build date), provenance modal, version breakdown explanation, and 1-click master handoff context generator (\`Shift + V\`).
- **Atomic Single-Commit Deployment Pipeline**: Engineered \`push_script.py\` using GitHub Git Data Tree API to push all assets in a single atomic tree commit, eliminating build collisions on GitHub Pages.
- **Restored Canonical Palette**: Preserved \`#2b0710\` flat footer red across all site surfaces.

---

## 🛠️ Instructions for Successor Agent
1. **Pre-Edit Transparency**: Always explain intended changes in 3-7 bullets before modifying code.
2. **Build & Deploy Flow**: Run \`python3 /Users/randybryanmoore/.gemini/antigravity/brain/08fa8fc4-477a-43de-96bc-e65050585686/scratch/build_script.py\` followed by \`git push origin main\` and \`python3 /Users/randybryanmoore/GITHUB/randybryanmoore-dot-us/symphony/push_script.py\`.
3. **Never touch unrelated files** or modify the core color tokens without explicit user approval.`;

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
    let currentMode = 'ai';    // 'ai' (review queue) or 'private' (personal journal)
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
    } catch (e) {
      aiNotesList = [];
    }

    try {
      const savedPriv = localStorage.getItem('rbm_symphony_private_notes');
      if (savedPriv) privateNotesList = JSON.parse(savedPriv);
    } catch (e) {
      privateNotesList = [];
    }

    const pinToggle = document.getElementById('dock-pin-mode-btn');
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

    const aiTags = ['Copy', 'Design', 'Data', 'Layout', 'Logic', 'Action Item'];
    const privateTags = ['Memo', 'Idea', 'Talking Point', 'Research', 'Follow-Up', 'Question'];

    function escapeHtml(str) {
      return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function renderTags() {
      if (!popoverTagsContainer) return;
      const tags = (currentMode === 'ai') ? aiTags : privateTags;
      if (!tags.includes(selectedCategory)) {
        selectedCategory = tags[0];
      }
      popoverTagsContainer.innerHTML = tags.map(tag => `
        <span class="tag-chip ${selectedCategory === tag ? 'selected' : ''}" data-tag="${tag}">${tag}</span>
      `).join('');

      popoverTagsContainer.querySelectorAll('.tag-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          popoverTagsContainer.querySelectorAll('.tag-chip').forEach(c => c.classList.remove('selected'));
          chip.classList.add('selected');
          selectedCategory = chip.getAttribute('data-tag') || (currentMode === 'ai' ? 'Copy' : 'Memo');
        });
      });
    }

    // Switch Popover Mode
    popoverModeTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const mode = tab.getAttribute('data-mode');
        setPopoverMode(mode);
      });
    });

    function setPopoverMode(mode) {
      currentMode = mode;
      popoverModeTabs.forEach(t => {
        if (t.getAttribute('data-mode') === mode) t.classList.add('active');
        else t.classList.remove('active');
      });

      if (mode === 'private') {
        popover.classList.add('popover--private');
        if (popoverSave) popoverSave.innerText = 'Save Private Note ↵';
      } else {
        popover.classList.remove('popover--private');
        if (popoverSave) popoverSave.innerText = 'Pin for AI ↵';
      }
      renderTags();
      renderSelectedElementsSnippet();
    }

    function renderSelectedElementsSnippet() {
      if (!popoverText) return;
      if (selectedElements.length === 0) {
        popoverText.innerHTML = '<span style="color:var(--muted); font-style:italic;">No elements selected</span>';
        if (popoverTitle) popoverTitle.innerText = currentMode === 'private' ? '🔒 Private Note' : 'Comment on Element';
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

    // Toggle Pin Mode
    if (pinToggle) {
      pinToggle.addEventListener('click', () => {
        pinActive = !pinActive;
        if (pinActive) {
          if (editActive) {
            editActive = false;
            if (editToggle) editToggle.classList.remove('active');
            toggleEditableElements(false);
          }
          pinToggle.classList.add('active');
          document.body.classList.add('annotation-active');
        } else {
          pinToggle.classList.remove('active');
          document.body.classList.remove('annotation-active');
          if (inspectorBox) inspectorBox.style.display = 'none';
          closePopover();
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
            if (pinToggle) pinToggle.classList.remove('active');
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

      if (footerAiActions && footerPrivateActions) {
        if (tabName === 'private') {
          footerAiActions.style.display = 'none';
          footerPrivateActions.style.display = 'flex';
        } else {
          footerAiActions.style.display = 'flex';
          footerPrivateActions.style.display = 'none';
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

        const tag = target.tagName.toLowerCase();
        const snippet = target.innerText ? target.innerText.trim().substring(0, 24) : '';
        if (inspectorBadge) {
          inspectorBadge.innerText = `<${tag}> ${snippet ? `"${snippet}..."` : ''}`;
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

      renderSelectedElementsSnippet();

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
      if (!comment || selectedElements.length === 0) return;

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
          if (pinToggle) pinToggle.classList.remove('active');
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
          ? 'No private notes yet. Turn on "Pin Feedback", select "🔒 Private Note", and pin thoughts for your own records.'
          : (activeDrawerTab === 'ai' 
              ? 'No AI review notes queued. Turn on "Pin Feedback", select "🚀 AI Review", and pin changes to send to Antigravity/Claude.'
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
          alert('No AI review notes queued! Click "Pin Feedback" to add critique.');
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

    // Export Private Notes as Markdown Journal (Never Deletes)
    if (exportPrivateBtn) {
      exportPrivateBtn.addEventListener('click', () => {
        if (privateNotesList.length === 0) {
          alert('No private notes recorded yet.');
          return;
        }
        let doc = "# 🔒 Richmond Symphony Portfolio — Personal Notes & Working Memos\n";
        doc += `*Exported on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}*\n\n---\n\n`;
        privateNotesList.forEach(n => {
          doc += `### [🔒#${n.id}] [${n.category}] on <${n.tag}> "${n.targetText}"\n`;
          doc += `- **Note**: ${n.comment}\n`;
          doc += `- *Created*: ${n.createdAt}\n\n`;
        });

        navigator.clipboard.writeText(doc).then(() => {
          exportPrivateBtn.innerText = 'Copied Markdown Journal! ✓';
          setTimeout(() => { exportPrivateBtn.innerText = 'Export Markdown Journal'; }, 2400);
        });
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
