// =========================================================================
// Richmond Symphony Advancement Systems & Operations Portfolio Suite
// Candidate: Randy Bryan Moore, MSW
// Complete Integrated Interactive Engine & Pinpoint Annotation Suite
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
    // 3. QR Code Generator SVG
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
    // 4. Case Studies Interactive Tab Switcher
    // =========================================================================
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (editActive) return; // Allow editing without switching tabs
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
    // 5. Repertoire Synthesis Engine & Live Canvas Waveform
    // =========================================================================
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

    // =========================================================================
    // 6. Pinpoint Annotation & Direct Feedback Suite (Multi-Element Batch Support)
    // =========================================================================
    let selectedElements = []; // Array of { el, tag, text }
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
    const popoverTitle = document.querySelector('.annotation-popover .popover-title');
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

    function escapeHtml(str) {
      return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function renderSelectedElementsSnippet() {
      if (!popoverText) return;
      if (selectedElements.length === 0) {
        popoverText.innerHTML = '<span style="color:var(--muted); font-style:italic;">No elements selected</span>';
        if (popoverTitle) popoverTitle.innerText = 'Comment on Element';
        return;
      }
      
      if (popoverTitle) {
        popoverTitle.innerText = selectedElements.length === 1 
          ? 'Comment on Element' 
          : `Comment on ${selectedElements.length} Elements`;
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
        <div style="max-height:100px; overflow-y:auto; margin-bottom:4px;">${chipsHtml}</div>
        <div style="font-size:10px; color:var(--muted); font-family:var(--mono);">💡 Click any other element to add/remove it from this note</div>
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
        if (!el.closest('#annotation-dock') && !el.closest('#annotation-popover') && !el.closest('#feedback-drawer') && !el.closest('#passcode-gate')) {
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
        }
      });
    }
    if (drawerClose) {
      drawerClose.addEventListener('click', () => {
        if (drawer) drawer.style.display = 'none';
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

    // Click to Target and Open Popover (with Multi-Element Selection)
    document.addEventListener('click', (e) => {
      if (editActive && e.target.closest('a')) {
        e.preventDefault(); // Prevent navigating away while editing links
        return;
      }
      if (!pinActive || editActive) return;
      if (e.target.closest('#annotation-dock') || e.target.closest('#annotation-popover') || e.target.closest('#feedback-drawer') || e.target.closest('.annotation-element-badge') || e.target.closest('#passcode-gate')) return;

      e.preventDefault();
      e.stopPropagation();

      const clickedEl = e.target;
      const existingIdx = selectedElements.findIndex(item => item.el === clickedEl);

      if (existingIdx !== -1) {
        // Toggle OFF if clicked again
        selectedElements.splice(existingIdx, 1);
        clickedEl.classList.remove('annotation-target-selected');
        if (selectedElements.length === 0) {
          closePopover();
          return;
        }
      } else {
        // Add to multi-selection
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
        const popoverWidth = 340;
        const popoverHeight = 270;
        let topPos = rect.bottom + 8;
        let leftPos = Math.max(16, Math.min(window.innerWidth - popoverWidth - 16, rect.left));

        if (topPos + popoverHeight > window.innerHeight) {
          topPos = Math.max(16, rect.top - popoverHeight - 8);
        }

        popover.style.top = topPos + 'px';
        popover.style.left = leftPos + 'px';
        popover.style.display = 'block';

        if (selectedElements.length === 1) {
          setTimeout(() => { if (popoverInput) popoverInput.focus(); }, 50);
        }
      }
    });

    // Save Annotation Note (Batch Multi-Element Support)
    function saveNote() {
      const comment = popoverInput ? popoverInput.value.trim() : '';
      if (!comment || selectedElements.length === 0) return;

      selectedElements.forEach((item, idx) => {
        const num = notesList.length + 1;
        const noteId = 'note-' + Date.now() + '-' + idx;

        if (item.el) {
          item.el.classList.remove('annotation-target-selected');
          item.el.classList.add('annotation-target-active');
          item.el.setAttribute('data-annotation-id', noteId);

          const badge = document.createElement('span');
          badge.className = 'annotation-element-badge';
          badge.innerText = num;
          badge.title = `[${selectedCategory}] ${comment}`;
          badge.setAttribute('data-badge-id', noteId);
          badge.addEventListener('click', (ev) => {
            ev.stopPropagation();
            if (drawer) drawer.style.display = 'flex';
          });
          item.el.appendChild(badge);
        }

        const newNote = {
          id: num,
          noteId: noteId,
          tag: item.tag,
          category: selectedCategory,
          targetText: item.text,
          comment: comment,
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        notesList.push(newNote);
      });

      try {
        localStorage.setItem('rbm_symphony_notes', JSON.stringify(notesList));
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

    // Copy All Notes Formatted for AI
    if (copyAiBtn) {
      copyAiBtn.addEventListener('click', () => {
        if (notesList.length === 0) {
          alert('No notes pinned yet! Click "Pin Feedback" to add critique.');
          return;
        }
        let prompt = "### Review Notes for Richmond Symphony Portfolio Refinements\n\n";
        notesList.forEach(n => {
          prompt += `**[#${n.id}] [${n.category}] on <${n.tag}> "${n.targetText}"**\n`;
          prompt += `- **Feedback/Revision**: ${n.comment}\n\n`;
        });
        navigator.clipboard.writeText(prompt).then(() => {
          copyAiBtn.innerText = 'Copied to Clipboard! ✓';
          
          // Reset the notes list
          notesList = [];
          try {
            localStorage.setItem('rbm_symphony_notes', JSON.stringify(notesList));
          } catch (e) {}
          
          // Remove all badges from the DOM
          document.querySelectorAll('.annotation-element-badge').forEach(b => b.remove());
          
          updateDrawer();

          setTimeout(() => { copyAiBtn.innerText = 'Copy All Notes for Antigravity'; }, 2400);
        });
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSuite);
  } else {
    initSuite();
  }
})();
