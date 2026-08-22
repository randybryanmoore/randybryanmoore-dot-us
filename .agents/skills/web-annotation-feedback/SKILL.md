---
name: web-annotation-feedback
description: Universal 100/100 Interactive Annotation, Private Journaling & Build Telemetry Suite for web applications, prototypes, and HTML artifacts. Supports dual-stream feedback (Transient AI Review Queue + Persistent Private Notes), grouped multi-element comment batching, owner-gated presentation controls, live edit mode, and interactive glassmorphic build telemetry with 1-click multi-agent handoffs.
---

# Universal Web Annotation, Private Journaling & Telemetry Suite (100/100 Standard)

Use this skill whenever building, auditing, or refining web applications, prototypes, or executive HTML artifacts where the user wants to visually inspect, pin critique notes, maintain persistent private working memos, or transfer comprehensive build telemetry between AI coding agents (Claude Code, Antigravity, Codex, Cursor).

---

## 🏆 100-Point Architectural Rubric

| Dimension | Points | Standard Specification |
| :--- | :---: | :--- |
| **1. Dual-Stream Note Architecture** | 20 pts | Clear separation between **🚀 AI Review Queue** (transient feedback for prompt generation, auto-reset upon export) and **🔒 Private Notes / Journal** (persistent personal memos, interview talking points, research thoughts; **never deleted or reset on AI export**). |
| **2. Target Precision & Grouped Batching** | 20 pts | Single-element click + multi-element batch selection. Grouped annotations export **one numbered AI comment per saved batch** with all selected elements listed cleanly beneath that single comment. |
| **3. Drawer Management & Search** | 15 pts | Tabbed drawer views (`AI Queue`, `Private Notes`, `All`), live keyword/tag search filter, smooth-scroll spotlight ripple jump-to-element, and badge visibility toggle (`👁️ Badges On/Off`). |
| **4. Owner-Gated Presentation Controls** | 15 pts | Seamless toggle between **`Ready to Present`** (clean client presentation mode with annotation and editor docks hidden) and **`Admin Controls Unlocked`** via a compact 4-digit verification gate. |
| **5. Provenance & Version Breakdown** | 15 pts | Clickable flyout (or `Shift + V`) displaying the active stack, 7-state code lifecycle, cumulative active-block engineering time (`⏱️ 10.6 Hours Logged`), and unclipped inline expandable version cards. |
| **6. Cross-Agent Handoff Interoperability** | 15 pts | **1-Click "📋 Copy Complete Agent Handoff"** and **"⚙ Copy Telemetry (.YAML)"** tools that compile the entire multi-session architecture, sourced claims, design tokens, and work log for instant zero-loss handoffs to Claude Code (`CL`), Codex (`CDX`), Antigravity (`AG`), or Cursor (`CUR`). |

---

## 📦 Zero-Dependency Drop-In Integration

```html
<!-- Interactive Telemetry & Annotation Suite CSS -->
<link rel="stylesheet" href="telemetry-annotation-suite.css">

<!-- Interactive Telemetry & Annotation Suite JS -->
<script src="telemetry-annotation-suite.js" defer></script>
```

### HTML Markup Skeleton

