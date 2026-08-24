// =========================================================================
// Richmond Symphony Advancement Systems & Operations Portfolio Suite
// Candidate: Randy Bryan Moore, MSW
// Complete Integrated Interactive Engine, Dual-Stream Annotation & Telemetry
// =========================================================================

(function() {
  // The global 'and'/'&' -> ' // ' text transform was removed on 2026-08-22.
  // It rewrote every text node on the page, including verbatim quotations from
  // the cover letter, which altered a primary source. The '//' motif is now
  // hard-coded in the specific headings and labels that should carry it.

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
    const gateError = document.getElementById('gate-error');

    function clearGateError() {
      if (gateError) gateError.textContent = '';
      if (masterInput) masterInput.removeAttribute('aria-invalid');
    }

    function showGateError() {
      if (gateError) gateError.textContent = 'That access code is not recognized. Enter 0000.';
      if (masterInput) masterInput.setAttribute('aria-invalid', 'true');
    }

    function validateAccessCode() {
      if (!masterInput) return false;
      if (masterInput.value === '0000') {
        clearGateError();
        unlockDossier();
        return true;
      }
      showGateError();
      masterInput.focus();
      masterInput.select();
      return false;
    }

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
      clearGateError();
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

      clearGateError();
      if (rawVal.length === 4) {
        setTimeout(validateAccessCode, 60);
      }
    }

    try {
      if (sessionStorage.getItem('symphony_dossier_auth') === 'true' || 
          sessionStorage.getItem('rbm_sym_unlocked') === '1' ||
          localStorage.getItem('symphony_dossier_auth') === 'true') {
        unlockDossier();
      } else if (gateOverlay) {
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
        validateAccessCode();
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
    const copyTelemetryBtn = document.getElementById('provenance-copy-telemetry-btn');
    const relockBtn = document.getElementById('provenance-relock-btn');
    const annotationOwnerToggleBtn = document.getElementById('annotation-owner-toggle-btn');
    const annotationOwnerUnlockBtn = document.getElementById('annotation-owner-unlock-btn');
    const annotationOwnerCodeInput = document.getElementById('annotation-owner-code-input');
    const annotationOwnerCodeField = document.querySelector('.annotation-owner-code-field');
    const telemetryUnlockPopover = document.getElementById('telemetry-unlock-popover');
    const annotationPresentationTitle = document.getElementById('annotation-presentation-title');
    const annotationFeatureLiveStatus = document.getElementById('annotation-feature-live-status');
    const annotationPresentationReadyStatus = document.getElementById('annotation-presentation-ready-status');
    const annotationOwnerControlNote = document.getElementById('annotation-owner-control-note');
    let provenanceReturnFocus = null;
    let annotationOwnerFailedAttempts = 0;
    let annotationOwnerLockedUntil = 0;

    const annotationOwnerDigest = 'e438ac374ecf2449ef27a4a9e5dc1ef04d1094413b22f2529b472126493f5f48';
    const annotationOwnerDigestNamespace = 'rbm-symphony-annotation-owner-v1:';
    // Owner access always starts locked on a fresh page load. Earlier stored
    // preferences are removed so telemetry never opens without a current code.
    const annotationToolsPreferenceKey = 'rbm_symphony_annotation_tools_v3';

    const isOnePagerTelemetry = document.body.dataset.telemetrySurface === 'one-pager';

    const currentTelemetry = Object.freeze(isOnePagerTelemetry ? {
      schemaVersion: 1,
      surfaceKey: 'one-pager',
      surfaceName: 'Executive One-Pager',
      serviceName: 'richmond-symphony-executive-one-pager',
      serviceVersion: '1.4.0',
      parentServiceVersion: '1.8.0',
      agent: 'CL',
      agentProduct: 'Claude Code',
      modelFamily: 'Claude Opus 5',
      runtimeVariant: 'not exposed to the static page',
      reasoningEffort: 'not exposed to the static page',
      repository: 'randybryanmoore/randybryanmoore-dot-us',
      branch: 'main',
      baseCommit: '13e730a',
      publicUrl: 'https://symphony.randybryanmoore.us/one_pager.html',
      releaseManifest: './one_pager-release-manifest.json'
    } : {
      schemaVersion: 1,
      surfaceKey: 'dossier',
      surfaceName: 'Full Candidate Dossier',
      serviceName: 'richmond-symphony-candidate-dossier',
      serviceVersion: '1.8.0',
      parentServiceVersion: '',
      agent: 'CL',
      agentProduct: 'Claude Code',
      modelFamily: 'Claude Opus 5',
      runtimeVariant: 'not exposed to the static page',
      reasoningEffort: 'not exposed to the static page',
      repository: 'randybryanmoore/randybryanmoore-dot-us',
      branch: 'main',
      baseCommit: '13e730a',
      publicUrl: 'https://symphony.randybryanmoore.us',
      releaseManifest: './release-manifest.json'
    });

    const telemetryLifecycle = Object.freeze(isOnePagerTelemetry ? {
      workingTree: 'OP v1.1.0 editorial revision, clean at the release checkpoint',
      committed: true,
      pushed: true,
      pullRequestOrMerged: true,
      deployed: true,
      staging: false,
      productionVerified: true,
      productionVersion: 'OP v1.1.0',
      productionState: 'OP v1.1.0 and parent dossier v1.8.0 are verified at the custom domain',
      verifiedAt: '2026-08-22T15:53:58-04:00',
      releaseCheckpoint: '13e730a verified release source',
      deploymentWorkflowRun: '32593867344'
    } : {
      workingTree: 'v1.8.0 editorial revision, clean at the release checkpoint',
      committed: true,
      pushed: true,
      pullRequestOrMerged: true,
      deployed: true,
      staging: false,
      productionVerified: true,
      productionVersion: 'v1.8.0',
      productionState: 'v1.8.0 and its complete release artifact set are verified at the primary custom domain',
      verifiedAt: '2026-08-22T15:53:58-04:00',
      releaseCheckpoint: '13e730a verified release source',
      deploymentWorkflowRun: '32593867344'
    });

    function annotationToolsAreEnabled() {
      return document.body.dataset.reviewTools !== 'off';
    }

    function setAnnotationOwnerMessage(message, state = '') {
      if (!annotationOwnerControlNote) return;
      annotationOwnerControlNote.textContent = message;
      annotationOwnerControlNote.dataset.state = state;
    }

    function sha256HexFallback(value) {
      const rightRotate = (number, amount) => (number >>> amount) | (number << (32 - amount));
      const maxWord = 2 ** 32;
      const words = [];
      const hash = [];
      const constants = [];
      const composite = {};
      let primeCounter = 0;

      for (let candidate = 2; primeCounter < 64; candidate += 1) {
        if (composite[candidate]) continue;
        for (let multiple = candidate * candidate; multiple < 313; multiple += candidate) {
          composite[multiple] = true;
        }
        hash[primeCounter] = (Math.sqrt(candidate) * maxWord) | 0;
        constants[primeCounter] = (candidate ** (1 / 3) * maxWord) | 0;
        primeCounter += 1;
      }
      hash.length = 8;

      let ascii = value;
      const bitLength = ascii.length * 8;
      ascii += '\x80';
      while (ascii.length % 64 !== 56) ascii += '\x00';
      for (let index = 0; index < ascii.length; index += 1) {
        words[index >> 2] |= ascii.charCodeAt(index) << ((3 - index) % 4) * 8;
      }
      words.push((bitLength / maxWord) | 0);
      words.push(bitLength);

      for (let blockStart = 0; blockStart < words.length; blockStart += 16) {
        const schedule = words.slice(blockStart, blockStart + 16);
        const previousHash = hash.slice(0);

        for (let round = 0; round < 64; round += 1) {
          const word15 = schedule[round - 15];
          const word2 = schedule[round - 2];
          const a = hash[0];
          const e = hash[4];
          const temp1 = hash[7]
            + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
            + ((e & hash[5]) ^ ((~e) & hash[6]))
            + constants[round]
            + (schedule[round] = round < 16 ? schedule[round] : (
              schedule[round - 16]
              + (rightRotate(word15, 7) ^ rightRotate(word15, 18) ^ (word15 >>> 3))
              + schedule[round - 7]
              + (rightRotate(word2, 17) ^ rightRotate(word2, 19) ^ (word2 >>> 10))
            ) | 0);
          const temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22))
            + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));

          hash.pop();
          hash.unshift((temp1 + temp2) | 0);
          hash[4] = (hash[4] + temp1) | 0;
        }

        for (let index = 0; index < 8; index += 1) {
          hash[index] = (hash[index] + previousHash[index]) | 0;
        }
      }

      return hash.map(word => Array.from({ length: 4 }, (_, byteIndex) => (
        (word >> ((3 - byteIndex) * 8)) & 255
      ).toString(16).padStart(2, '0')).join('')).join('');
    }

    async function digestAnnotationOwnerCode(code) {
      const value = annotationOwnerDigestNamespace + code;
      if (window.crypto?.subtle && typeof TextEncoder !== 'undefined') {
        const bytes = new TextEncoder().encode(value);
        const digest = await window.crypto.subtle.digest('SHA-256', bytes);
        return [...new Uint8Array(digest)]
          .map(byte => byte.toString(16).padStart(2, '0'))
          .join('');
      }
      return sha256HexFallback(value);
    }

    function updateAnnotationPresentationTelemetry(enabled) {
      if (annotationFeatureLiveStatus) {
        annotationFeatureLiveStatus.textContent = 'Yes // annotation capability is available';
        annotationFeatureLiveStatus.classList.add('is-live');
      }
      if (annotationPresentationReadyStatus) {
        annotationPresentationReadyStatus.textContent = enabled
          ? 'No // admin controls are unlocked'
          : 'Yes // admin tools are locked';
        annotationPresentationReadyStatus.classList.toggle('is-ready', !enabled);
      }
      if (annotationPresentationTitle) {
        annotationPresentationTitle.textContent = enabled
          ? '(( Admin Controls Unlocked ))'
          : '(( Admin Controls Locked ))';
      }
      if (annotationOwnerToggleBtn) {
        annotationOwnerToggleBtn.textContent = '🔒 Lock Admin';
        annotationOwnerToggleBtn.setAttribute('aria-pressed', String(enabled));
      }
      [copyHandoffBtn, copyTelemetryBtn, relockBtn].forEach(button => {
        if (button) button.disabled = !enabled;
      });
      if (annotationOwnerControlNote) {
        setAnnotationOwnerMessage(enabled
          ? 'Admin controls unlocked // annotation is on.'
          : 'Unlocking opens telemetry // turns annotation on.',
        enabled ? 'success' : '');
      }
      if (buildBadge) {
        buildBadge.title = enabled
          ? 'Admin controls unlocked // annotation on // open telemetry (Shift+V)'
          : 'Owner telemetry locked // hover to reveal marker // code required (Shift+V)';
      }
    }

    function applyAnnotationToolsState(enabled, persist = false) {
      document.body.dataset.reviewTools = enabled ? 'on' : 'off';
      pinActive = false;
      editActive = false;
      document.body.classList.remove('annotation-active');
      document.querySelectorAll('[contenteditable="true"]').forEach(element => {
        element.removeAttribute('contenteditable');
      });
      document.querySelectorAll('#dock-pin-mode-btn, #dock-private-mode-btn, #dock-live-edit-btn').forEach(button => {
        button.classList.remove('active');
      });
      const inspector = document.getElementById('inspector-box');
      const popover = document.getElementById('annotation-popover');
      const drawer = document.getElementById('feedback-drawer');
      if (inspector) inspector.style.display = 'none';
      if (popover) popover.style.display = 'none';
      if (drawer) drawer.style.display = 'none';
      if (persist) {
        try {
          localStorage.setItem(annotationToolsPreferenceKey, enabled ? 'on' : 'off');
        } catch (error) {}
      }
      updateAnnotationPresentationTelemetry(enabled);
    }

    async function requestAnnotationOwnerToggle() {
      if (annotationToolsAreEnabled()) {
        if (annotationOwnerCodeInput) annotationOwnerCodeInput.value = '';
        applyAnnotationToolsState(false, true);
        setProvenanceOpen(false);
        setOwnerUnlockOpen(false);
        buildBadge?.focus();
        return;
      }

      const now = Date.now();
      if (now < annotationOwnerLockedUntil) {
        const seconds = Math.ceil((annotationOwnerLockedUntil - now) / 1000);
        setAnnotationOwnerMessage(`Owner control temporarily locked // try again in ${seconds} seconds.`, 'error');
        return;
      }

      const ownerCode = annotationOwnerCodeInput?.value.trim() || '';

      if (!/^\d{4}$/.test(ownerCode)) {
        setAnnotationOwnerMessage('Enter the complete 4-digit owner code.', 'error');
        annotationOwnerCodeInput?.focus();
        return;
      }

      if (annotationOwnerUnlockBtn) annotationOwnerUnlockBtn.disabled = true;
      try {
        const suppliedDigest = await digestAnnotationOwnerCode(ownerCode);
        if (suppliedDigest !== annotationOwnerDigest) {
          annotationOwnerFailedAttempts += 1;
          if (annotationOwnerFailedAttempts >= 5) {
            annotationOwnerLockedUntil = Date.now() + 30000;
            annotationOwnerFailedAttempts = 0;
            setAnnotationOwnerMessage('Owner code not recognized // control locked for 30 seconds.', 'error');
          } else {
            setAnnotationOwnerMessage('Owner code not recognized.', 'error');
          }
          annotationOwnerCodeInput?.select();
          return;
        }
      } catch (error) {
        setAnnotationOwnerMessage('Owner-code verification is unavailable in this browser context.', 'error');
        return;
      } finally {
        if (annotationOwnerUnlockBtn) annotationOwnerUnlockBtn.disabled = false;
      }

      annotationOwnerFailedAttempts = 0;
      if (annotationOwnerCodeInput) annotationOwnerCodeInput.value = '';
      applyAnnotationToolsState(true, true);
      setOwnerUnlockOpen(false);
      setProvenanceOpen(true);
    }

    let initialAdminEnabled = false;
    try {
      initialAdminEnabled = localStorage.getItem(annotationToolsPreferenceKey) === 'on';
    } catch (error) {}
    applyAnnotationToolsState(initialAdminEnabled);

    if (annotationOwnerToggleBtn) {
      annotationOwnerToggleBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        requestAnnotationOwnerToggle();
      });
    }
    if (annotationOwnerUnlockBtn) {
      annotationOwnerUnlockBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        requestAnnotationOwnerToggle();
      });
    }
    if (annotationOwnerCodeInput) {
      annotationOwnerCodeInput.addEventListener('input', () => {
        annotationOwnerCodeInput.value = annotationOwnerCodeInput.value.replace(/\D/g, '').slice(0, 4);
        setAnnotationOwnerMessage('Unlocking opens telemetry // turns annotation on.');
      });
      annotationOwnerCodeInput.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter') return;
        event.preventDefault();
        requestAnnotationOwnerToggle();
      });
    }

    function getTelemetryTimestamps() {
      const now = new Date();
      return {
        iso: now.toISOString(),
        local: new Intl.DateTimeFormat('en-US', {
          timeZone: 'America/New_York',
          dateStyle: 'medium',
          timeStyle: 'long'
        }).format(now)
      };
    }

    function buildMachineTelemetry() {
      const generated = getTelemetryTimestamps();
      return `schema_version: ${currentTelemetry.schemaVersion}
generated_at: "${generated.iso}"
generated_at_local: "${generated.local}"
timezone: "America/New_York"
generator:
  agent: "${currentTelemetry.agent}"
  product: "${currentTelemetry.agentProduct}"
  model_family: "${currentTelemetry.modelFamily}"
  runtime_variant: "${currentTelemetry.runtimeVariant}"
  reasoning_effort: "${currentTelemetry.reasoningEffort}"
  capture_status: "model family disclosed; exact variant and effort unavailable"
service:
  name: "${currentTelemetry.serviceName}"
  version: "${currentTelemetry.serviceVersion}"
  surface: "${currentTelemetry.surfaceName}"
  surface_key: "${currentTelemetry.surfaceKey}"
  parent_service_version: "${currentTelemetry.parentServiceVersion || 'not applicable'}"
source:
  repository: "${currentTelemetry.repository}"
  branch: "${currentTelemetry.branch}"
  base_commit: "${currentTelemetry.baseCommit}"
  working_tree: "${telemetryLifecycle.workingTree}"
lifecycle:
  local: true
  committed: ${telemetryLifecycle.committed}
  pushed: ${telemetryLifecycle.pushed}
  pull_request_or_merged: ${telemetryLifecycle.pullRequestOrMerged}
  deployed: ${telemetryLifecycle.deployed}
  staging: ${telemetryLifecycle.staging}
  production_verified: ${telemetryLifecycle.productionVerified}
production:
  url: "${currentTelemetry.publicUrl}"
  version: "${telemetryLifecycle.productionVersion}"
  state: "${telemetryLifecycle.productionState}"
  verified_at: "${telemetryLifecycle.verifiedAt}"
  release_checkpoint: "${telemetryLifecycle.releaseCheckpoint}"
  deployment_workflow_run: "${telemetryLifecycle.deploymentWorkflowRun}"
  first_verified_one_repository_build: "1d58442"
presentation:
  annotation_feature_live: true
  admin_controls: "${annotationToolsAreEnabled() ? 'unlocked' : 'locked'}"
  annotation_tools: "${annotationToolsAreEnabled() ? 'on' : 'off'}"
  ready_to_present: ${!annotationToolsAreEnabled()}
handoff:
  schema: "handoff-v2-complete-telemetry"
  complete_telemetry_embedded: true
  visible_version_archive_embedded: true
  lifecycle_definitions_embedded: true
  color_and_version_keys_embedded: true
  engineering_time_method_embedded: true
release_artifacts:
  manifest: "${currentTelemetry.releaseManifest}"
  manifest_policy: "regenerate hashes after final source change and before deployment"
validation:
  prior_release_candidate_gate: "pass"
  structured_telemetry_export: "source_checks_pass"
  complete_handoff_export: "${isOnePagerTelemetry ? 'pass; COMPLETE Sections 10.1-10.9 bundle with two page-specific records and no private owner code' : 'pass; browser export contains Sections 10.1-10.9 and the complete dossier archive'}"
  hero_action_alignment: "pass; equal-width centered two-column grid at 1440x1000 and centered single-column stack at 390x844 with zero horizontal overflow"
  browser_interaction: "pass on HTTP with forced no-WebCrypto fallback; exact in-app file URL automation is policy-blocked"
  inline_owner_control: "superseded in v1.7.2; telemetry and the dual-stream annotation dock are visible by default"
  grouped_annotation_export: "pass; one saved multi-element batch exports as one numbered AI comment with all targets listed"
  performing_arts_copy_constraints: "pass; 40-word opening, 123-word main narrative, 78-word roots-practice-community passage; requested stewardship pull quote removed"
  production_readback: "${isOnePagerTelemetry ? 'OP v1.1.0 and parent dossier v1.8.0 verified at the custom domain' : 'production v1.7.4 and complete release artifact hashes verified at the custom domain'}"
security:
  access_gate: "not active on the default ${currentTelemetry.surfaceName} page load; client-side presentation controls are not authentication"
  sensitive_values_in_export: false
blockers:
  - id: "RELEASE-AUTHORIZATION-1.7.0"
    severity: "high"
    status: "closed"
    description: "Randy explicitly authorized commit, push, deployment, production publication, and repository consolidation."
notes:
  - "Self-reported engineering time is historical context, not measured observability data."
  - "A commit is not a push; a push is not a deployment; deployment is not live verification."`;
    }

    function telemetryText(element) {
      return element?.textContent?.replace(/\s+/g, ' ').trim() || 'Unavailable';
    }

    function buildTelemetryContextArchive() {
      const requiredSelectors = [
        '.provenance-grid',
        '.lifecycle-status-grid',
        '.telemetry-color-key',
        '.version-number-key',
        '.engineering-time-breakdown',
        '.provenance-changelog-list',
        '.annotation-presentation-status'
      ];
      const missingSelectors = requiredSelectors.filter(selector => !document.querySelector(selector));

      const summaryCards = [...document.querySelectorAll('.provenance-grid .provenance-card')]
        .map(card => `- ${telemetryText(card.querySelector('.provenance-card-label'))}: ${telemetryText(card.querySelector('.provenance-card-value'))}`)
        .join('\n');

      const lifecycleRows = [...document.querySelectorAll('.lifecycle-status-grid > div')]
        .map(row => `- ${telemetryText(row.querySelector('dt'))}: ${telemetryText(row.querySelector('dd'))}`)
        .join('\n');

      const lifecycleDefinitions = [...document.querySelectorAll('.lifecycle-glossary li')]
        .map(item => `- ${telemetryText(item)}`)
        .join('\n');

      const keySections = [...document.querySelectorAll('.telemetry-color-key')]
        .map(section => {
          const title = telemetryText(section.querySelector('summary'));
          const intro = [...section.querySelectorAll(':scope > p')]
            .map(paragraph => telemetryText(paragraph))
            .join(' ');
          const rows = [...section.querySelectorAll('dl > div')]
            .map(row => `- ${telemetryText(row.querySelector('dt'))}: ${telemetryText(row.querySelector('dd'))}`)
            .join('\n');
          return `#### ${title}\n${intro ? `${intro}\n` : ''}${rows}`;
        })
        .join('\n\n');

      const timeSummary = telemetryText(document.querySelector('.engineering-time-breakdown__summary'));
      const timeDetails = [...document.querySelectorAll('.engineering-time-breakdown__panel > *')]
        .map(item => `- ${telemetryText(item)}`)
        .join('\n');

      const versionRecords = [...document.querySelectorAll('.provenance-changelog-list .version-item-wrap')]
        .map((item, index) => {
          const row = telemetryText(item.querySelector('.version-item-row'));
          const title = telemetryText(item.querySelector('.version-hover-title'));
          const metadata = [...item.querySelectorAll('.version-hover-meta > div')]
            .map(meta => `- ${telemetryText(meta)}`)
            .join('\n');
          const changes = [...item.querySelectorAll('.version-hover-bullets > li')]
            .map(change => `- ${telemetryText(change)}`)
            .join('\n');
          return `#### ${index + 1}. ${row}\n${title}\n${metadata}\n\nChanges:\n${changes}`;
        })
        .join('\n\n');

      const presentationRows = [...document.querySelectorAll('.annotation-presentation-status > div')]
        .map(row => `- ${telemetryText(row.querySelector('dt'))}: ${telemetryText(row.querySelector('dd'))}`)
        .join('\n');

      const completeness = missingSelectors.length === 0 ? 'COMPLETE' : 'INCOMPLETE';
      const missingLine = missingSelectors.length
        ? `- Missing selectors: ${missingSelectors.join(', ')}`
        : '- Missing sections: none';
      const fullModalSnapshot = telemetryText(document.querySelector('#build-provenance-modal'));

      return `## 10. Complete Telemetry Context Bundle
- Telemetry bundle status: ${completeness}
- Generated from the current telemetry DOM at copy time: Yes
- Machine-readable telemetry included: Yes
- Full visible version archive included: Yes
- Visible version records: ${document.querySelectorAll('.provenance-changelog-list .version-item-wrap').length}
${missingLine}

### 10.1 Current telemetry summary
${summaryCards}

### 10.2 Code lifecycle state
${lifecycleRows}

Lifecycle definitions:
${lifecycleDefinitions}

### 10.3 Telemetry keys
${keySections}

### 10.4 Engineering time
- Summary: ${timeSummary}
${timeDetails}

### 10.5 Complete version // adjustment archive
${versionRecords}

### 10.6 Presentation // annotation telemetry
${presentationRows}

### 10.7 Machine-readable telemetry
\`\`\`yaml
${buildMachineTelemetry()}
\`\`\`

### 10.8 Full telemetry modal text snapshot
This raw text fallback is captured from the entire telemetry modal at copy time so newly added telemetry remains present even before the structured extractor is updated.

${fullModalSnapshot}

### 10.9 Handoff completeness rule
Every future context handoff must retain Sections 10.1 through 10.9. Do not replace this complete telemetry bundle with a summary or a link to the on-page modal.`;
    }

    function buildOnePagerHandoff() {
      const generated = getTelemetryTimestamps();
      const onePagerHandoff = `# Current Agent Handoff — Richmond Symphony Executive One-Pager
Generated: ${generated.iso} (${generated.local}; America/New_York)
Schema: handoff-v2-complete-telemetry

This handoff describes the executive one-pager as its own release surface. The parent dossier is referenced only where shared hosting, code, or release history affects this page.

## 1. One-pager current state
- Surface: Executive One-Pager
- Surface version: OP v${currentTelemetry.serviceVersion}
- Parent dossier production: v${currentTelemetry.parentServiceVersion}
- Agent: Cursor (CUR)
- Model family: ${currentTelemetry.modelFamily}; exact runtime variant and reasoning effort are not exposed and must not be inferred.
- Source baseline: ${currentTelemetry.baseCommit}
- Working file: symphony/one_pager.html
- Public URL: ${currentTelemetry.publicUrl}
- Page-specific manifest: ${currentTelemetry.releaseManifest}

### One-pager lifecycle — report separately
- Local: Yes — OP v${currentTelemetry.serviceVersion} is present and locally validated.
- Committed: Yes — release source checkpoint 13e730a.
- Pushed: Yes — the release branch and main contain the checkpoint.
- Merged / Pull Request: No — no one-pager telemetry PR or merge exists.
- Deployed: Yes — GitHub Actions Pages run 32593867344 completed successfully.
- Staging: Not used.
- Live / Production: OP v${currentTelemetry.serviceVersion} and parent v${currentTelemetry.parentServiceVersion} are verified at the custom domain.

## 2. Telemetry boundary
- The one-pager reports its own surface version, page-specific changes, scoped engineering time, artifact path, and lifecycle.
- The full dossier version is parent context, not the one-pager's active version.
- Shared CSS and JavaScript remain implementation dependencies and do not merge the two telemetry histories.

## 3. Content invariants
- Preserve the two-page executive briefing structure, print behavior, contact information, dashboard disclosure, and verified role-alignment claims.
- Do not introduce unsupported Bloomerang administration, fundraising, genealogy, leadership, or donor-data claims.
- Keep the one-pager visually aligned with the dossier without treating visual consistency as shared release identity.

## 4. Current one-pager change
- Replaced the stale shared dossier telemetry with a dedicated Executive One-Pager telemetry surface.
- Released OP v1.0.1 as the independently versioned one-pager with the shared compact telemetry pill.
- Added page-specific lifecycle, time-accounting, artifact, release-note, and parent-dossier reference fields.
- Kept the complete project context available in this handoff while separating active one-pager records from dossier records.

## 5. Scoped engineering time
- OP v1.0.1: 0.2 hour for the independent telemetry implementation, compact pill refinement, release, and verification pass.
- Earlier one-pager design work: not reconstructed; no duration is invented.
- Idle gaps and time awaiting user input are excluded.

## 6. Validation requirements
1. Validate JavaScript and both telemetry manifests.
2. Verify the one-pager opens its own telemetry rather than the dossier summary.
3. Confirm Copy Telemetry names the Executive One-Pager and OP version.
4. Confirm Copy Complete Handoff retains Sections 1 through 10 and the page-specific version archive.
5. Rebuild and integrity-test the offline dossier ZIP after shared-source changes.

## 7. Release protocol
- Stage only named Symphony files; preserve unrelated local work.
- Report Local, Committed, Pushed, Merged / PR, Deployed, Staging, and Live / Production separately.
- A committed OP candidate is not pushed, a push is not deployment, and deployment is not live until the public one-pager is read back.

## 8. Parent release evidence
- Parent dossier production: v${currentTelemetry.parentServiceVersion}.
- Parent production baseline: 13e730a.
- The one-pager and parent dossier were verified together through workflow run 32593867344.

## 9. Machine-readable companion
The page-specific YAML telemetry is embedded in Section 10.7 and is also available through Copy Telemetry. The complete visible one-pager telemetry modal is retained in Section 10.8.`;
      return `${onePagerHandoff}\n\n${buildTelemetryContextArchive()}`;
    }

    function buildCurrentHandoff() {
      if (isOnePagerTelemetry) return buildOnePagerHandoff();
      const generated = getTelemetryTimestamps();
      const narrativeHandoff = `# Current Agent Handoff — Richmond Symphony Candidate Dossier
Generated: ${generated.iso} (${generated.local}; America/New_York)
Schema: handoff-v2-complete-telemetry

This is the current operational snapshot. Reverify every changeable fact before acting. The complete visible telemetry and version archive is appended automatically in Section 10 so successor agents receive the full context rather than a summary alone.

## 1. Current state
- Version: \`v${currentTelemetry.serviceVersion}\`
- Agent: Cursor (\`CUR\`)
- Model family: \`${currentTelemetry.modelFamily}\`; exact runtime variant and reasoning effort are not exposed to the static page and must not be inferred.
- Repository: \`${currentTelemetry.repository}\`, branch \`${currentTelemetry.branch}\`
- Source release lineage begins with: \`${currentTelemetry.baseCommit}\`
- Working area: \`symphony/\`
- Public URL: ${currentTelemetry.publicUrl}
- Release manifest: \`${currentTelemetry.releaseManifest}\` — hashes must be regenerated after the final source edit and before deployment

### Lifecycle — report each state separately
- Local: Yes — \`v${currentTelemetry.serviceVersion}\` release source is present and validated.
- Committed: Yes — release source checkpoint \`13e730a\`.
- Pushed: Yes — the release branch and \`main\` contain the checkpoint.
- Merged / Pull Request: Merged — origin/main was reconciled in \`46246df\`.
- Deployed: Yes — GitHub Actions Pages run \`32593867344\` completed successfully.
- Staging: Not used.
- Live / Production: \`v${currentTelemetry.serviceVersion}\` and its complete artifact set are verified at the custom domain.

### Presentation thresholds — report separately
- Feature Live: Yes — production v1.7.4 exposes telemetry and the dual-stream annotation dock by default.
- Admin Controls: ${annotationToolsAreEnabled() ? 'Available — telemetry, annotation, and review actions are visible in this browser.' : 'Hidden — presentation mode is active in this browser.'}
- Ready to Present: ${annotationToolsAreEnabled() ? 'No — annotation and review tools are currently visible.' : 'Yes — annotation and review tools are hidden.'}

A commit is not a push. A push is not a deployment. A deployment is not confirmed live until production readback succeeds.

## 2. Privacy and access classification
- Distribution: Internal engineering handoff. Remove personal contact details and machine-specific paths before broader sharing.
- Any client-side presentation gate is a convenience, not authentication or confidentiality protection; production v1.7.4 loads the review tools visibly by default.
- Do not put passcodes, tokens, private-note contents, or credential-file paths in generated handoffs.
- Do not publish the dossier ZIP without explicit approval of its complete manifest.

## 3. Project invariants
- Purpose: source-grounded candidate dossier for Assistant Director, Advancement Systems & Operations at Richmond Symphony.
- Brand blue levels: \`#0d1a32\`, \`#182b4d\`, \`#243d6b\`.
- Canonical red: \`#2b0710\`; do not introduce a lighter red without explicit instruction.
- Preserve Playfair Display, Inter, and JetBrains Mono typography roles.
- Preserve private notes. Transient review notes may reset only through their documented export flow.

## 4. Claim policy
- Bloomerang: learning priority and role requirement, not prior administration experience.
- EveryAction: constituent engagement tagging, outreach lists, follow-up workflows, and event reporting; do not invent duration.
- Muster: requirements definition and Salesforce integration design for Active Minds across Congressional targets.
- Leadership: supervised graduate MSW interns and trained 40 partner organizations; do not imply prior supervision of Richmond Symphony staff.
- Musical Artistry is currently Section 04. Preserve the supplied sourced credentials and do not add unsupported fundraising software or experience.
- Attribute Carter / Stanley connections to family accounts, present them as cultural context, and do not convert the reported kinship into an inherited-accomplishment claim.

## 5. Current release changes
- Corrected unsupported or overstated claims.
- Repaired incorrect-PIN acceptance and improved gate behavior while retaining the client-side-security disclaimer.
- Added explicit lifecycle states and telemetry accessibility/containment fixes.
- Updated case-study active states, layout accents, contact surfaces, Musical Artistry order, embedded-media annotation, and telemetry collapse behavior.
- Set the three TikTok cards to a centered 320px intermediate width without affecting unrelated responsive grids.
- Replaced the oversized default handoff with this current-state document and added a separate YAML telemetry export.
- Renamed the “Piano Repertoire” navigation link to “Music & Artistry.”
- Separated telemetry status colors: local candidates are gold, live production is green, and released history is blue.
- Adopted the main-site Playfair Display and Inter font system, retained JetBrains Mono for telemetry, and added the (( section label )) / // divider signature.
- Added a visible telemetry key explaining gold Local, green Live, blue Released, red Attention, and cream Information states with accompanying text labels.
- Made the telemetry color key keyboard-accessible, collapsible, and closed by default.
- Added a collapsed version-number key defining MAJOR.MINOR.PATCH thresholds, reset rules, example readings, and the pre-release meaning of -rc.
- Applied the dossier's editorial convention globally: visible “and” and ampersands become “//” while URLs, code, and operators remain unchanged.
- Added an engineering-time disclosure that previews on hover or focus, persists on click or tap, and documents the exact agent-hour arithmetic, active-block method, 10-minute break rule, exclusions, and historical precision limits.
- Relabeled every dashboard entry point as a fictional Advancement Intelligence concept prototype and added an adjacent no-live-systems / no-donor-data disclosure.
- Made the below-header telemetry marker transparent at rest. While locked it exposes only a compact owner-code gate; successful unlock opens full telemetry and annotation together. The locked Ready to Present state is green, and the expanded panel remains between the header and annotation dock with hover translucency.
- Grouped annotations now export one numbered AI comment per saved batch, with every selected element listed beneath that single comment.
- Rebuilt Performing Arts Background around Roots, Practice, and Community; retained the photo, credentials, project links, and Spotify; shortened 1,000 Songs; and replaced three TikTok embeds with one compact listening-studies link group.
- Attributed the Carter / Stanley relationships to family accounts, identified the families as Virginia music legends, and avoided any implication of inherited accomplishment.
- Removed the Performing Arts stewardship pull quote at Randy’s request.
- Changed CDX identity markers to gold so they remain distinct from the green production-verified lifecycle state.
- Consolidated source and deployment authority in the primary repository with a validated GitHub Pages workflow that publishes only \`symphony/\`; the legacy serving repository is retained solely as a recoverable archive after cutover.
- Reordered the core narrative to Systems, Role Alignment, Case Studies, then Performing Arts, with matching navigation and section numbers.
- Centered Deployment at the top of telemetry, made Code Lifecycle State collapsible, replaced red annotation outlines with gold, and standardized visible monograms as RBM.
- Made every context handoff dynamically include all current telemetry, all version adjustments, lifecycle definitions, both telemetry keys, the engineering-time method, presentation and annotation state, machine-readable YAML, and a full-modal fallback for future additions.
- Recorded the previously unarchived v1.7.2 Antigravity changes and disclosed that their engineering time was not captured rather than inventing a duration.
- Centered the four hero actions in an equal-width two-column grid with a single-column mobile stack.
- Added an independently versioned Executive One-Pager telemetry surface with its own lifecycle, scoped time, artifact, release notes, machine export, and complete handoff.

## 6. Safe release protocol
1. Explain the intended source changes in 3–7 bullets.
2. Inspect \`git status --short\` and the complete diff. Preserve unrelated local work.
3. Run the verified local build and the relevant interaction, responsive, accessibility, archive-integrity, and incorrect-PIN tests.
4. Regenerate \`release-manifest.json\` after the final edit. Confirm every artifact path and SHA-256 digest.
5. Inspect the dossier ZIP manifest for personal or sensitive payloads. Obtain explicit publication approval.
6. Stage only the named release files; never use \`git add -A\` as the default release instruction.
7. Commit with a release-specific message, then report Committed separately.
8. Push without force after verifying the upstream branch state, then report Pushed separately.
9. Use a protected deployment environment or an explicit approval checkpoint before changing serving branches.
10. After deployment, read back the GitHub Pages build, custom domain, version marker, and representative artifact hashes. Only then report Live / Production.

## 7. Deployment safety rules
- The primary repository workflow validates and uploads \`symphony/\` as one Pages artifact; it does not eliminate concurrent updates, caching, Pages build delays, or stale production responses.
- Do not restore the legacy cross-repository deploy path or force-update \`main\`. The former serving repository is archival only.
- Do not combine build, stage, commit, push, deployment, and live verification into one unconditional shell chain.
- A failed or timed-out build, upload, or readback is not success.

## 8. Release evidence
- \`DEPLOY-APPROVAL-001\` — Closed. Randy explicitly authorized publication.
- First verified one-repository build: \`1d58442\` from merged PR #2.
- Complete-telemetry candidate: \`5fa8969\`, merged by PR #4 as \`689456d\`.
- Current production release: v1.8.0 from release source checkpoint \`13e730a\`; deployed by workflow run \`32593867344\`.
- Production readback matched the committed HTML, CSS, JavaScript, one-pager, and manifest artifact hashes.
- The independent one-pager telemetry surface is OP v1.1.0 and is live.

## 9. Machine-readable companion
The complete YAML telemetry is embedded in Section 10.7 and is also available separately through “Copy Machine Telemetry (.YAML).” Treat browser-generated state as a handoff snapshot, not as an independently verified Git or hosting measurement.`;
      return `${narrativeHandoff}\n\n${buildTelemetryContextArchive()}`;
    }

    async function copyProvenanceText(text, button, successLabel, restingLabel) {
      try {
        await navigator.clipboard.writeText(text);
      } catch (error) {
        const fallback = document.createElement('textarea');
        fallback.value = text;
        fallback.setAttribute('readonly', '');
        fallback.style.position = 'fixed';
        fallback.style.opacity = '0';
        document.body.appendChild(fallback);
        fallback.select();
        const copied = document.execCommand('copy');
        fallback.remove();
        if (!copied) throw error;
      }
      button.innerText = successLabel;
      setTimeout(() => { button.innerText = restingLabel; }, 2400);
    }

    // Capture phase intentionally supersedes the legacy exhaustive handoff
    // listener retained below as historical source reference.
    if (copyHandoffBtn) {
      copyHandoffBtn.addEventListener('click', (event) => {
        event.stopImmediatePropagation();
        try {
          copyProvenanceText(
            buildCurrentHandoff(),
            copyHandoffBtn,
            isOnePagerTelemetry ? 'Copied OP Handoff! ✓' : 'Copied Complete Handoff! ✓',
            isOnePagerTelemetry ? '📋 Copy OP Handoff' : '📋 Copy Complete Handoff'
          );
        } catch (error) {
          console.error('Complete handoff generation failed.', error);
          copyHandoffBtn.innerText = 'Handoff Error — Check Console';
        }
      }, { capture: true });
    }

    if (copyTelemetryBtn) {
      copyTelemetryBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        copyProvenanceText(
          buildMachineTelemetry(),
          copyTelemetryBtn,
          isOnePagerTelemetry ? 'Copied OP Telemetry! ✓' : 'Copied Machine Telemetry! ✓',
          isOnePagerTelemetry ? '⚙ Copy OP Telemetry' : '⚙ Copy Machine Telemetry (.YAML)'
        );
      });
    }

    function getProvenanceFocusable() {
      if (!provModal) return [];
      return [...provModal.querySelectorAll('button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])')]
        .filter(el => !el.disabled && el.offsetParent !== null);
    }

    function setOwnerUnlockOpen(open) {
      if (!telemetryUnlockPopover || !buildBadge) return;
      const shouldOpen = Boolean(open && !annotationToolsAreEnabled());
      telemetryUnlockPopover.hidden = !shouldOpen;
      telemetryUnlockPopover.classList.toggle('open', shouldOpen);
      buildBadge.setAttribute('aria-expanded', String(
        shouldOpen || Boolean(provModal?.classList.contains('open'))
      ));
      if (shouldOpen) {
        provenanceReturnFocus = document.activeElement;
        requestAnimationFrame(() => annotationOwnerCodeInput?.focus());
      } else if (annotationOwnerCodeInput) {
        annotationOwnerCodeInput.value = '';
      }
    }

    function setProvenanceOpen(open) {
      if (!provModal || !buildBadge) return;
      if (open && !annotationToolsAreEnabled()) {
        setOwnerUnlockOpen(true);
        return;
      }
      if (open) setOwnerUnlockOpen(false);
      provModal.classList.toggle('open', open);
      provModal.setAttribute('aria-hidden', String(!open));
      buildBadge.setAttribute('aria-expanded', String(open));
      if (open) {
        provenanceReturnFocus = document.activeElement;
        requestAnimationFrame(() => provModal.focus());
      } else if (provenanceReturnFocus && typeof provenanceReturnFocus.focus === 'function') {
        provenanceReturnFocus.focus();
      }
    }

    function toggleProvModal() {
      if (!provModal) return;
      setProvenanceOpen(!provModal.classList.contains('open'));
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
        setProvenanceOpen(false);
      });
    }

    if (relockBtn) {
      relockBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        applyAnnotationToolsState(false, true);
        setProvenanceOpen(false);
        setOwnerUnlockOpen(false);
        lockDossier();
      });
    }

    document.addEventListener('click', (e) => {
      if (provModal && provModal.classList.contains('open') && !e.target.closest('#build-provenance-modal') && !e.target.closest('#build-badge')) {
        setProvenanceOpen(false);
      }
      if (telemetryUnlockPopover && !telemetryUnlockPopover.hidden && !e.target.closest('#telemetry-unlock-popover') && !e.target.closest('#build-badge')) {
        setOwnerUnlockOpen(false);
      }
    });

    // Touch & Click toggle on Version Item Rows (prevents stuck hover on iPad/mobile)
    const versionItems = document.querySelectorAll('.version-item-wrap');
    versionItems.forEach(item => {
      const row = item.querySelector('.version-item-row');
      if (row) {
        row.addEventListener('click', (e) => {
          e.stopPropagation();
          const wasActive = item.classList.contains('active');
          versionItems.forEach(vi => {
            vi.classList.remove('active');
            vi.querySelector('.version-item-row')?.setAttribute('aria-expanded', 'false');
          });
          if (!wasActive) {
            item.classList.add('active');
            row.setAttribute('aria-expanded', 'true');
          }
        });
        row.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            row.click();
          }
        });
      }
    });

    // Historical releases remain available in the on-page version archive.
    // Keyboard shortcut Shift + V to toggle provenance modal
    document.addEventListener('keydown', (e) => {
      if (provModal?.classList.contains('open') && e.key === 'Tab') {
        const focusable = getProvenanceFocusable();
        if (focusable.length === 0) {
          e.preventDefault();
          provModal.focus();
        } else {
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (document.activeElement === provModal) {
            e.preventDefault();
            (e.shiftKey ? last : first).focus();
          } else if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
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
    // 6. Dual-Stream Pinpoint Annotation & Private Notes Engine
    // =========================================================================
    let selectedElements = []; // Array of { el, tag, text }
    let selectedCategories = ['Copy'];
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
    const popoverVoiceBtn = document.getElementById('popover-voice-btn');
    const popoverVoiceStatus = document.getElementById('popover-voice-status');
    const popoverVoiceBtnLabel = document.getElementById('popover-voice-btn-label');

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
      
      // Keep valid standard tags or custom tags
      selectedCategories = selectedCategories.filter(c => tags.includes(c) || (!aiTags.includes(c) && !privateTags.includes(c)));
      
      if (selectedCategories.length === 0) {
        selectedCategories = [tags[0]];
      }

      let html = tags.map(tag => `
        <span class="tag-chip ${selectedCategories.includes(tag) ? 'selected' : ''}" data-tag="${escapeHtml(tag)}">${escapeHtml(tag)}</span>
      `).join('');
      
      // Render custom tags
      selectedCategories.forEach(tag => {
        if (!tags.includes(tag)) {
          html += `<span class="tag-chip custom-tag selected" data-tag="${escapeHtml(tag)}">${escapeHtml(tag)}</span>`;
        }
      });
      
      html += `<span class="tag-chip custom-tag-btn" style="background: rgba(255,255,255,0.1); border: 1px dashed var(--gold);">+ Custom</span>`;
      
      popoverTagsContainer.innerHTML = html;

      popoverTagsContainer.querySelectorAll('.tag-chip:not(.custom-tag-btn)').forEach(chip => {
        chip.addEventListener('click', (e) => {
          e.stopPropagation();
          const tag = chip.getAttribute('data-tag');
          if (selectedCategories.includes(tag)) {
            if (selectedCategories.length > 1) {
                selectedCategories = selectedCategories.filter(c => c !== tag);
                chip.classList.remove('selected');
            }
          } else {
            selectedCategories.push(tag);
            chip.classList.add('selected');
          }
        });
      });
      
      const customBtn = popoverTagsContainer.querySelector('.custom-tag-btn');
      if (customBtn) {
         customBtn.addEventListener('click', (e) => {
           e.stopPropagation();
           const custom = prompt('Enter custom category:');
           if (custom && custom.trim()) {
              if (!selectedCategories.includes(custom.trim())) {
                  selectedCategories.push(custom.trim());
                  renderTags();
              }
           }
         });
      }
    }

    // Switch Popover Mode (AI Review vs Private Note)
    function setPopoverMode(mode) {
      currentMode = mode;
      popoverModeTabs.forEach(t => {
        if (t.getAttribute('data-mode') === mode) t.classList.add('active');
        else t.classList.remove('active');
      });

      selectedCategories = mode === 'private' ? ['Memo'] : ['Copy'];
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

    // Voice Notes & Live Speech Transcription Engine
    let speechRecognizer = null;
    let isVoiceRecording = false;
    let mediaRecorder = null;
    let audioStream = null;
    let recordedAudioChunks = [];
    let activeVoiceAudioBase64 = null;

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;

    function startVoiceDictation() {
      if (isVoiceRecording) {
        stopVoiceDictation();
        return;
      }

      isVoiceRecording = true;
      activeVoiceAudioBase64 = null;
      recordedAudioChunks = [];

      if (popoverVoiceBtn) {
        popoverVoiceBtn.classList.add('recording');
        if (popoverVoiceBtnLabel) popoverVoiceBtnLabel.innerText = 'Stop Dictating';
      }
      if (popoverVoiceStatus) {
        popoverVoiceStatus.innerText = '🔴 Listening... speak your note';
        popoverVoiceStatus.classList.add('listening');
      }

      // 1. Live Speech-to-Text Transcription directly into popover textarea
      if (SpeechRec) {
        try {
          if (!speechRecognizer) {
            speechRecognizer = new SpeechRec();
            speechRecognizer.continuous = true;
            speechRecognizer.interimResults = true;
            speechRecognizer.lang = 'en-US';

            speechRecognizer.onresult = (e) => {
              let finalTranscript = '';
              for (let i = e.resultIndex; i < e.results.length; ++i) {
                if (e.results[i].isFinal) {
                  finalTranscript += e.results[i][0].transcript;
                }
              }
              if (finalTranscript && popoverInput) {
                const currentText = popoverInput.value.trim();
                popoverInput.value = currentText ? `${currentText} ${finalTranscript.trim()}` : finalTranscript.trim();
                popoverInput.dispatchEvent(new Event('input', { bubbles: true }));
              }
            };

            speechRecognizer.onerror = (err) => {
              console.warn('SpeechRecognition error:', err);
              if (popoverVoiceStatus && err.error !== 'no-speech') {
                popoverVoiceStatus.innerText = `Mic notice: ${err.error}`;
              }
            };

            speechRecognizer.onend = () => {
              if (isVoiceRecording) {
                try { speechRecognizer.start(); } catch (e) {}
              }
            };
          }
          speechRecognizer.start();
        } catch (e) {
          console.warn('SpeechRecognizer start warning:', e);
        }
      }

      // 2. Capture Audio snippet via MediaRecorder for playback in Drawer
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(stream => {
            audioStream = stream;
            try {
              mediaRecorder = new MediaRecorder(stream);
              mediaRecorder.ondataavailable = (ev) => {
                if (ev.data && ev.data.size > 0) recordedAudioChunks.push(ev.data);
              };
              mediaRecorder.onstop = () => {
                if (recordedAudioChunks.length > 0) {
                  const audioBlob = new Blob(recordedAudioChunks, { type: 'audio/webm' });
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    activeVoiceAudioBase64 = reader.result;
                  };
                  reader.readAsDataURL(audioBlob);
                }
                if (audioStream) {
                  audioStream.getTracks().forEach(track => track.stop());
                }
              };
              mediaRecorder.start();
            } catch (err) {
              console.warn('MediaRecorder error:', err);
            }
          })
          .catch(err => {
            console.warn('Mic permission notice:', err);
            if (popoverVoiceStatus) {
              popoverVoiceStatus.innerText = 'Mic permission needed to dictate';
              popoverVoiceStatus.classList.remove('listening');
            }
          });
      } else if (!SpeechRec) {
        if (popoverVoiceStatus) popoverVoiceStatus.innerText = 'Dictation not supported in browser';
      }
    }

    function stopVoiceDictation() {
      isVoiceRecording = false;
      if (popoverVoiceBtn) {
        popoverVoiceBtn.classList.remove('recording');
        if (popoverVoiceBtnLabel) popoverVoiceBtnLabel.innerText = 'Dictate Voice Note';
      }
      if (popoverVoiceStatus) {
        popoverVoiceStatus.innerText = activeVoiceAudioBase64 ? 'Voice note recorded ✓' : 'Click mic to speak';
        popoverVoiceStatus.classList.remove('listening');
      }

      if (speechRecognizer) {
        try { speechRecognizer.stop(); } catch (e) {}
      }
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        try { mediaRecorder.stop(); } catch (e) {}
      }
    }

    if (popoverVoiceBtn) {
      popoverVoiceBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isVoiceRecording) {
          stopVoiceDictation();
        } else {
          startVoiceDictation();
        }
      });
    }

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
      const batchId = `batch-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const batchSize = selectedElements.length;

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
          badge.title = `[${isPrivate ? '🔒 Private' : '🚀 AI'}: ${selectedCategories.join(', ')}] ${comment}`;
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
          batchId: batchId,
          batchIndex: idx,
          batchSize: batchSize,
          category: selectedCategories.join(', '),
          targetText: item.text,
          comment: comment,
          voiceAudio: activeVoiceAudioBase64,
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
      stopVoiceDictation();
      activeVoiceAudioBase64 = null;
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
        if (provModal && provModal.classList.contains('open')) setProvenanceOpen(false);
        if (telemetryUnlockPopover && !telemetryUnlockPopover.hidden) setOwnerUnlockOpen(false);
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
              ? 'No AI review notes queued. Click "🚀 Pin AI" on the dock and pin changes to send to Antigravity, Claude, Codex, or Cursor.'
              : 'No notes match your filter.');
        drawerList.innerHTML = `<p style="color:var(--muted);font-size:12px;font-style:italic;padding:12px;text-align:center;">${emptyMsg}</p>`;
        return;
      }

      drawerList.innerHTML = displayNotes.map(n => {
        const isPriv = (n.type === 'private');
        const badgeLabel = isPriv ? `🔒#${n.id}` : `#${n.id}`;
        const voiceAudioMarkup = n.voiceAudio ? `
          <div class="drawer-voice-player">
            <span>🎙️ Audio Note</span>
            <button type="button" onclick="window.playAnnotationAudio('${n.noteId}')" id="voice-play-btn-${n.noteId}">▶ Play</button>
            <audio id="audio-el-${n.noteId}" src="${n.voiceAudio}" preload="none" style="display:none;"></audio>
          </div>
        ` : '';

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
            <p style="font-size:12px; line-height:1.45; margin:0 0 4px 0; color:var(--ink);">${escapeHtml(n.comment)}</p>
            ${voiceAudioMarkup}
          </div>
        `;
      }).join('');
    }

    // Audio Playback Helper
    window.playAnnotationAudio = function(noteId) {
      const audioEl = document.getElementById(`audio-el-${noteId}`);
      const playBtn = document.getElementById(`voice-play-btn-${noteId}`);
      if (!audioEl) return;
      if (audioEl.paused) {
        audioEl.play();
        if (playBtn) playBtn.innerText = '⏸ Pause';
        audioEl.onended = () => {
          if (playBtn) playBtn.innerText = '▶ Play';
        };
      } else {
        audioEl.pause();
        if (playBtn) playBtn.innerText = '▶ Play';
      }
    };

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
        const groupedNotes = [];
        const groupedNoteMap = new Map();
        aiNotesList.forEach(note => {
          const groupKey = note.batchId || note.noteId;
          if (!groupedNoteMap.has(groupKey)) {
            const group = {
              category: note.category,
              comment: note.comment,
              targets: []
            };
            groupedNoteMap.set(groupKey, group);
            groupedNotes.push(group);
          }
          groupedNoteMap.get(groupKey).targets.push({ tag: note.tag, text: note.targetText });
        });

        let prompt = "### Review Notes for Richmond Symphony Portfolio Refinements\n\n";
        groupedNotes.forEach((group, groupIndex) => {
          if (group.targets.length === 1) {
            const target = group.targets[0];
            prompt += `**[#${groupIndex + 1}] [${group.category}] on <${target.tag}> "${target.text}"**\n`;
          } else {
            prompt += `**[#${groupIndex + 1}] [${group.category}] on ${group.targets.length} selected elements**\n`;
            group.targets.forEach(target => {
              prompt += `  - <${target.tag}> "${target.text}"\n`;
            });
          }
          prompt += `- **Feedback/Revision**: ${group.comment}\n\n`;
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

    // Finalise in the LOCKED state. This previously passed true, which
    // silently undid the lock applied during init, so the annotation dock
    // was always visible and sat on top of the telemetry badge. Owner tools
    // now stay hidden until the 4-digit owner code is entered.
    applyAnnotationToolsState(false);
    renderTags();
    updateDrawer();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSuite);
  } else {
    initSuite();
  }
})();
