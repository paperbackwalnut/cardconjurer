# 02 — Refactor Plan

## Target Layout (Reference: ProxyStudio UX shape)

```
┌─────────────────────────────────────────────────────────────────┐
│  TOP BAR: [Import] [Save] [Load ▼]  ···  [Download PNG] [JPEG] │
├──────────────┬──────────────────────────┬───────────────────────┤
│  LEFT PANEL  │     CENTER (canvas)      │    RIGHT PANEL        │
│  (sidebar)   │   sticky card preview    │  (active properties)  │
│              │                          │                        │
│  • Frame     │   [card canvas here]     │  [controls for the    │
│    Layers    │                          │   selected left-panel  │
│  • Frame     │                          │   section]             │
│    Group /   │                          │                        │
│    Pack /    │                          │                        │
│    Search    │                          │                        │
│  ──────────  │                          │                        │
│  • Text      │                          │                        │
│  • Art       │                          │                        │
│  • Set Sym.  │                          │                        │
│  • Watermark │                          │                        │
│  • Collector │                          │                        │
│  ──────────  │                          │                        │
│  • Display   │                          │                        │
│    Options   │                          │                        │
└──────────────┴──────────────────────────┴───────────────────────┘
```

All three panels scroll independently. Canvas stays centered and visible at all times.

---

## Phase 1 — App Shell & Canvas Stickiness (LOW RISK)

**Goal:** The two highest-impact fixes with the least code change: sticky canvas + exposed top-bar actions.

### Changes

**1a. Make the canvas sticky**  
- In `css/style-9.css`, on the `.creator-canvas` rule (and its `@media` block), add:
  ```css
  position: sticky;
  top: 1rem;
  align-self: start;
  ```
- This requires the `.creator-grid` container to have `align-items: start` (already implied by default).
- On narrow (single-column) screens, sticky canvas either pins at top or is skipped (needs testing).

**1b. Add a persistent top action bar to the creator page**  
- In `creator/index.html`, add a new `<div class="creator-topbar">` above `.creator-grid` containing:
  - Save Card button (calls existing `saveCard()`)
  - Load card `<select>` (existing `#load-card-options`, moved/duplicated here)
  - Download PNG button (calls existing `downloadCard()`)
  - Download JPEG link (calls existing `downloadCard(false, true)`)
- The existing buttons/controls in their original locations remain untouched (no deletions).
- Style with a new `.creator-topbar` CSS rule: `display: flex; gap: 0.5rem; padding: 0.5rem 1rem; align-items: center;`

**1c. Make panels scroll independently**  
- Add `max-height: calc(100vh - 4rem); overflow-y: auto;` to `.creator-menu`
- The `.creator-grid` needs `height: 100vh` or similar anchor; test carefully.
- On narrow screens, this should be disabled (single-column scrolls as one page).

### Files Touched
| File | Change type |
|---|---|
| `css/style-9.css` | Add ~10–15 lines of new CSS |
| `creator/index.html` | Add ~10 lines of HTML above `.creator-grid` |

### Risk: 🟢 LOW
- No JS changes
- No rendering/export changes
- No save format changes
- Worst case: revert the 3 CSS properties and remove the HTML block

---

## Phase 2 — Three-Column Layout Restructure (MEDIUM RISK)

**Goal:** Introduce a proper left sidebar for navigation/layers and a right panel for properties, matching the ProxyStudio-style editor shape.

### Changes

**2a. Wrap the creator in a three-column shell**  
- Restructure `.creator-grid` from `[canvas] [menu]` to `[sidebar] [canvas] [properties]`
- New CSS grid: `grid-template-columns: 16rem 750px 1fr`
- Move the tab-navigation labels (Frame, Text, Art, etc.) into the left sidebar as vertical section headings
- Move the tab content panels into the right properties panel

**2b. Surface the frame layer list in the left sidebar**  
- `#frame-list` (the draggable layer list) is currently mid-Frame-tab
- Move it to the left sidebar, always visible regardless of active section
- The JS populating `#frame-list` stays unchanged; only the DOM container moves

**2c. Collapse tutorial into a help link/modal**  
- The Tutorial tab is low-value as a primary tab; demote it to a `?` help link in the top bar
- The iframe content stays, just re-wrapped in a modal or collapsible section

### Files Touched
| File | Change type |
|---|---|
| `css/style-9.css` | Add ~40–60 lines, modify `.creator-grid` media queries |
| `creator/index.html` | Significant structural reorganization (move DOM nodes) |
| `js/creator-23.js` | Possibly update `toggleCreatorTabs()` if selector changes |

### Risk: 🟡 MEDIUM
- HTML restructure may break JS selectors if IDs move — must audit all `document.querySelector` calls against moved elements
- The frame-list drag/drop (`sortable.js`) relies on DOM order — test carefully
- Narrow/mobile layout needs explicit handling

---

## Phase 3 — Section UX Improvements (MEDIUM RISK)

**Goal:** Within the right properties panel, improve UX of individual sections.

**3a. Frame tab: sub-group the frame picker sections**  
- Break the Frame tab into clearly labeled sub-sections with visual separators:
  - "Frame Template" (group/pack/search/load)
  - "Add Frame Images" (picker + add buttons)
  - "Display Options" (guidelines, rounded corners, transparencies)
- Use `<details>`/`<summary>` for collapsible sub-sections, or just clearer headings

**3b. Text tab: text area selector as sidebar-aware**  
- When "Text" section is active in the left sidebar, highlight which text field is selected
- No JS logic change — just visual state CSS

**3c. Art tab: position inputs as inline number+slider combos**  
- Replace plain `<input type="number">` for X/Y/scale with paired slider+number without changing the `oninput` handlers

### Files Touched
| File | Change type |
|---|---|
| `css/style-9.css` | Minor additions |
| `creator/index.html` | HTML restructuring within existing sections |

### Risk: 🟡 MEDIUM
- Collapsible sections may hide content users expect to be visible
- Input type changes need testing to ensure `oninput` still fires correctly

---

## Phase 4 — Workflow & Quality-of-Life (HIGHER RISK — Plan Separately)

These are ideas for future phases that go beyond layout. Do not proceed without explicit approval.

- **Favorites / pinned frames:** Bookmark frequently used frame packs — requires a new localStorage key
- **Card name / type quick-access header:** Display card name + mana cost above the canvas — reads from `card` object
- **Preset text profiles:** Save/load text configurations — new data format
- **Multi-card project view:** Show saved cards in a panel — significant new UI

### Risk: 🔴 HIGH
- Touches card data model and localStorage format
- Requires new JS logic
- Must be approved before planning

---

## Summary Table

| Phase | Focus | Files Touched | Risk |
|---|---|---|---|
| 1 | Sticky canvas, top bar, independent scroll | style-9.css, creator/index.html | 🟢 Low |
| 2 | Three-column layout, layer sidebar | style-9.css, creator/index.html, creator-23.js (minor) | 🟡 Medium |
| 3 | Section UX, input improvements | style-9.css, creator/index.html | 🟡 Medium |
| 4 | Workflow features, presets, multi-card | Multiple + new files | 🔴 High |