```html
<!-- 1. Interactive Build Telemetry Watermark (Shift+V to inspect) -->
<div class="build-badge" id="build-badge" title="Click to view System Build Telemetry & Agent Handoff (Shift+V)">
  <span class="build-badge-agent" title="Active Agent: Antigravity (AG)">AG</span>
  <span class="build-badge-live-dot" title="Live & Synchronized"></span>
  <span class="build-badge-version">v1.7.1</span>
  <span class="build-badge-sha">#689456d</span>
  <span class="build-badge-date">Aug 20, 2026</span>
</div>

<!-- 2. Precision Element Hover Inspector Highlight Box -->
<div id="inspector-box" class="inspector-highlight-box">
  <span id="inspector-badge" class="inspector-highlight-badge">Element</span>
</div>

<!-- 3. Floating Action Dock -->
<div class="annotation-dock" id="annotation-dock">
  <button class="dock-btn" id="dock-pin-mode-btn" title="Pin AI Review feedback on elements">
    <span>🚀 Pin AI</span>
  </button>
  <button class="dock-btn dock-btn--private" id="dock-private-mode-btn" title="Pin Private Working Notes & Personal Journal">
    <span>🔒 Private Note</span>
  </button>
  <button class="dock-btn" id="dock-live-edit-btn" title="Edit copy directly in place">
    <span>✏️ Live Edit</span>
  </button>
  <button class="dock-btn" id="dock-view-drawer-btn" title="View all pinned notes">
    <span>📁 Notes</span> <span class="dock-badge" id="dock-notes-count">0</span>
  </button>
</div>

<!-- 4. Pinned Annotation Popover -->
<div class="annotation-popover" id="annotation-popover">
  <div class="popover-mode-tabs">
    <button type="button" class="popover-mode-tab active" data-mode="ai">🚀 AI Review</button>
    <button type="button" class="popover-mode-tab" data-mode="private">🔒 Private Note</button>
  </div>
  <div class="popover-header">
    <span class="popover-title">Comment on Element</span>
    <button class="popover-cancel-btn" id="popover-close-btn" aria-label="Close Popover">✕</button>
  </div>
  <div class="popover-target-snippet" id="popover-target-text"></div>
  <div class="popover-tags" id="popover-tags-container"></div>
  <textarea class="popover-textarea" id="popover-comment-input" aria-label="Annotation comment text" placeholder="Type your note or revision... (Press Enter to save)"></textarea>
  <div class="popover-actions">
    <button class="popover-cancel-btn" id="popover-dismiss-btn">Cancel (Esc)</button>
    <button class="popover-pin-btn" id="popover-save-btn">Pin for AI ↵</button>
  </div>
</div>

<!-- 5. Feedback Drawer -->
<div class="feedback-drawer" id="feedback-drawer">
  <div class="drawer-header">
    <div class="drawer-header-tabs">
      <button class="drawer-tab active" data-tab="ai">🚀 AI Queue (<span id="drawer-ai-count">0</span>)</button>
      <button class="drawer-tab" data-tab="private">🔒 Private (<span id="drawer-private-count">0</span>)</button>
      <button class="drawer-tab" data-tab="all">📁 All (<span id="drawer-all-count">0</span>)</button>
    </div>
    <button id="drawer-close-btn" aria-label="Close notes drawer">✕</button>
  </div>

  <div class="drawer-toolbar">
    <input type="text" id="drawer-search-input" aria-label="Filter notes and tags" placeholder="🔍 Filter notes or tags..." class="drawer-search-box">
    <button id="drawer-toggle-badges-btn" class="drawer-tool-btn" title="Show or hide pin badges on the page">👁️ Badges On</button>
  </div>

  <div class="drawer-body" id="drawer-items-list">
    <p style="color: var(--muted); font-size: 13px; font-style: italic;">No feedback pinned yet.</p>
  </div>

  <div class="drawer-footer">
    <div id="drawer-footer-ai-actions" style="display: flex; gap: 8px; width: 100%;">
      <button id="drawer-copy-ai-btn" class="button button-maroon" style="flex: 1; justify-content: center; font-size: 11.5px; padding: 9px 12px;">
        🚀 Copy AI Prompt (Resets Queue)
      </button>
      <button id="drawer-clear-ai-btn" class="button button-navy" style="font-size: 11px; padding: 9px 12px;">
        Clear
      </button>
    </div>
    <div id="drawer-footer-private-actions" style="display: none; gap: 8px; width: 100%;">
      <button id="drawer-export-private-btn" class="button button-maroon" style="flex: 1; justify-content: center; font-size: 11.5px; padding: 9px 12px; background: var(--maroon); color: var(--cream); font-weight: 800;">
        🔒 Copy All Private Notes (Never Deleted)
      </button>
      <button id="drawer-clear-private-btn" class="button button-navy" style="font-size: 11px; padding: 9px 12px;">
        Clear
      </button>
    </div>
  </div>
</div>
```

---

## 🤖 Protocol for Successor AI Agents (Claude / Codex / Antigravity)

When the user pastes prompt feedback generated by this suite (`### Review Notes for [Page Title]`):

1. **Parse Grouped Critique Batches**: Extract `[#ID]`, `[Category]`, `<tag>`, `"targetText"`, and `- **Feedback/Revision**`.
2. **Pre-Edit Transparency**: Present a concise 3-7 bullet summary of intended modifications before editing source code.
3. **Execute Surgical Edits**: Apply exact changes matching each element without altering unreferenced DOM nodes.
4. **Preserve Private Notes & Telemetry**: Ensure `localStorage['*_private_notes']` and watermark metadata remain intact.
5. **Recompile, Bump Version & Sync**: Update build version (`v1.x.x`), recompute SHA-256 digests in `release-manifest.json`, and execute verified CI/CD deployment.
---

## 🔄 Cross-Platform Automatic Synchronization Protocol
Whenever this skill is updated, expanded, or refined by any AI agent or platform (Antigravity, Claude Code, Codex, or Cursor), the modifying agent **MUST unconditionally synchronize** the updated  across all 3 canonical skill locations on the user's system:
1. **Antigravity Global**: 
2. **Claude Code Native**: 
3. **Codex / Cursor / Universal**: 

Running  in the workspace will automatically propagate the newest version across all platforms.
