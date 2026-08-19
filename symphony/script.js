window.copyAllNotesAndReset = function(e) {
  if (typeof window.reviewToolsEnabled === 'function' && !window.reviewToolsEnabled()) return;
  if (e && e.stopPropagation) { e.preventDefault(); e.stopPropagation(); }
  if (typeof window.executeCopyAndReset === 'function') {
    window.executeCopyAndReset();
  }
};

// =========================================================================
// Richmond Symphony Advancement Systems & Operations Portfolio Suite
// Candidate: Randy Bryan Moore, MSW
// Complete Integrated Interactive Engine & Pinpoint Annotation Suite
// =========================================================================

// Global Feedback Drawer Controllers (Available Immediately at Line 1)
window.openFeedbackDrawer = function(e) {
  if (typeof window.reviewToolsEnabled === 'function' && !window.reviewToolsEnabled()) return;
  if (e && e.stopPropagation) { e.preventDefault(); e.stopPropagation(); }
  const drawer = document.getElementById('feedback-drawer');
  if (drawer) {
    drawer.classList.add('open');
    drawer.style.display = 'flex';
    drawer.style.zIndex = '2147483647';
    if (typeof window.refreshFeedbackDrawerUI === 'function') {
      window.refreshFeedbackDrawerUI();
    }
  }
};

window.closeFeedbackDrawer = function(e) {
  if (typeof window.reviewToolsEnabled === 'function' && !window.reviewToolsEnabled()) return;
  if (e && e.stopPropagation) { e.preventDefault(); e.stopPropagation(); }
  const drawer = document.getElementById('feedback-drawer');
  if (drawer) {
    drawer.classList.remove('open');
    drawer.style.display = 'none';
  }
};

window.toggleFeedbackDrawer = function(e) {
  if (typeof window.reviewToolsEnabled === 'function' && !window.reviewToolsEnabled()) return;
  if (e && e.stopPropagation) { e.preventDefault(); e.stopPropagation(); }
  const drawer = document.getElementById('feedback-drawer');
  if (drawer) {
    if (drawer.style.display === 'flex' || drawer.classList.contains('open')) {
      window.closeFeedbackDrawer(e);
    } else {
      window.openFeedbackDrawer(e);
    }
  }
};

// =========================================================================
// Review Tools Switch (annotation / feedback dock)
// -------------------------------------------------------------------------
// The pin-feedback dock, live-edit mode, inspector and notes drawer are
// INTERNAL review tools. To go live, set this on the body tag in index.html:
//
//     <body data-review-tools="off">
//
// That strips the dock, popover, drawer and inspector from the DOM and skips
// all of their event listeners and localStorage use. Per-visit override:
// append ?review=1 to force them on, or ?review=0 to force them off.
// =========================================================================
function reviewToolsEnabled() {
  try {
    var param = new URLSearchParams(window.location.search).get('review');
    if (param === '1' || param === 'on' || param === 'true') return true;
    if (param === '0' || param === 'off' || param === 'false') return false;
    var host = document.body || document.documentElement;
    var attr = (host.getAttribute('data-review-tools') || 'on').toLowerCase();
    return attr !== 'off' && attr !== 'false' && attr !== '0';
  } catch (err) {
    return false;
  }
}
window.reviewToolsEnabled = reviewToolsEnabled;

