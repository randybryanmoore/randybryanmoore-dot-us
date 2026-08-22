---
name: build-agent-telemetry
description: Universal 100/100 Build Telemetry, Provenance Modal & Cross-Agent Handoff Suite for web applications, prototypes, and HTML artifacts. Embeds a glassmorphic live watermark pill (● LIVE, version, commit SHA, date), interactive provenance modal (Shift+V), semantic hover/tap cards with session start times, itemized edit timestamps, live push times, 7-state code lifecycle tracking, owner-gated presentation mode, and 1-click complete multi-session agent handoff generation (Markdown + YAML) for seamless continuity across Claude Code, Antigravity, Codex, and Cursor.
---

# ⚡ Universal Build & Agent Telemetry Suite (100/100 Gold Standard)

Use this skill whenever building, updating, or maintaining web applications, prototypes, dashboards, or executive HTML artifacts. This suite provides transparent real-time build telemetry, 7-state code lifecycle tracking, cross-agent handoff memory preservation, owner-gated presentation mode, and interactive semantic changelogs.

---

## 🏆 100-Point Architectural Rubric

| Component | Standard Specification |
| :--- | :--- |
| **1. Standardized Agent Attribution** | Avatar badges and changelogs enshrine the active authoring & deployment agent: **`AG`** (Antigravity · DeepMind), **`CL`** (Claude Code · Anthropic), **`CDX`** (Codex · OpenAI), and **`CUR`** (Cursor), alongside runtime model family provenance. |
| **2. 7-State Code Lifecycle Tracking** | Clear, distinct reporting of: `Local`, `Committed`, `Pushed`, `Merged / PR`, `Deployed`, `Staging`, and `Live / Production Verified` (a commit is not a push; a push is not a deployment; deployment is not verified live until custom domain readback passes). |
| **3. Owner-Gated Presentation Mode** | Compact owner verification gate (4-digit code) toggling between `Ready to Present` (clean public view with editor/annotation tools hidden) and `Admin Controls Unlocked` (full telemetry, live editing, and annotation dock visible). |
| **4. Active-Block Engineering Time Arithmetic** | Cumulative development time tracking with explicit arithmetic: active work blocks (first action to last action before a 10+ min break) with per-agent breakdowns (`AG: X.Xh • CL: X.Xh • CDX: X.Xh • CUR: X.Xh`) and precision notes. |
| **5. Telemetry & Version Keys** | Collapsible, keyboard-accessible keys defining status colors (Gold Local, Green Live, Blue Released, Red Attention), agent identity colors (Navy AG, Orange CL, Gold CDX, Violet CUR), and `MAJOR.MINOR.PATCH` semantic versioning thresholds. |
| **6. Unclipped Inline Version Cards** | Interactive version rows that expand inline directly below each milestone on hover or tap, avoiding CSS `overflow: auto/hidden` clipping bugs across desktop and mobile screens. |
| **7. Dual-Format Master Agent Handoff** | 1-Click **`[ 📋 Copy Complete Agent Handoff ]`** and **`[ ⚙ Copy Telemetry (.YAML) ]`** generating complete multi-session dossiers with zero context loss. |

---

## 🏷️ Standardized AI Agent Identification & Provenance
- **`AG`** = **Antigravity** (Google DeepMind) — navy `#0d1a32`
- **`CL`** = **Claude Code** (Anthropic) — orange `#c2410c`
- **`CDX`** = **Codex** (OpenAI) — gold `#dfca74` (identity only; not the Local lifecycle state)
- **`CUR`** = **Cursor** — heather violet `#5a4e8c` (reserved so it does not collide with navy, orange, gold, green Live, or maroon Attention)

---

## ⏱️ Cumulative Engineering Time Arithmetic Standard
1. **Active Time Only**: A work block runs from the first verified inspect, edit, or test action to the last action before an explicit break or a gap of 10+ minutes.
2. **Exclusions**: Breaks, idle gaps, and time waiting for user input or approval are excluded.
3. **Reconciliation**: Active blocks are summed, then the displayed project total is rounded to one decimal place.
4. **Format**:
   ```
   ⏱️ Total Engineering: 10.6h (AG: 3.75h • CL: 3.25h • CDX: 3.60h • CUR: 0.0h) across 45+ commits
   ```

