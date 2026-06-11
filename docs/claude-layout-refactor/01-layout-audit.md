# 01 — Layout Audit

## Current Layout Behavior

### Shell (all pages)
- Fixed `<header>` with site title "CARD CONJURER" — full-width bar
- Hamburger menu (top-left SVG icon) opens a slide-in `.menu` overlay with nav links
- `<div id="content">` is the HTMX swap target — page content loads here
- No sticky toolbar or action bar at the top for the editor

### Creator Page Grid

**Narrow screens (< 1250px): single column**
```
[canvas — full width, max 750px, centered]
[menu — full width]
```

**Wide screens (≥ 1250px): two columns**
```
[canvas 750px fixed] [menu — fills remaining width]
```

CSS rule (style-9.css ~line 753):
```css
@media only screen and (min-width: 1250px) {
  .creator-grid {
    grid-template-columns: 750px auto;
  }
}
```

The canvas is NOT sticky. It scrolls out of view when the menu content is taller than the viewport (which it always is). On wide screens, both columns start at the top and scroll together as one page.

---

## Where Things Currently Live

| Element | Current Location |
|---|---|
| Card preview canvas | Left column of `.creator-grid` (top on mobile) |
| Frame selection (group/pack/version) | "Frame" tab |
| Frame image picker + mask picker | "Frame" tab |
| Frame layer list (reorderable) | "Frame" tab |
| Custom frame upload | "Frame" tab |
| Display options (guidelines, rounded corners, transparencies) | "Frame" tab (bottom) |
| Auto-frame selector | **Below all tabs**, always visible in `.creator-menu` |
| Text area selector | "Text" tab |
| Text editor (textarea) | "Text" tab |
| Text code reference | "Text" tab (collapsed) |
| Add textbox buttons | "Text" tab |
| Art upload / URL / Scryfall | "Art" tab |
| Art position/scale/rotate | "Art" tab |
| Set symbol upload/fetch | "Set Symbol" tab |
| Set symbol position/scale | "Set Symbol" tab |
| Watermark selector | "Watermark" tab |
| Watermark color/opacity | "Watermark" tab |
| Collector info (number, set, etc.) | "Collector" tab |
| Serial number | "Collector" tab |
| **Save card** | "Import/Save" tab |
| **Load saved card** | "Import/Save" tab |
| Import by card name (Scryfall) | "Import/Save" tab |
| Download saved cards file | "Import/Save" tab |
| **Download card (export PNG)** | **Below all tabs**, always visible at the very bottom of `.creator-menu` |
| Download as JPEG | Same location, small link below the big Download button |
| Tutorial video | "Tutorial" tab |
| Frame image editor (popup) | Fixed position modal, shown on demand |
| Textbox bounds editor (popup) | Fixed position modal, shown on demand |

---

## Biggest Layout / UX Pain Points

### 1. Canvas scrolls away immediately (most critical)
The preview canvas is not sticky. On any real content, the user scrolls down into the menu controls and loses sight of the card. You are editing blind. This is the single biggest usability problem and the starkest difference from a design-editor experience.

**Type: Layout-only** — can be fixed with `position: sticky` on the canvas, no logic changes.

### 2. Download/Export buried at the bottom
The primary action — downloading the finished card — is at the very bottom of the `.creator-menu` div, below every tab's content. On a long frame tab session, it requires significant scrolling or the user must know it exists there. There is no persistent toolbar with export/save actions.

**Type: Layout-only** — moving or duplicating the download button into a fixed top bar requires no logic changes; the existing `downloadCard()` call stays.

### 3. Save / Load is hidden inside a tab
"Import/Save" is one of 8 tabs, visually equal in weight to "Tutorial". Users may not find save/load until they need it. There's no persistent save indicator or project state visible at any time.

**Type: Layout-only** — exposing save/load in a top bar or sidebar header is a CSS/HTML restructuring task; `saveCard()` / `loadCard()` logic is untouched.

### 4. Eight flat tabs competing for equal space
The tab bar has 8 entries (Frame, Text, Art, Set Symbol, Watermark, Collector, Import/Save, Tutorial) all displayed as equal-weight, auto-fit grid cells. They wrap on medium screens and can become hard to read. There's no visual hierarchy — "Frame" (most complex, most visited) looks identical to "Tutorial" (rarely used).

**Type: Layout + minor HTML** — can be improved by grouping tabs, using icons, or reorganizing into sidebar sections.

### 5. Frame tab is massively overloaded
The "Frame" tab alone contains: frame group selector, frame pack selector, search box, load button, frame image picker, mask picker, add-to-card buttons, frame layer list (reorderable), custom upload, and display options (guidelines, rounded corners, transparencies). It is effectively 5 separate workflow sections collapsed into one tab with no sub-grouping beyond collapsible headings.

**Type: Layout + HTML restructuring** — sections could be split into a left sidebar list (layers) and properties panel without touching JS logic.

---

## Issue Classification

| Issue | Layout-only? | Notes |
|---|---|---|
| Canvas not sticky | ✅ Yes | Pure CSS `position: sticky` fix |
| Download buried | ✅ Yes | HTML restructure + CSS, no JS needed |
| Save/Load hidden | ✅ Yes | HTML restructure only |
| Tab bar overcrowded | ✅ Mostly | Icon labels = HTML-only; regrouping = HTML restructure |
| Frame tab overloaded | ✅ Mostly | Splitting into left/right panels = HTML restructure + CSS |
| No top action bar | ✅ Yes | New HTML wrapper + CSS |
| Panels don't scroll independently | ✅ Yes | CSS `overflow-y: auto` + height constraints |
| No layer/structure sidebar | ⚠️ HTML+JS | Frame list already exists; surfacing it needs JS awareness of which tab is active |
| Mobile layout collapses to single col | ✅ Yes | Responsive CSS improvement |