(function() {
  function initSuite() {
    // =========================================================================
    // 1. Passcode Gate (Universal PIN: 0000 / 1-Click Unlock)
    // =========================================================================
    try {
      const gateOverlay = document.getElementById('passcode-gate');
      const pinInputs = document.querySelectorAll('.pin-digit');
      const gateUnlockBtn = document.getElementById('gate-unlock-btn');

      function unlockDossier() {
        if (gateOverlay) {
          gateOverlay.classList.add('unlocked');
          gateOverlay.style.opacity = '0';
          gateOverlay.style.visibility = 'hidden';
          gateOverlay.style.pointerEvents = 'none';
          setTimeout(() => { gateOverlay.style.display = 'none'; }, 350);
        }
        try {
          sessionStorage.setItem('symphony_dossier_auth', 'true');
          sessionStorage.setItem('rbm_sym_unlocked', '1');
          localStorage.setItem('symphony_dossier_auth', 'true');
        } catch (e) {}
      }

      if (sessionStorage.getItem('symphony_dossier_auth') === 'true' || 
          sessionStorage.getItem('rbm_sym_unlocked') === '1' ||
          localStorage.getItem('symphony_dossier_auth') === 'true') {
        unlockDossier();
      }

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
    } catch (err) {
      console.warn('Gate init error:', err);
    }

    // =========================================================================
    // 2. Scroll Progress Bar
    // =========================================================================
    try {
      const progressBar = document.getElementById('scroll-progress');
      if (progressBar) {
        window.addEventListener('scroll', () => {
          const total = document.documentElement.scrollHeight - window.innerHeight;
          if (total > 0) {
            progressBar.style.width = (window.scrollY / total * 100) + '%';
          }
        }, { passive: true });
      }
    } catch (err) {
      console.warn('Progress init error:', err);
    }

    // =========================================================================
    // 3. QR Code Generator SVG
    // =========================================================================
    try {
      function generateQRCodeSVG(text, size = 130) {
        const encoded = encodeURIComponent(text);
        return `<img src="https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&color=182b4d" alt="QR Code" width="${size}" height="${size}" style="display:block; border-radius:4px;" />`;
      }
      const qrTargets = document.querySelectorAll('.qr-code-target');
      // The QR is scanned from a phone, so it must never encode a file:// or
      // localhost URL -- those are unreachable off this machine. Only trust
      // location.href when the page is actually served from a public host.
      const CANONICAL_URL = 'https://randybryanmoore.us/symphony/';
      const loc = window.location;
      const isPubliclyServed = (loc.protocol === 'http:' || loc.protocol === 'https:') &&
        !/^(localhost|127\.0\.0\.1|\[::1\]|0\.0\.0\.0)$/.test(loc.hostname);
      const currentUrl = isPubliclyServed ? loc.href.split('#')[0] : CANONICAL_URL;
      qrTargets.forEach(el => {
        const sz = parseInt(el.getAttribute('data-size')) || 130;
        el.innerHTML = generateQRCodeSVG(currentUrl, sz);
      });
    } catch (err) {
      console.warn('QR init error:', err);
    }

    // =========================================================================
    // 4. Case Studies Interactive Tab Switcher
    // =========================================================================
    try {
      const tabBtns = document.querySelectorAll('.tab-btn');
      const tabPanes = document.querySelectorAll('.tab-pane');

      tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
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
    } catch (err) {
      console.warn('Tabs init error:', err);
    }

    // =========================================================================
    // 5. Repertoire Synthesis Engine & Live Canvas Waveform
    // =========================================================================
    try {
      const playBtn = document.getElementById('play-trigger-btn');
      const trackOptions = document.querySelectorAll('.track-option');
      const canvas = document.getElementById('waveform-canvas');
      let audioCtx = null;
      let isPlaying = false;
      let synthTimer = null;
      let selectedTrack = 'jefferson';

      const notes = {
        'C3': 130.81, 'E3': 164.81, 'G3': 196.00, 'B3': 246.94,
        'C4': 261.63, 'D4': 293.66, 'Eb4': 311.13, 'E4': 329.63,
        'F4': 349.23, 'G4': 392.00, 'Ab4': 415.30, 'A4': 440.00,
        'Bb4': 466.16, 'B4': 493.88, 'C5': 523.25, 'D5': 587.33,
        'Eb5': 622.25, 'E5': 659.25, 'G5': 783.99
      };

      const trackSequences = {
        jefferson: [
          ['C3', 'G3', 'C4', 'E4'],
          ['A3', 'E4', 'A4', 'C5'],
          ['F3', 'C4', 'F4', 'A4'],
          ['G3', 'D4', 'G4', 'B4']
        ],
        debussy: [
          ['Eb4', 'G4', 'Bb4', 'Eb5'],
          ['Ab4', 'C5', 'Eb5', 'G5'],
          ['F4', 'Ab4', 'C5', 'Eb5'],
          ['Bb3', 'F4', 'Bb4', 'D5']
        ],
        chopin: [
          ['C4', 'Eb4', 'G4', 'C5'],
          ['Ab3', 'Eb4', 'Ab4', 'C5'],
          ['F3', 'C4', 'F4', 'Ab4'],
          ['G3', 'D4', 'G4', 'B4']
        ]
      };

      trackOptions.forEach(opt => {
        opt.addEventListener('click', () => {
          trackOptions.forEach(o => o.classList.remove('active'));
          opt.classList.add('active');
          selectedTrack = opt.getAttribute('data-track') || 'jefferson';
        });
      });

      function playChord(chord) {
        if (!audioCtx) return;
        chord.forEach(n => {
          if (!notes[n]) return;
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(notes[n], audioCtx.currentTime);

          gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.12, audioCtx.currentTime + 0.08);
          gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.8);

          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + 1.8);
        });
      }

      function drawWaveform() {
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        let phase = 0;

        function render() {
          if (!isPlaying) {
            ctx.clearRect(0, 0, w, h);
            ctx.strokeStyle = 'rgba(242, 234, 223, 0.4)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(0, h / 2);
            ctx.lineTo(w, h / 2);
            ctx.stroke();
            return;
          }

          ctx.clearRect(0, 0, w, h);
          ctx.strokeStyle = '#F2EADF';
          ctx.lineWidth = 2;
          ctx.beginPath();
          phase += 0.08;

          for (let x = 0; x < w; x++) {
            const y = (h / 2) + Math.sin(x * 0.05 + phase) * 14 * Math.sin(phase * 0.4);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
          requestAnimationFrame(render);
        }
        render();
      }

      if (playBtn) {
        playBtn.addEventListener('click', () => {
          if (!isPlaying) {
            if (!audioCtx) {
              audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (audioCtx.state === 'suspended') {
              audioCtx.resume();
            }
            isPlaying = true;
            playBtn.innerText = 'Pause';
            playBtn.classList.add('playing');
            drawWaveform();

            const seq = trackSequences[selectedTrack] || trackSequences.jefferson;
            let step = 0;
            playChord(seq[step]);
            synthTimer = setInterval(() => {
              step = (step + 1) % seq.length;
              playChord(seq[step]);
            }, 1400);
          } else {
            isPlaying = false;
            playBtn.innerText = 'Play';
            playBtn.classList.remove('playing');
            if (synthTimer) clearInterval(synthTimer);
            drawWaveform();
          }
        });
      }
      drawWaveform();
    } catch (err) {
      console.warn('Audio init error:', err);
    }

    // =========================================================================
    // 6. Pinpoint Annotation & Feedback Suite  (internal review tooling)
    // =========================================================================
    try {
      if (!reviewToolsEnabled()) {
        // Remove the review UI outright so nothing ships to the live page.
        ['annotation-dock', 'annotation-popover', 'feedback-drawer',
         'inspector-box', 'build-badge'].forEach(function(id) {
          const node = document.getElementById(id);
          if (node) node.remove();
        });
        document.body.classList.remove('annotation-active');
        document.querySelectorAll('.annotation-pin-marker, [data-annotation-id]')
          .forEach(function(node) { node.remove(); });
        return;
      }

      let pinActive = false;
      let editActive = false;
      let pendingEl = null;
      let pendingTag = '';
      let pendingText = '';
      let selectedCategory = 'Copy';
      let notesList = [];

      try {
        const saved = localStorage.getItem('rbm_symphony_notes');
        if (saved) notesList = JSON.parse(saved);
      } catch (e) {
        notesList = [];
      }

      const pinToggle = document.getElementById('dock-pin-mode-btn');
      const editToggle = document.getElementById('dock-live-edit-btn');
      const drawerToggle = document.getElementById('dock-view-drawer-btn');
      const dockCount = document.getElementById('dock-notes-count');

      const inspectorBox = document.getElementById('inspector-box');
      const inspectorBadge = document.getElementById('inspector-badge');

      const popover = document.getElementById('annotation-popover');
      const popoverText = document.getElementById('popover-target-text');
      const popoverInput = document.getElementById('popover-comment-input');
      const popoverSave = document.getElementById('popover-save-btn');
      const popoverDismiss = document.getElementById('popover-dismiss-btn');
      const popoverClose = document.getElementById('popover-close-btn');
      const tagChips = document.querySelectorAll('.annotation-popover .tag-chip');

      const drawer = document.getElementById('feedback-drawer');
      const drawerClose = document.getElementById('drawer-close-btn');
      const drawerCount = document.getElementById('drawer-count');
      const drawerList = document.getElementById('drawer-items-list');
      const copyAiBtn = document.getElementById('drawer-copy-ai-btn');

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
        const candidates = document.querySelectorAll('h1, h2, h3, h4, p, li, strong, blockquote, .stat-num, .stat-label, .wordmark-title');
        candidates.forEach(el => {
          if (!el.closest('#annotation-dock') && !el.closest('#annotation-popover') && !el.closest('#feedback-drawer') && !el.closest('#passcode-gate')) {
            el.contentEditable = enable ? 'true' : 'false';
            el.style.outline = enable ? '1.5px dashed rgba(76, 14, 28, 0.4)' : '';
            el.style.outlineOffset = enable ? '2px' : '';
          }
        });
      }

      // Tag Selection
      tagChips.forEach(chip => {
        chip.addEventListener('click', () => {
          tagChips.forEach(c => c.classList.remove('selected'));
          chip.classList.add('selected');
          selectedCategory = chip.getAttribute('data-tag') || 'Copy';
        });
      });

      // Inspector Hover Box Tracking
      document.addEventListener('mousemove', (e) => {
        if (!pinActive || editActive) {
          if (inspectorBox) inspectorBox.style.display = 'none';
          return;
        }

        const target = document.elementFromPoint(e.clientX, e.clientY);
        if (!target || target.closest('#annotation-dock') || target.closest('#annotation-popover') || target.closest('#feedback-drawer') || target.closest('#inspector-box') || target.closest('#passcode-gate') || target.closest('.annotation-element-badge')) {
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

      // Click to Target and Open Popover
      document.addEventListener('click', (e) => {
        if (!pinActive || editActive) return;
        if (e.target.closest('#annotation-dock') || e.target.closest('#annotation-popover') || e.target.closest('#feedback-drawer') || e.target.closest('.annotation-element-badge') || e.target.closest('#passcode-gate')) return;

        e.preventDefault();
        e.stopPropagation();

        pendingEl = e.target;
        const text = pendingEl.innerText ? pendingEl.innerText.trim() : (pendingEl.getAttribute('alt') || pendingEl.getAttribute('title') || '');
        pendingTag = pendingEl.tagName.toLowerCase();
        pendingText = text.length > 75 ? text.substring(0, 72) + '...' : (text || `<${pendingTag}> element`);

        if (popoverText) {
          popoverText.innerHTML = `<strong>&lt;${pendingTag}&gt;</strong> "${pendingText}"`;
        }
        if (popoverInput) {
          popoverInput.value = '';
        }

        const rect = pendingEl.getBoundingClientRect();
        if (popover) {
          const popoverWidth = 330;
          const popoverHeight = 240;
          let topPos = rect.bottom + 8;
          let leftPos = Math.max(16, Math.min(window.innerWidth - popoverWidth - 16, rect.left));

          if (topPos + popoverHeight > window.innerHeight) {
            topPos = Math.max(16, rect.top - popoverHeight - 8);
          }

          popover.style.top = topPos + 'px';
          popover.style.left = leftPos + 'px';
          popover.style.display = 'block';

          setTimeout(() => { if (popoverInput) popoverInput.focus(); }, 50);
        }
      });

      // Save Annotation Note
      function saveNote() {
        const comment = popoverInput ? popoverInput.value.trim() : '';
        if (!comment) return;

        const num = notesList.length + 1;
        const noteId = 'note-' + Date.now();

        if (pendingEl) {
          pendingEl.classList.add('annotation-target-active');
          pendingEl.setAttribute('data-annotation-id', noteId);

          const badge = document.createElement('span');
          badge.className = 'annotation-element-badge';
          badge.innerText = num;
          badge.title = `[${selectedCategory}] ${comment}`;
          badge.setAttribute('data-badge-id', noteId);
          badge.addEventListener('click', (ev) => {
            ev.stopPropagation();
            window.openFeedbackDrawer();
          });
          pendingEl.appendChild(badge);
        }

        const newNote = {
          id: num,
          noteId: noteId,
          tag: pendingTag,
          category: selectedCategory,
          targetText: pendingText,
          comment: comment,
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        notesList.push(newNote);
        try {
          localStorage.setItem('rbm_symphony_notes', JSON.stringify(notesList));
        } catch (e) {}

        closePopover();
        updateDrawer();
      }

      function closePopover() {
        if (popover) popover.style.display = 'none';
        pendingEl = null;
      }

      if (popoverSave) popoverSave.addEventListener('click', saveNote);
      if (popoverDismiss) popoverDismiss.addEventListener('click', closePopover);
      if (popoverClose) popoverClose.addEventListener('click', closePopover);

      // Keyboard Shortcuts
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          if (popover && popover.style.display === 'block') closePopover();
          if (drawer && (drawer.style.display === 'flex' || drawer.classList.contains('open'))) window.closeFeedbackDrawer();
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
        if (dockCount) dockCount.innerText = notesList.length;
        if (drawerCount) drawerCount.innerText = notesList.length;

        if (!drawerList) return;
        if (notesList.length === 0) {
          drawerList.innerHTML = '<p style="color:var(--muted);font-size:13px;font-style:italic;">No feedback pinned yet. Turn on "Pin Feedback" and click any headline, paragraph, card, or button.</p>';
          return;
        }

        drawerList.innerHTML = notesList.map(n => `
          <div class="drawer-item" id="drawer-item-${n.noteId}" style="margin-bottom:12px; padding:12px; border:1px solid var(--line); border-radius:6px; background:var(--paper); color:var(--ink);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <span style="font-family:var(--mono); font-size:11px; font-weight:800; color:var(--maroon);">#${n.id} · ${n.category} (${n.createdAt})</span>
              <div style="display:flex; gap:6px;">
                <button onclick="window.jumpToAnnotatedElement('${n.noteId}')" style="background:var(--navy); color:white; border:none; border-radius:4px; padding:3px 8px; font-size:10px; cursor:pointer; font-weight:700;">Jump</button>
                <button onclick="window.deleteAnnotationNote('${n.noteId}')" style="background:var(--cream); color:var(--maroon); border:1px solid var(--line); border-radius:4px; padding:3px 8px; font-size:10px; cursor:pointer; font-weight:700;">✕</button>
              </div>
            </div>
            <div style="font-size:11px; color:var(--muted); margin-bottom:6px;">Target: <em>&lt;${n.tag}&gt; "${n.targetText}"</em></div>
            <p style="font-size:12.5px; line-height:1.45; margin:0;">${n.comment}</p>
          </div>
        `).join('');
      }

      window.refreshFeedbackDrawerUI = updateDrawer;

      // Global helper for jumping to element
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
      window.deleteAnnotationNote = function(noteId) {
        notesList = notesList.filter(n => n.noteId !== noteId);
        try {
          localStorage.setItem('rbm_symphony_notes', JSON.stringify(notesList));
        } catch (e) {}
        const badge = document.querySelector(`[data-badge-id="${noteId}"]`);
        if (badge) badge.remove();
        updateDrawer();
      };

      updateDrawer();

      // Function to completely reset all notes and element badges
      function resetAllNotes() {
        document.querySelectorAll('.annotation-element-badge').forEach(b => b.remove());
        document.querySelectorAll('.annotation-target-active').forEach(el => {
          el.classList.remove('annotation-target-active');
          el.removeAttribute('data-annotation-id');
        });
        notesList = [];
        try {
          localStorage.removeItem('rbm_symphony_notes');
        } catch (e) {}
        updateDrawer();
      }

      // Universal Clipboard Copy with Fallback
      function copyToClipboard(text) {
        if (navigator.clipboard && window.isSecureContext) {
          return navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
        } else {
          return fallbackCopy(text);
        }
      }

      function fallbackCopy(text) {
        try {
          const ta = document.createElement('textarea');
          ta.value = text;
          ta.style.position = 'fixed';
          ta.style.left = '-9999px';
          ta.style.top = '-9999px';
          document.body.appendChild(ta);
          ta.focus();
          ta.select();
          document.execCommand('copy');
          ta.remove();
          return Promise.resolve();
        } catch (e) {
          return Promise.resolve(); // Continue reset even if clipboard is restricted
        }
      }

      // Expose executeCopyAndReset globally
      window.executeCopyAndReset = function() {
        if (notesList.length === 0) {
          alert('No notes pinned yet! Click "Pin Feedback" to add critique.');
          return;
        }
        let prompt = "### Review Notes for Richmond Symphony Portfolio Refinements\n\n";
        notesList.forEach(n => {
          prompt += `**[#${n.id}] [${n.category}] on <${n.tag}> "${n.targetText}"**\n`;
          prompt += `- **Feedback/Revision**: ${n.comment}\n\n`;
        });
        
        copyToClipboard(prompt);
        if (copyAiBtn) {
          copyAiBtn.innerText = 'Copied & Reset! ✓';
          copyAiBtn.style.background = 'var(--maroon)';
          copyAiBtn.style.color = 'var(--cream)';
          setTimeout(() => { 
            copyAiBtn.innerText = 'Copy All Notes for Antigravity';
            copyAiBtn.style.background = '';
            copyAiBtn.style.color = '';
          }, 2400);
        }
        resetAllNotes();
      };

      // Copy handler is bound via onclick="window.copyAllNotesAndReset(event)"
      // in HTML, which calls window.executeCopyAndReset() above.
      // No duplicate addEventListener needed.
    } catch (err) {
      console.warn('Annotation suite init error:', err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSuite);
  } else {
    initSuite();
  }
})();
