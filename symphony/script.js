// SVG QR Code generator with crisp rendering
function generateQRCodeSVG(text, size = 140) {
  const encodedText = encodeURIComponent(text);
  return `<img src="https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedText}&color=183b2b" alt="Scan to view candidate portfolio" width="${size}" height="${size}" style="display:block; border-radius:6px;" />`;
}

document.addEventListener('DOMContentLoaded', () => {
  // 0. Confidential Passcode Gate (Code: 0000)
  const passcodeGate = document.getElementById('passcode-gate');
  const digits = [
    document.getElementById('digit-1'),
    document.getElementById('digit-2'),
    document.getElementById('digit-3'),
    document.getElementById('digit-4')
  ];
  const gateUnlockBtn = document.getElementById('gate-unlock-btn');

  function checkPasscode() {
    const entered = digits.map(d => (d ? d.value : '')).join('');
    if (entered === '0000' || entered.length === 4) {
      unlockGate();
    }
  }

  function unlockGate() {
    if (passcodeGate) {
      passcodeGate.classList.add('unlocked');
      sessionStorage.setItem('rbm_symphony_unlocked', 'true');
    }
  }

  // Auto-unlock if previously unlocked in this session
  if (sessionStorage.getItem('rbm_symphony_unlocked') === 'true') {
    if (passcodeGate) passcodeGate.classList.add('unlocked');
  }

  if (digits[0]) {
    digits.forEach((input, idx) => {
      input.addEventListener('input', (e) => {
        if (e.target.value.length === 1 && idx < 3) {
          digits[idx + 1].focus();
        }
        checkPasscode();
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !e.target.value && idx > 0) {
          digits[idx - 1].focus();
        }
        if (e.key === 'Enter') {
          unlockGate();
        }
      });
    });
  }

  if (gateUnlockBtn) {
    gateUnlockBtn.addEventListener('click', unlockGate);
  }

  // 1. Reading / Scroll Progress Bar
  const scrollProgressBar = document.getElementById('scroll-progress');
  const header = document.querySelector('header');

  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (window.scrollY / totalHeight) * 100;
    if (scrollProgressBar) scrollProgressBar.style.width = `${progress}%`;
    if (header) header.classList.toggle('scrolled', window.scrollY > 40);
  });

  // 2. Render QR Codes
  const qrContainers = document.querySelectorAll('.qr-code-target');
  const targetUrl = window.location.href.split('#')[0].replace('one_pager.html', 'index.html');
  qrContainers.forEach(container => {
    const size = parseInt(container.getAttribute('data-size')) || 120;
    container.innerHTML = generateQRCodeSVG(targetUrl, size);
  });

  // 3. Interactive Case Study Tabs
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const activePane = document.getElementById(`tab-${targetTab}`);
      if (activePane) activePane.classList.add('active');
    });
  });

  // 4. Web Audio API Piano Synthesizer & Canvas Waveform Engine
  let audioCtx = null;
  let isSynthesizing = false;
  let synthInterval = null;
  let customAudio = null;

  const playTriggerBtn = document.getElementById('play-trigger-btn');
  const trackOptions = document.querySelectorAll('.track-option');
  const canvas = document.getElementById('waveform-canvas');
  const ctx = canvas ? canvas.getContext('2d') : null;

  // Piano Note Frequency Map (Hz)
  const notes = {
    'C4': 261.63, 'D4': 293.66, 'Eb4': 311.13, 'E4': 329.63, 'F4': 349.23,
    'G4': 392.00, 'Ab4': 415.30, 'A4': 440.00, 'Bb4': 466.16, 'B4': 493.88,
    'C5': 523.25, 'D5': 587.33, 'Eb5': 622.25, 'E5': 659.25, 'G5': 783.99,
  };

  // Classical Progressions (Jefferson Hotel Repertoire Simulation)
  const progressions = {
    'jefferson': ['C4', 'E4', 'G4', 'C5', 'G4', 'E4', 'A4', 'C5', 'E5', 'C5', 'F4', 'A4', 'C5', 'G4', 'B4', 'D5'],
    'debussy': ['Eb4', 'G4', 'Bb4', 'Eb5', 'Bb4', 'G4', 'Ab4', 'C5', 'Eb5', 'C5', 'F4', 'Ab4', 'C5', 'Eb4', 'G4', 'Bb4'],
    'chopin': ['G4', 'Bb4', 'D5', 'G5', 'D5', 'Bb4', 'Eb4', 'G4', 'Bb4', 'Eb5', 'F4', 'A4', 'C5', 'F5', 'D4', 'G4'],
  };

  let currentTrackKey = 'jefferson';

  function playPianoNote(freq, duration = 1.2) {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    // Warm piano envelope
    gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.35, audioCtx.currentTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  }

  function startPianoSequence() {
    isSynthesizing = true;
    if (playTriggerBtn) playTriggerBtn.innerHTML = '⏸';
    const sequence = progressions[currentTrackKey] || progressions['jefferson'];
    let step = 0;

    synthInterval = setInterval(() => {
      const noteName = sequence[step % sequence.length];
      if (notes[noteName]) {
        playPianoNote(notes[noteName], 1.4);
      }
      step++;
    }, 380);

    drawWaveform();
  }

  function stopPianoSequence() {
    isSynthesizing = false;
    if (synthInterval) clearInterval(synthInterval);
    if (playTriggerBtn) playTriggerBtn.innerHTML = '▶';
    if (customAudio) customAudio.pause();
    drawIdleWaveform();
  }

  if (playTriggerBtn) {
    playTriggerBtn.addEventListener('click', () => {
      if (isSynthesizing) {
        stopPianoSequence();
      } else {
        startPianoSequence();
      }
    });
  }

  trackOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      trackOptions.forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      currentTrackKey = opt.getAttribute('data-track');
      if (isSynthesizing) {
        stopPianoSequence();
        startPianoSequence();
      }
    });
  });

  // Real-time Canvas Visualizer
  let waveOffset = 0;
  function drawWaveform() {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#5B2432';
    ctx.beginPath();

    const sliceWidth = canvas.width / 40;
    let x = 0;

    for (let i = 0; i < 40; i++) {
      const y = (canvas.height / 2) + Math.sin(i * 0.4 + waveOffset) * (isSynthesizing ? 14 : 2);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
      x += sliceWidth;
    }
    ctx.stroke();

    waveOffset += 0.15;
    if (isSynthesizing) requestAnimationFrame(drawWaveform);
  }

  function drawIdleWaveform() {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(128, 131, 112, 0.4)';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
  }

  drawIdleWaveform();

  // 5. Custom Audio Upload Support
  const customAudioInput = document.getElementById('custom-audio-input');
  const uploadTrackBtn = document.getElementById('upload-track-btn');

  if (uploadTrackBtn && customAudioInput) {
    uploadTrackBtn.addEventListener('click', () => customAudioInput.click());
    customAudioInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        stopPianoSequence();
        const url = URL.createObjectURL(file);
        customAudio = new Audio(url);
        customAudio.play();
        isSynthesizing = true;
        if (playTriggerBtn) playTriggerBtn.innerHTML = '⏸';
        drawWaveform();
        customAudio.addEventListener('ended', () => stopPianoSequence());
      }
    });
  }

  // 6. Nuanced Annotation & Fine-Grained Critique Suite
  let annotationMode = false;
  let directEditMode = false;
  const annotations = [];

  const annotateToggleBtn = document.getElementById('annotate-toggle-btn');
  const liveEditToggleBtn = document.getElementById('live-edit-toggle-btn');
  const annotationPanel = document.getElementById('annotation-panel');
  const annotationList = document.getElementById('annotation-list');
  const copyAnnotationsBtn = document.getElementById('copy-annotations-btn');
  const modalBackdrop = document.getElementById('annotation-modal-backdrop');
  const modalTargetLabel = document.getElementById('modal-target-label');
  const modalContextSnippet = document.getElementById('modal-context-snippet');
  const modalCategory = document.getElementById('modal-category');
  const modalCommentInput = document.getElementById('modal-comment-input');
  const modalSubmitBtn = document.getElementById('modal-submit-btn');
  const modalCancelBtn = document.getElementById('modal-cancel-btn');

  let pendingTarget = null;
  let pendingSnippet = '';

  if (annotateToggleBtn) {
    annotateToggleBtn.addEventListener('click', () => {
      annotationMode = !annotationMode;
      document.body.classList.toggle('annotation-mode-active', annotationMode);
      annotationPanel.style.display = annotationMode ? 'flex' : 'none';
      annotateToggleBtn.classList.toggle('active', annotationMode);
    });
  }

  if (liveEditToggleBtn) {
    liveEditToggleBtn.addEventListener('click', () => {
      directEditMode = !directEditMode;
      document.body.classList.toggle('direct-edit-active', directEditMode);
      liveEditToggleBtn.classList.toggle('active', directEditMode);
      liveEditToggleBtn.innerHTML = directEditMode ? '✍️ Live Edit: ON' : '✏️ Toggle Live Text Edit';

      const editableSelectors = 'h1, h2, h3, h4, p, span, li, a, .role-pill, .badge-tag, .stat-num, .stat-label';
      document.querySelectorAll(editableSelectors).forEach(el => {
        if (!el.closest('#annotation-panel') && !el.closest('#annotation-modal-backdrop') && !el.closest('.annotation-toolbar-container')) {
          el.contentEditable = directEditMode ? 'true' : 'false';
          el.classList.toggle('wysiwyg-editable', directEditMode);
        }
      });
    });
  }

  document.addEventListener('click', (e) => {
    if (!annotationMode || directEditMode) return;
    if (e.target.closest('#annotation-panel') || e.target.closest('#annotation-modal-backdrop') || e.target.closest('.annotation-toolbar-container')) return;

    e.preventDefault();
    e.stopPropagation();

    pendingTarget = e.target;
    const tagName = pendingTarget.tagName.toLowerCase();
    const textContent = pendingTarget.innerText.trim();
    pendingSnippet = textContent.length > 80 ? textContent.substring(0, 77) + '...' : textContent;

    const selectedText = window.getSelection().toString().trim();
    if (selectedText) {
      pendingSnippet = `"${selectedText}"`;
    }

    if (modalTargetLabel) modalTargetLabel.innerText = `<${tagName}> element: "${pendingSnippet || 'Visual block'}"`;
    if (modalContextSnippet) modalContextSnippet.innerText = textContent ? `Context: "${textContent.substring(0, 140)}"` : '';
    if (modalCommentInput) {
      modalCommentInput.value = '';
      modalCommentInput.focus();
    }
    if (modalBackdrop) modalBackdrop.style.display = 'flex';
  });

  if (modalSubmitBtn) {
    modalSubmitBtn.addEventListener('click', () => {
      const comment = modalCommentInput.value.trim();
      const category = modalCategory.value;
      if (!comment) return;

      const noteId = annotations.length + 1;
      annotations.push({
        id: noteId,
        category: category,
        snippet: pendingSnippet,
        comment: comment,
        tag: pendingTarget.tagName.toLowerCase(),
      });

      if (pendingTarget) {
        const pin = document.createElement('span');
        pin.className = 'annotation-pin';
        pin.innerText = noteId;
        pin.title = `[${category}] ${comment}`;
        pendingTarget.style.position = 'relative';
        pendingTarget.appendChild(pin);
      }

      modalBackdrop.style.display = 'none';
      renderAnnotations();
    });
  }

  if (modalCancelBtn) {
    modalCancelBtn.addEventListener('click', () => {
      if (modalBackdrop) modalBackdrop.style.display = 'none';
    });
  }

  function renderAnnotations() {
    if (annotations.length === 0) {
      annotationList.innerHTML = '<p style="color:#808370; font-size:0.85rem; font-style:italic;">Click on any specific headline, sentence, button, or card to attach categorized feedback.</p>';
      return;
    }

    const categoryIcons = {
      'Copy & Wording': '✍️',
      'Visual & Layout': '🎨',
      'Content & Assets': '📂',
      'Feature Idea': '💡',
      'Other': '📌',
    };

    annotationList.innerHTML = annotations.map(a => `
      <div class="annotation-item">
        <div class="annotation-header">
          <span class="category-pill">${categoryIcons[a.category] || '📌'} ${a.category}</span>
          <span class="note-num">#${a.id}</span>
        </div>
        <div class="annotation-target-text">Target: <em>${a.snippet || a.tag}</em></div>
        <p class="annotation-body">${a.comment}</p>
      </div>
    `).join('');
  }

  if (copyAnnotationsBtn) {
    copyAnnotationsBtn.addEventListener('click', () => {
      if (annotations.length === 0) {
        alert('No annotations added yet! Click any element to add fine-grained feedback.');
        return;
      }

      let formattedReport = "Here is my fine-grained feedback for the Richmond Symphony Portfolio:\n\n";
      annotations.forEach(a => {
        formattedReport += `### [#${a.id}] [${a.category}] on "${a.snippet || a.tag}"\n- **Feedback**: ${a.comment}\n\n`;
      });

      navigator.clipboard.writeText(formattedReport);
      copyAnnotationsBtn.innerText = '✅ Copied Structured Prompt!';
      setTimeout(() => { copyAnnotationsBtn.innerText = '📋 Copy Feedback for Antigravity'; }, 2500);
    });
  }
});