---

## 🚦 7-State Code Lifecycle Definitions
- **`Local`**: Running only on the personal computer; not internet-accessible.
- **`Committed`**: Saved as a permanent checkpoint in local Git.
- **`Pushed`**: Uploaded from local Git to a shared remote such as GitHub.
- **`Merged / PR`**: Reviewed changes combined into the primary shared branch.
- **`Deployed`**: Sent to and configured on a web server, hosting service, or cloud provider.
- **`Staging`**: A hosted test environment separate from production.
- **`Live / Production`**: The active public version visitors actually receive, verified via live custom domain readback.

---

## 🎨 Telemetry Color & Version Keys
- **Gold // Local**: Work exists only on the development machine or is a release candidate; it is not deployed.
- **Green // Live**: The production deployment and public custom-domain readback have both been verified.
- **Blue // Released**: A completed historical release that is retained for provenance but is not the current live build.
- **Red // Attention**: A blocker, failed check, approval requirement, or other action that still needs resolution.
- **Cream // Information**: Descriptive metadata only; this color does not communicate lifecycle progress.

Agent identity is a separate key from lifecycle:
- **Navy // AG**: Antigravity
- **Orange // CL**: Claude Code
- **Gold // CDX**: Codex
- **Violet // CUR**: Cursor (`#5a4e8c`)

---

## 📦 Zero-Dependency HTML Markup Skeleton

