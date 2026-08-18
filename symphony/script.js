// Richmond Symphony Advancement Systems & Operations Candidate Suite
// Candidate: Randy Bryan Moore, MSW
// State-of-the-Art Visual Review & Pinpoint Annotation Suite (v2.0)

document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // 1. Passcode Gate Logic (Universal Passcode: 0000)
  // =========================================================================
  const PASSCODE = '0000';
  const gateOverlay = document.getElementById('passcode-gate');
  const pinInputs = document.querySelectorAll('.pin-digit');
  const gateUnlockBtn = document.getElementById('gate-unlock-btn');
  const gateError = document.getElementById('gate-error');

  function getEnteredPin() {
    return Array.from(pinInputs).map(i => i.value).join('');
  }

  function unlockDossier() {
    if (gateOverlay) {
      gateOverlay.classList.add('unlocked');
      sessionStorage.setItem('symphony_dossier_auth', 'true');
    }
  }

  function validatePin() {
    const entered = getEnteredPin();
    if (entered === PASSCODE) {
      unlockDossier();
    } else {
      if (gateError) gateError.style.display = 'block';
      pinInputs.forEach(i => {
        i.value = '';
        i.style.borderColor = 'var(--wine)';
      });
      if (pinInputs[0]) pinInputs[0].focus();
    }
  }

  if (sessionStorage.getItem('symphony_dossier_auth') === 'true') {
    unlockDossier();
  }

  pinInputs.forEach((input, idx) => {
    input.addEventListener('input', (e) => {
      if (e.target.value.length === 1 && idx < pinInputs.length - 1) {
        pinInputs[idx + 1].focus();
      }
      if (getEnteredPin().length === 4) {
        validatePin();
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !e.target.value && idx > 0) {
        pinInputs[idx - 1].focus();
      } else if (e.key === 'Enter') {
        validatePin();
      }
    });
  });

  if (gateUnlockBtn) {
    gateUnlockBtn.addEventListener('click', validatePin);
  }

  // =========================================================================
  // 2. Case Study Tabs
  // =========================================================================
  const caseNavBtns = document.querySelectorAll('.case-nav-btn');
  const caseContents = document.querySelectorAll('.case-study-content');

  caseNavBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      caseNavBtns.forEach(b => b.classList.remove('active'));
      caseContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const caseId = btn.getAttribute('data-case');
      const targetContent = document.getElementById('case-' + caseId);
      if (targetContent) {
        targetContent.classList.add('active');
      }
    });
  });

  // =========================================================================
  // 3. Audio Player & Canvas Waveform Visualizer
  // =========================================================================
  const canvas = document.getElementById('waveform-canvas');
  const playBtn = document.getElementById('play-trigger-btn');
  const trackItems = document.querySelectorAll('.track-item');
  const activeTrackName = document.getElementById('active-track-name');
  const activeTrackMeta = document.getElementById('active-track-meta');

  let audioCtx = null;
  let isPlaying = false;
  let animationId = null;
  let wavePhase = 0;

  function initAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  const trackData = {
    nocturne: {
      name: 'Acoustic Piano Repertoire: Nocturne in C-Sharp Minor, Op. Posth.',
      meta: 'Chopin • Solo Piano Repertoire Study',
      freqs: [277.18, 329.63, 415.30, 554.37, 659.25]
    },
    clair: {
      name: 'Debussy: Clair de Lune',
      meta: 'Impressionist Repertoire • Dynamic Phrasing',
      freqs: [261.63, 329.63, 392.00, 523.25, 659.25]
    },
    hymn: {
      name: 'Appalachian Hymnody & Modal Themes',
      meta: 'Traditional Repertoire • Harmonic Voicings',
      freqs: [220.00, 277.18, 329.63, 440.00, 554.37]
    }
  };

  let currentTrack = 'nocturne';
  let activeOscillators = [];

  function playPianoChord() {
    initAudio();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const info = trackData[currentTrack] || trackData.nocturne;
    stopAudio();

    const masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.01, audioCtx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.18, audioCtx.currentTime + 0.1);
    masterGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 3.5);
    masterGain.connect(audioCtx.destination);

    info.freqs.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime + idx * 0.12);
      osc.connect(masterGain);
      osc.start(audioCtx.currentTime + idx * 0.12);
      osc.stop(audioCtx.currentTime + 4.0);
      activeOscillators.push(osc);
    });

    isPlaying = true;
    if (playBtn) playBtn.innerHTML = '⏸';
    drawWaveform();

    setTimeout(() => {
      if (isPlaying) {
        playPianoChord();
      }
    }, 3800);
  }

  function stopAudio() {
    activeOscillators.forEach(osc => {
      try { osc.stop(); } catch (e) {}
    });
    activeOscillators = [];
  }

  function drawWaveform() {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.clientWidth || 400;
    canvas.height = 64;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 2;
    ctx.strokeStyle = isPlaying ? '#4C0E1C' : '#808370';
    ctx.beginPath();

    const sliceWidth = canvas.width / 50;
    let x = 0;

    for (let i = 0; i < 50; i++) {
      const amplitude = isPlaying ? 16 : 2;
      const y = (canvas.height / 2) + Math.sin(i * 0.35 + wavePhase) * amplitude;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
      x += sliceWidth;
    }

    ctx.stroke();
    wavePhase += 0.12;

    if (isPlaying) {
      animationId = requestAnimationFrame(drawWaveform);
    }
  }

  if (canvas) {
    drawWaveform();
  }

  if (playBtn) {
    playBtn.addEventListener('click', () => {
      if (isPlaying) {
        isPlaying = false;
        stopAudio();
        playBtn.innerHTML = '▶';
        if (animationId) cancelAnimationFrame(animationId);
        drawWaveform();
      } else {
        playPianoChord();
      }
    });
  }

  trackItems.forEach(item => {
    item.addEventListener('click', () => {
      trackItems.forEach(t => t.classList.remove('active'));
      item.classList.add('active');
      currentTrack = item.getAttribute('data-track');

      const info = trackData[currentTrack];
      if (info) {
        if (activeTrackName) activeTrackName.innerText = info.name;
        if (activeTrackMeta) activeTrackMeta.innerText = info.meta;
      }

      if (isPlaying) {
        stopAudio();
        playPianoChord();
      }
    });
  });

  // =========================================================================
  // 4. State-of-the-Art Visual Review & Pinpoint Annotation Suite (v2.0)
  // =========================================================================
  let pinModeActive = true;
  let editModeActive = false;
  let drawerOpen = false;
  const pins = [];

  const dockPinBtn = document.getElementById('dock-pin-mode-btn');
  const dockEditBtn = document.getElementById('dock-edit-mode-btn');
  const dockDrawerBtn = document.getElementById('dock-drawer-toggle-btn');
  const dockNotesCount = document.getElementById('dock-notes-count');
  
  const popover = document.getElementById('annotation-popover');
  const popoverTargetSnippet = document.getElementById('popover-target-snippet');
  const popoverCommentInput = document.getElementById('popover-comment-input');
  const popoverSaveBtn = document.getElementById('popover-save-btn');
  const popoverCancelBtn = document.getElementById('popover-cancel-btn');
  const popoverCloseBtn = document.getElementById('popover-close-btn');
  const tagChips = document.querySelectorAll('.tag-chip');
  
  const drawer = document.getElementById('feedback-drawer');
  const drawerBody = document.getElementById('drawer-body');
  const drawerCount = document.getElementById('drawer-count');
  const drawerCloseBtn = document.getElementById('drawer-close-btn');
  const drawerExportBtn = document.getElementById('drawer-export-btn');

  let selectedTag = 'Copy & Wording';
  let pendingElement = null;
  let pendingCoords = { x: 0, y: 0, pageX: 0, pageY: 0 };
  let pendingText = '';

  document.body.classList.add('annotation-active');

  // Tag chip selection
  tagChips.forEach(chip => {
    chip.addEventListener('click', (e) => {
      e.stopPropagation();
      tagChips.forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
      selectedTag = chip.getAttribute('data-tag');
    });
  });

  // Toggle Pin Mode
  if (dockPinBtn) {
    dockPinBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      pinModeActive = !pinModeActive;
      dockPinBtn.classList.toggle('active', pinModeActive);
      document.body.classList.toggle('annotation-active', pinModeActive);
      if (pinModeActive && editModeActive) {
        dockEditBtn.click(); // turn off edit mode
      }
      closePopover();
    });
  }

  // Toggle Live WYSIWYG Edit Mode
  if (dockEditBtn) {
    dockEditBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      editModeActive = !editModeActive;
      dockEditBtn.classList.toggle('active', editModeActive);
      
      if (editModeActive && pinModeActive) {
        dockPinBtn.click(); // turn off pin mode
      }

      const editableSelectors = 'h1, h2, h3, h4, p, span, li, a, blockquote, td';
      document.querySelectorAll(editableSelectors).forEach(el => {
        if (!el.closest('#annotation-dock') && !el.closest('#annotation-popover') && !el.closest('#feedback-drawer')) {
          el.contentEditable = editModeActive ? 'true' : 'false';
          el.style.outline = editModeActive ? '1.5px dashed var(--forest)' : '';
          el.style.backgroundColor = editModeActive ? 'rgba(24, 59, 43, 0.04)' : '';
        }
      });
    });
  }

  // Toggle Drawer
  if (dockDrawerBtn) {
    dockDrawerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      drawerOpen = !drawerOpen;
      if (drawer) drawer.style.display = drawerOpen ? 'flex' : 'none';
      renderDrawer();
    });
  }

  if (drawerCloseBtn) {
    drawerCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      drawerOpen = false;
      if (drawer) drawer.style.display = 'none';
    });
  }

  // Hover highlighting
  let lastHovered = null;
  document.addEventListener('mouseover', (e) => {
    if (!pinModeActive || editModeActive) return;
    if (e.target.closest('#annotation-dock') || e.target.closest('#annotation-popover') || e.target.closest('#feedback-drawer') || e.target.closest('.annotation-canvas-pin')) return;

    if (lastHovered && lastHovered !== e.target) {
      lastHovered.classList.remove('annotation-highlight-hover');
    }
    lastHovered = e.target;
    lastHovered.classList.add('annotation-highlight-hover');
  });

  document.addEventListener('mouseout', (e) => {
    if (lastHovered && e.target === lastHovered) {
      lastHovered.classList.remove('annotation-highlight-hover');
      lastHovered = null;
    }
  });

  // Drop pinpoint on click
  document.addEventListener('click', (e) => {
    if (!pinModeActive || editModeActive) return;
    if (e.target.closest('#annotation-dock') || e.target.closest('#annotation-popover') || e.target.closest('#feedback-drawer') || e.target.closest('.annotation-canvas-pin')) return;

    e.preventDefault();
    e.stopPropagation();

    pendingElement = e.target;
    const tagName = pendingElement.tagName.toLowerCase();
    const textContent = pendingElement.innerText.trim();
    pendingText = textContent.length > 70 ? textContent.substring(0, 67) + '...' : textContent;

    const selectedText = window.getSelection().toString().trim();
    if (selectedText) {
      pendingText = '"' + selectedText + '"';
    }

    pendingCoords = {
      x: e.clientX,
      y: e.clientY,
      pageX: e.pageX,
      pageY: e.pageY
    };

    openPopover(tagName, pendingText, pendingCoords);
  });

  function openPopover(tagName, snippet, coords) {
    if (!popover) return;
    popoverTargetSnippet.innerText = '<' + tagName + '> ' + (snippet || 'Visual Element');
    popoverCommentInput.value = '';

    // Calculate position
    const popoverWidth = 320;
    let left = coords.pageX + 15;
    let top = coords.pageY - 20;

    if (left + popoverWidth > window.innerWidth + window.scrollX) {
      left = coords.pageX - popoverWidth - 15;
    }

    popover.style.left = left + 'px';
    popover.style.top = top + 'px';
    popover.style.display = 'block';

    setTimeout(() => popoverCommentInput.focus(), 50);
  }

  function closePopover() {
    if (popover) popover.style.display = 'none';
    pendingElement = null;
  }

  if (popoverCancelBtn) popoverCancelBtn.addEventListener('click', closePopover);
  if (popoverCloseBtn) popoverCloseBtn.addEventListener('click', closePopover);

  // Save Pin
  function saveCurrentPin() {
    const comment = popoverCommentInput.value.trim();
    if (!comment) return;

    const pinId = pins.length + 1;
    const newPin = {
      id: pinId,
      tag: selectedTag,
      comment: comment,
      snippet: pendingText,
      elementTag: pendingElement ? pendingElement.tagName.toLowerCase() : 'element',
      pageX: pendingCoords.pageX,
      pageY: pendingCoords.pageY,
      element: pendingElement
    };

    pins.push(newPin);

    // Create Pin Badge on Screen
    const pinMarker = document.createElement('div');
    pinMarker.className = 'annotation-canvas-pin';
    pinMarker.id = 'canvas-pin-' + pinId;
    pinMarker.innerText = pinId;
    pinMarker.title = '[' + selectedTag + '] ' + comment;
    pinMarker.style.left = pendingCoords.pageX + 'px';
    pinMarker.style.top = pendingCoords.pageY + 'px';

    pinMarker.addEventListener('click', (e) => {
      e.stopPropagation();
      openPopover(newPin.elementTag, newPin.snippet, { pageX: newPin.pageX, pageY: newPin.pageY });
      popoverCommentInput.value = newPin.comment;
    });

    document.body.appendChild(pinMarker);

    closePopover();
    updateCounts();
    renderDrawer();
  }

  if (popoverSaveBtn) popoverSaveBtn.addEventListener('click', saveCurrentPin);

  if (popoverCommentInput) {
    popoverCommentInput.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        saveCurrentPin();
      } else if (e.key === 'Escape') {
        closePopover();
      }
    });
  }

  function updateCounts() {
    const count = pins.length;
    if (dockNotesCount) dockNotesCount.innerText = count;
    if (drawerCount) drawerCount.innerText = count;
  }

  function renderDrawer() {
    if (!drawerBody) return;
    if (pins.length === 0) {
      drawerBody.innerHTML = '<p style="color:var(--muted-olive); font-size:0.85rem; font-style:italic; text-align:center; padding:1.5rem 0;">Click anywhere on the page to drop a pin and add feedback.</p>';
      return;
    }

    drawerBody.innerHTML = pins.map(p => 
      '<div class="drawer-item" data-pin-id="' + p.id + '" style="cursor:pointer;">' +
        '<button class="drawer-item-delete" title="Delete pin" data-delete-id="' + p.id + '">✕</button>' +
        '<div class="drawer-item-tag">#' + p.id + ' • ' + p.tag + '</div>' +
        '<div style="font-size:0.75rem; color:var(--muted-olive); font-style:italic; margin:2px 0;">Target: ' + (p.snippet || p.elementTag) + '</div>' +
        '<p class="drawer-item-text"><strong>' + p.comment + '</strong></p>' +
      '</div>'
    ).join('');

    // Attach click listeners to drawer items for smooth scroll to pin
    drawerBody.querySelectorAll('.drawer-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.classList.contains('drawer-item-delete')) return;
        const pinId = item.getAttribute('data-pin-id');
        const pinMarker = document.getElementById('canvas-pin-' + pinId);
        if (pinMarker) {
          pinMarker.scrollIntoView({ behavior: 'smooth', block: 'center' });
          pinMarker.style.transform = 'translate(-50%, -50%) scale(1.6)';
          pinMarker.style.boxShadow = '0 0 20px rgba(76, 14, 28, 0.9)';
          setTimeout(() => {
            pinMarker.style.transform = 'translate(-50%, -50%) scale(1)';
            pinMarker.style.boxShadow = '0 3px 8px rgba(0, 0, 0, 0.35)';
          }, 800);
        }
      });
    });

    // Attach delete listeners
    drawerBody.querySelectorAll('.drawer-item-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const deleteId = parseInt(btn.getAttribute('data-delete-id'), 10);
        const idx = pins.findIndex(p => p.id === deleteId);
        if (idx !== -1) {
          pins.splice(idx, 1);
          const pinMarker = document.getElementById('canvas-pin-' + deleteId);
          if (pinMarker) pinMarker.remove();
          updateCounts();
          renderDrawer();
        }
      });
    });
  }

  // Export to AI Prompt
  if (drawerExportBtn) {
    drawerExportBtn.addEventListener('click', () => {
      if (pins.length === 0) {
        alert('No notes pinned yet! Click anywhere on the page to drop feedback pins.');
        return;
      }

      let report = "Here is my fine-grained feedback for the Richmond Symphony Portfolio:\n\n";
      pins.forEach(p => {
        report += '### [#' + p.id + '] [' + p.tag + '] on <' + p.elementTag + '> "' + (p.snippet || 'Visual Element') + '"\n';
        report += '- **Feedback**: ' + p.comment + '\n\n';
      });

      navigator.clipboard.writeText(report);
      drawerExportBtn.innerText = '✅ Copied Structured Report!';
      setTimeout(() => {
        drawerExportBtn.innerText = '📋 Copy All Notes for Antigravity';
      }, 2500);
    });
  }
});
