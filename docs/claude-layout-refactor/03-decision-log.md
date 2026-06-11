# 03 — Decision Log

## Decisions Made

### 2026-06-11 — Phase 1 implemented
**Decision:** Phase 1 changes are exactly:
1. `css/style-9.css` — new labeled block at end of file: `.creator-topbar`, `.creator-topbar .input`, `.creator-topbar-label`, and a `@media (min-width: 1250px)` block adding `position: sticky` to `.creator-canvas` and `max-height + overflow-y: auto` to `.creator-menu`.
2. `creator/index.html` — new `<div class='creator-topbar readable-background'>` with Save Card, Download PNG, and Download JPEG buttons, inserted immediately above `.creator-grid`.

**Load Card omitted from topbar:** `loadCard(value)` requires a card-key string sourced from the `#load-card-options` `<select>` (populated by JS at runtime). Duplicating the select element without duplicating its population logic would create a broken empty dropdown. Load remains accessible only in the Import/Save tab. No new logic was added.

**JPEG in topbar included:** `downloadCard(false, true)` already existed on line 791 of `creator/index.html`. It is a pre-existing function — no new behavior.

**No changes to `creator-23.js`** — confirmed, not touched.

**Revert instructions:** Remove the CSS block after the `/* Phase 1 Layout Refactor */` comment in `style-9.css`, and remove the `<div class='creator-topbar ...'>` block in `creator/index.html`. Both are clearly labeled.

### 2026-06-11 — Phase 1.1: removed independent menu scroll (CSS-only fix)
**Decision:** Removed `max-height: calc(100vh - 3rem)` and `overflow-y: auto` from the `.creator-menu` rule inside the `@media (min-width: 1250px)` block in `style-9.css`.

**Reason:** `overflow-y: auto` on `.creator-menu` creates a new block formatting context that clips `position: absolute` descendants. The frame-search autocomplete (`.autocomplete-items`, `position: absolute; z-index: 99`) is a descendant of `.creator-menu`. With overflow clipping active, the dropdown would be cut off at the menu boundary — a regression in existing functionality.

**What remains from Phase 1:**
- `.creator-canvas { position: sticky; top: 1rem; align-self: start }` at `≥1250px` — keeps preview visible while editing ✅
- `.creator-topbar` styles and HTML — quick-access Save/Download bar ✅

**What is deferred to Phase 2:**
- Independent right-panel scroll — requires restructuring the autocomplete element (and potentially other absolute-positioned UI) outside the scrollable container, or rearchitecting as a true three-column layout where each column is an independent scroll context from the start.

### 2026-06-11 — Audit scope: creator page only
**Decision:** The refactor targets `creator/index.html` and `css/style-9.css` only. Other pages (print, askurza, phyrexian, theme, gallery) are out of scope.  
**Rationale:** The goal is editor UX. Other pages don't share the creator layout. Any shared CSS changes must not regress the other pages.

### 2026-06-11 — No framework introduction
**Decision:** Do not introduce React, Vue, Svelte, or any other component framework.  
**Rationale:** Hard constraint from project brief. The app is vanilla HTML/CSS/JS; a framework rewrite would be a full rewrite, not a layout refactor.

### 2026-06-11 — Preserve all existing IDs and function signatures
**Decision:** All element `id` attributes that are referenced by `creator-23.js` must remain in the DOM with the same IDs, even if the elements are moved to new positions in the HTML.  
**Rationale:** `creator-23.js` uses extensively `document.querySelector('#some-id')` and `getElementById('some-id')`. Moving a node is safe; removing or renaming its ID would break rendering. A full ID audit must precede any HTML structural changes.

### 2026-06-11 — No localStorage format changes
**Decision:** The shape of the JSON saved to `localStorage` for cards must not change.  
**Rationale:** Users have existing saved cards. Breaking the format would silently corrupt or lose their saved work.

### 2026-06-11 — Phase 1 does not delete anything
**Decision:** Phase 1 only adds new CSS and new HTML. The download button, save button, and load select that exist in their original tab locations remain there. The top bar adds duplicates/shortcuts.  
**Rationale:** Keeps Phase 1 trivially reversible. If the top bar approach doesn't feel right, remove the added HTML block and the 3 CSS lines — everything is back to baseline.

---

## Rejected Approaches

### Extract creator-23.js into modules
**Rejected because:** The file is 5017 lines of tightly coupled imperative code. Splitting it risks introducing bugs in rendering. Not a layout concern. Not in scope.

### Introduce a CSS preprocessor (SCSS/Less)
**Rejected because:** Adds a build step. Hard constraint is no new dependencies without approval.

### Use CSS Grid subgrid for the three-column layout
**Considered:** Modern CSS subgrid would be elegant. Deferred to Phase 2 planning — browser compatibility needs verification for the target audience, and it's not needed for Phase 1.

### Move canvas to a fixed overlay
**Rejected because:** A `position: fixed` canvas would overlap content on mobile/narrow screens and interfere with the existing drag-to-reorder art interaction. `position: sticky` achieves the "stays visible while scrolling" goal without these side effects.

### Reorder the HTML so canvas comes last in DOM order
**Rejected because:** On narrow screens, the canvas must appear above the menu (current DOM order is correct for mobile). Reordering to put canvas last would require CSS `order` hacks that add complexity. Keep DOM order as-is; use `sticky` instead.

---

## Things Intentionally Avoided

- **Touching `drawCard()` or `downloadCard()`** — any change there affects card output quality/format, which is out of scope.
- **Touching any file under `data/scripts/versions/`** — these are the per-frame rendering scripts. Even a comment change is a risk vector.
- **Touching `js/frames/pack*.js` files** — frame pack definitions drive canvas layout. Layout-only work has no reason to touch these.
- **Changing the `card` state object structure** — it is used by dozens of functions across `creator-23.js` and the version scripts.
- **Adding `class` or `id` attributes to elements that creator-23.js queries by tag name** — some selectors are broad (`document.querySelectorAll('.input')`); adding classes must not accidentally match those.
- **Changing event handlers on existing inputs** — `oninput`, `onchange`, `onclick` attributes on existing elements must be preserved exactly.