```html
<!-- Live Watermark Pill (Shift+V to inspect) -->
<div class="build-badge" id="build-badge" title="Click to view System Build Telemetry & Agent Handoff (Shift+V)">
  <span class="build-badge-agent" title="Active AI Agent: Antigravity (AG)">AG</span>
  <span class="build-badge-live-dot" title="Live & Synchronized"></span>
  <span class="build-badge-version">v1.7.1</span>
  <span class="build-badge-sha">#689456d</span>
  <span class="build-badge-date">Aug 20, 2026</span>
</div>

<!-- Locked-State Owner Access Gate -->
<div class="telemetry-unlock-popover" id="telemetry-unlock-popover" role="dialog" aria-labelledby="telemetry-unlock-title" hidden>
  <div class="telemetry-unlock-title" id="telemetry-unlock-title">(( Owner Access Required ))</div>
  <label class="annotation-owner-code-field" for="annotation-owner-code-input">
    <span>Owner Code</span>
    <input id="annotation-owner-code-input" type="password" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" autocomplete="off" aria-label="Owner verification code" placeholder="4 digits">
  </label>
  <p id="annotation-owner-control-note" aria-live="polite">Unlocking opens telemetry // turns annotation on.</p>
  <button id="annotation-owner-unlock-btn" class="button button-navy" type="button">🔐 Unlock Telemetry // Annotation</button>
</div>

<!-- Build Provenance & Telemetry Modal -->
<div class="build-provenance-modal" id="build-provenance-modal" role="dialog" aria-modal="true" aria-labelledby="provenance-title" tabindex="-1">
  <div class="provenance-header">
    <span class="provenance-title" id="provenance-title">⚡ Build &amp; Agent Telemetry</span>
    <button id="provenance-close-btn" aria-label="Close build telemetry">✕</button>
  </div>

  <div class="provenance-grid">
    <div class="provenance-card">
      <div class="provenance-card-label">Active Agent</div>
      <div class="provenance-card-value">Antigravity (AG)</div>
    </div>
    <div class="provenance-card">
      <div class="provenance-card-label">Build Version</div>
      <div class="provenance-card-value">v1.7.1 (Current Live)</div>
    </div>
    <div class="provenance-card">
      <div class="provenance-card-label">Total Time Logged</div>
      <div class="provenance-card-value" style="color:var(--gold-light); font-weight:800;">⏱️ 10.6 Hours</div>
    </div>
    <div class="provenance-card">
      <div class="provenance-card-label">Git Commit SHA</div>
      <div class="provenance-card-value" id="prov-commit-sha">#689456d</div>
    </div>
    <div class="provenance-card">
      <div class="provenance-card-label">Sync Branch</div>
      <div class="provenance-card-value">main &bull; Actions Pages</div>
    </div>
    <div class="provenance-card">
      <div class="provenance-card-label">Deployment</div>
      <div class="provenance-card-value" style="color:#15803d; font-weight:800;">● Live &amp; Built</div>
    </div>
  </div>

  <!-- Version Architecture & Inline Expandable Changelog -->
  <div class="provenance-version-box">
    <div class="provenance-version-title">
      <span>Version Architecture</span>
      <span style="font-size:9px;">[Major].[Feature].[Patch]</span>
    </div>
    <div class="provenance-version-desc">
      Hover or tap any version to view authoring/deployer app, session duration, and itemized edit timestamps.
    </div>

    <div class="provenance-changelog-list">
      <!-- Current Milestone Item -->
      <div class="version-item-wrap active">
        <div class="version-item-row">
          <span><span class="agent-chip agent-chip--ag">AG</span> <strong>v1.7.1</strong> (Current)</span>
          <span class="version-row-tag" style="background:#dcfce7; color:#15803d;">● Live</span>
        </div>
        <div class="version-hover-card">
          <div class="version-hover-header">
            <div class="version-hover-title">
              <span>v1.7.1 · Release Title</span>
              <span style="color:#15803d; font-size:9px;">● CURRENT</span>
            </div>
            <div class="version-hover-meta">
              <div><strong>Authoring Agent:</strong> Antigravity (AG)</div>
              <div><strong>Deployed By:</strong> Antigravity (AG)</div>
              <div><strong>Time Logged:</strong> 1.0 Hour</div>
              <div><strong>Commit SHA:</strong> #689456d</div>
            </div>
          </div>
          <ul class="version-hover-bullets">
            <li><strong>[Timestamp]</strong> Itemized granular modification note.</li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <!-- Presentation Mode & Handoff Action Cluster -->
  <div class="provenance-actions">
    <button id="provenance-copy-handoff-btn" class="button button-maroon" style="width:100%; justify-content:center; font-size:11.5px; padding:7px 10px;">
      📋 Copy Complete Agent Handoff
    </button>
    <button id="provenance-copy-yaml-btn" class="button button-navy" style="width:100%; justify-content:center; font-size:11px; padding:6px 10px;">
      ⚙ Copy Telemetry (.YAML)
    </button>
    <button id="provenance-lock-admin-btn" class="button button-navy" style="width:100%; justify-content:center; font-size:11px; padding:6px 10px;">
      🔒 Lock Presentation Mode
    </button>
  </div>
</div>
```

---

## 🤖 Successor AI Agent Handoff Protocol
1. **Pre-Edit Transparency**: Present a concise 3-7 bullet summary of intended modifications before modifying source code.
2. **Inspect Complete Context**: Parse both the Markdown narrative handoff and the machine-readable YAML companion.
3. **Preserve Lifecycle & Provenance**: Never erase historical milestones or overwrite authoring/deployment agent attribution.
4. **Reconcile Manifest Digests**: Always re-calculate SHA-256 digests in `release-manifest.json` after the final source edit.
5. **Verify Production Readback**: Query custom domain and live Pages status before declaring tasks complete.
---

## 🔄 Cross-Platform Automatic Synchronization Protocol
Whenever this skill is updated, expanded, or refined by any AI agent or platform (Antigravity, Claude Code, Codex, or Cursor), the modifying agent **MUST unconditionally synchronize** the updated  across all 3 canonical skill locations on the user's system:
1. **Antigravity Global**: 
2. **Claude Code Native**: 
3. **Codex / Cursor / Universal**: 

Running  in the workspace will automatically propagate the newest version across all platforms.
