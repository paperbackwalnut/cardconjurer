# 08 — New Creator UI: Proposed Architecture

## Design Principles

1. **Shell around the engine** — `creator-23.js` is included unchanged. The new HTML is just a better container.
2. **Same IDs, new positions** — every required input ID lives in the new layout, just in a more logical place.
3. **Three independent scroll columns** — left sidebar, right panel each scroll independently; center canvas stays sticky.
4. **Selection-driven right panel** — clicking a section in the left sidebar shows the relevant controls in the right panel.
5. **No hidden state** — what you see in the left sidebar reflects the card's actual layer/section structure.

---

## Layout Structure

```
┌──────────────────────────────────────────────────────────────────────┐
│  .cc-topbar                                                           │
│  [Card name (read)] [New] [Save] [Load ▼] [Import]  [PNG] [JPEG]    │
├──────────────────┬───────────────────────┬───────────────────────────┤
│  .cc-sidebar     │  .cc-canvas-area      │  .cc-panel                │
│  (left)          │  (center)             │  (right)                  │
│                  │                       │                           │
│  ▸ Frames        │   [card preview]      │  [controls for active     │
│    Layer list    │   sticky canvas       │   sidebar section]        │
│    (draggable)   │                       │                           │
│  ──────────────  │                       │                           │
│  ▸ Frame Pack    │                       │                           │
│  ▸ Text          │                       │                           │
│  ▸ Art           │                       │                           │
│  ▸ Set Symbol    │                       │                           │
│  ▸ Watermark     │                       │                           │
│  ▸ Collector     │                       │                           │
│  ──────────────  │                       │                           │
│  ▸ Auto Frame    │                       │                           │
│  ▸ Display       │                       │                           │
│  ──────────────  │                       │                           │
│  ▸ Save / Load   │                       │                           │
│  ▸ Import        │                       │                           │
└──────────────────┴───────────────────────┴───────────────────────────┘
```

---

## 1. Top Bar (`.cc-topbar`)

**Purpose:** Project/card-level actions, always visible. Never requires scrolling.

**Contents:**
- Card name display (read from `card.text.title.text` — cosmetic, updated by JS hook)
- **New** — resets card state (calls `resetCardIrregularities()`)
- **Save** → `saveCard()`
- **Load** → `<select id='load-card-options'>` (the existing populated dropdown, styled inline)
- **Import** — jumps sidebar to Import section
- **Download PNG** → `downloadCard()`
- **Download JPEG** → `downloadCard(false, true)`

**CSS:** `position: sticky; top: 0; z-index: 20;` so it stays pinned as the page (or inner panels) scroll.

**Notes:** No new JS needed. `#load-card-options` is placed directly in the topbar. The same ID, the same `onchange='loadCard(this.value)'`. Engine is unaware anything changed.

---

## 2. Left Sidebar (`.cc-sidebar`)

**Purpose:** Card structure navigation — what the card *is* (layers, sections). Not a settings form; a navigator.

**Scroll behavior:** `overflow-y: auto; height: 100%;` — scrolls independently within the 3-column layout.

### Section A: Frame Layers
```
FRAME LAYERS                      [+]
┌─────────────────────────────────────┐
│ ▦ White Frame      ···  [×]         │  ← #frame-list children live here
│ ▦ Pinline (m15)    ···  [×]         │    (draggable, existing DOM, unchanged)
│ ▦ Title (m15)      ···  [×]         │
└─────────────────────────────────────┘
```
- `#frame-list` is placed here directly — the engine's `addFrame()` appends to it as always
- The `[+]` button jumps sidebar focus to the Frame Pack section for adding frames

### Section B: Navigation sections (click to activate right panel)

```
─ FRAME PACK ──────────────────── ▸
─ TEXT ─────────────────────────── ▸
─ ART ──────────────────────────── ▸
─ SET SYMBOL ───────────────────── ▸
─ WATERMARK ────────────────────── ▸
─ COLLECTOR INFO ───────────────── ▸
─ AUTO FRAME ───────────────────── ▸
─ DISPLAY OPTIONS ──────────────── ▸

─ SAVE / LOAD ──────────────────── ▸
─ IMPORT ───────────────────────── ▸
```

Clicking a section label activates that section's controls in the right panel (`.cc-panel`). One section is active at a time. The active indicator (highlighted row) replaces the old tab-strip.

**Implementation:** A new `activateSection(name)` function (small, new JS in the new shell only) that shows/hides `.cc-panel-section` divs. This replaces `toggleCreatorTabs()`. The old function can remain in `creator-23.js` unused; no conflict.

---

## 3. Center Canvas Area (`.cc-canvas-area`)

**Purpose:** The card preview. Always visible, sticky.

**Contents:**
- `<canvas id='previewCanvas'>` — same ID, same attributes, same sizing
- Possibly a thin label below showing card name + dimensions (cosmetic only)

**CSS:**
```css
.cc-canvas-area {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 1rem;
}
#previewCanvas {
    position: sticky;
    top: calc(topbar-height + 1rem);
    align-self: start;
    max-width: 100%;
    height: auto;
}
```

The canvas column has `overflow: visible` — no clipping. The sticky works relative to the page scroll.

---

## 4. Right Panel (`.cc-panel`)

**Purpose:** Settings/properties for the currently active left-sidebar section. Context-sensitive.

**Scroll behavior:** `overflow-y: auto; height: 100%;` — scrolls independently.

**Key insight:** the autocomplete dropdown issue from Phase 1.1 is solved here by architecture. The frame search autocomplete (`.autocomplete-items`, `position: absolute`) is inside `.cc-panel`. The panel has `overflow-y: auto`. The autocomplete would still be clipped.

**Fix:** Move the `.autocomplete` outside `.cc-panel`, into the left sidebar (where it lives near the frame search input, which is in the Frame Pack section of the sidebar). Or use `position: fixed` for the autocomplete — the frame search is stable enough for this.

Actually the cleanest fix for Phase A: put the frame search (`#frameSearch` / `.autocomplete`) in the **sidebar** (Frame Pack section), where it serves as a search tool. Since the sidebar won't have `overflow: hidden` set (it'll have `overflow-y: auto` on a container above it), the autocomplete can use `position: absolute` and will clip at the sidebar boundary, which is fine — the sidebar is wide enough to show it.

**Panel sections (one shown at a time):**

```
.cc-panel-section[data-section="frame-pack"]     ← frame group/pack/version/picker/upload
.cc-panel-section[data-section="text"]           ← text area selector, textarea, formatting
.cc-panel-section[data-section="art"]            ← art upload, position inputs
.cc-panel-section[data-section="set-symbol"]     ← set symbol upload, position inputs
.cc-panel-section[data-section="watermark"]      ← watermark picker, colors, position
.cc-panel-section[data-section="collector"]      ← collector info inputs, serial number
.cc-panel-section[data-section="auto-frame"]     ← auto-frame dropdown
.cc-panel-section[data-section="display"]        ← guidelines, rounded corners, transparencies
.cc-panel-section[data-section="save-load"]      ← save/load/delete/download saved cards
.cc-panel-section[data-section="import"]         ← Scryfall import, paste card text
.cc-panel-section[data-section="tutorial"]       ← video
```

All existing input IDs are preserved exactly. The content of each section is largely copied from the existing `creator/index.html`, with new wrapper divs and CSS but no changed IDs or event handlers.

---

## 5. Optional: Status / Info Strip

A thin horizontal strip below the canvas (not a panel) showing:
- Current frame version loaded (reads `card.version`)
- Canvas dimensions
- Save status (unsaved indicator)

This is purely cosmetic and can be Phase C or later. No JS coupling.

---

## 6. Selected Section / Layer State

### How section selection works:

```js
// In new shell JS only (not creator-23.js)
function activateSection(name) {
    document.querySelectorAll('.cc-sidebar-item').forEach(el => el.classList.remove('cc-active'));
    document.querySelector(`.cc-sidebar-item[data-section="${name}"]`).classList.add('cc-active');
    document.querySelectorAll('.cc-panel-section').forEach(el => el.classList.add('hidden'));
    document.querySelector(`.cc-panel-section[data-section="${name}"]`).classList.remove('hidden');
}
```

This is ~8 lines of new JS in a small `creator-v2.js` file. It does not touch `creator-23.js`.

### Frame layer selection:

Clicking a layer in `#frame-list` already calls `frameElementClicked()` which opens the modal editor. No change needed. In a later phase (Phase C), clicking a layer could also activate a "selected frame" overlay in the right panel.

---

## 7. How Existing Controls Are Reused

The existing HTML from `creator/index.html` is **copy-moved** into the new structure. Each panel section receives the content of the corresponding old tab, with:

1. Wrapper `<div>` changed from `id='creator-menu-frame'` to `class='cc-panel-section' data-section='frame-pack'`
2. The inner markup (inputs, labels, buttons) is **identical** to the old tab
3. The input IDs, `oninput`/`onchange`/`onclick` attributes are **unchanged**
4. The old `<h5 class='input-description'>` labels are kept (can be restyled without ID changes)

This means zero regression risk for the controls themselves. They work because the engine doesn't care about their wrapper structure.

---

## 8. CSS / Layout Structure

### New classes (all prefixed `cc-` to avoid collisions)

```css
/* Three-column app shell */
.cc-app {
    display: grid;
    grid-template-rows: auto 1fr;    /* topbar + content row */
    grid-template-columns: 220px minmax(0, 700px) 1fr;
    height: 100vh;
    overflow: hidden;                /* The app fills the viewport; panels scroll internally */
}
.cc-topbar {
    grid-column: 1 / -1;            /* spans all columns */
    position: sticky;
    top: 0;
    z-index: 20;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
}
.cc-sidebar {
    overflow-y: auto;
    height: 100%;
    border-right: 1px solid #0004;
}
.cc-canvas-area {
    overflow-y: auto;
    display: flex;
    justify-content: center;
    padding: 1rem;
}
.cc-panel {
    overflow-y: auto;
    height: 100%;
    border-left: 1px solid #0004;
}

/* Responsive: collapse to single column below 1100px */
@media (max-width: 1100px) {
    .cc-app {
        grid-template-columns: 1fr;
        grid-template-rows: auto auto auto auto;
        height: auto;
        overflow: visible;
    }
    .cc-topbar, .cc-sidebar, .cc-canvas-area, .cc-panel {
        height: auto;
        overflow: visible;
    }
}
```

### Autocomplete fix for the new layout

Since `.cc-panel` uses `overflow-y: auto`, the frame-search autocomplete must not be inside `.cc-panel`. The frame search input is placed in the **left sidebar** (Frame Pack section button area or a search bar at the top of the sidebar). The sidebar is narrower but the autocomplete can be `position: fixed` or placed at the top of the sidebar where it won't be clipped by the panel boundary.

Alternatively: `.cc-panel` can use `overflow-y: auto` but the `.autocomplete-items` uses `position: fixed` with coordinates calculated by JS. This is a small targeted change in `frameSearch.js` (not `creator-23.js`).

### What happens to old CSS classes

All existing `style-9.css` classes continue to apply to the moved input elements (`.input`, `.input-grid`, `.readable-background`, `.drop-area`, etc.). The new `cc-*` classes layer on top. No existing classes are removed.
