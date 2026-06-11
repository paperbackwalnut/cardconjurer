# 00 — Project Map

## Tech Stack

| Layer | Detail |
|---|---|
| Framework | None — vanilla HTML/CSS/JS |
| Navigation | [HTMX](https://htmx.org/) (`js/htmx.min.js`) — loads page fragments into `#content` div |
| Styling | Single plain CSS file with CSS custom properties for theming |
| Canvas | Native `<canvas>` API (2D context) |
| Persistence | `localStorage` (cards + settings) |
| Build | None — static files served directly (Nginx via Docker or Python launcher) |

---

## Directory Structure

```
cardconjurer/
├── index.html              # Home page (SPA shell + home content)
├── css/
│   ├── reset.css           # CSS reset
│   └── style-9.css         # ALL site styles (994 lines)
├── js/
│   ├── main-1.js           # Site navigation, hamburger menu
│   ├── themes.js           # Theme variable loading
│   ├── creator-23.js       # ⚠️ ALL creator logic (5017 lines) — HIGH RISK
│   ├── autoFrame.js        # Auto-frame selection helper
│   ├── frameSearch.js      # Frame search autocomplete
│   ├── htmx.min.js         # HTMX library
│   ├── qrious.min.js       # QR code generation
│   ├── themeEditor.js      # Theme editor page logic
│   └── frames/             # Frame pack definitions (~150 files)
│       ├── group*.js       # Frame group loaders (e.g. groupStandard-3.js)
│       ├── pack*.js        # Individual frame packs (e.g. packM15Regular.js)
│       └── version*.js     # Special version helpers
├── data/
│   └── scripts/
│       ├── localStorage.js     # Theme/palette persistence
│       ├── localCardStorage.js # (Legacy) card save/load helpers
│       ├── animations.js       # Page animations
│       ├── footer.js           # Footer injection
│       ├── lazyLoadSamples.js  # Home page lazy image loading
│       ├── sortable.js         # Drag-to-reorder frame list
│       └── versions/           # ⚠️ Card rendering version scripts — HIGH RISK
│           ├── m15/            # M15 era frame rendering
│           ├── expedition/     # Expedition rendering
│           ├── saga/           # Saga rendering
│           └── ... (many more)
├── creator/
│   └── index.html          # Card creator page content (loaded via HTMX)
├── print/
│   └── index.html + print.js   # Print/layout tool
├── globalHTML/
│   ├── header.html         # Shared header fragment
│   └── footer.html         # Shared footer fragment
├── theme/
│   └── index.html          # Theme editor page
├── img/                    # Frame images, watermarks, UI images
├── fonts/                  # Card/UI fonts
└── local_art/              # (Local only) user-uploaded art storage
```

---

## Main Routes / Pages

| Route | Content File | Description |
|---|---|---|
| `/` | `index.html` | Home / marketing page |
| `/creator` | `creator/index.html` | **Card editor** (main subject of this refactor) |
| `/print` | `print/index.html` | Printing/layout tool |
| `/askurza` | `askurza/index.html` | Rules Q&A tool |
| `/phyrexian` | `phyrexian/index.html` | Phyrexian text generator |
| `/theme` | `theme/index.html` | Theme / color palette editor |
| `/gallery` | `gallery/index.html` | Community card gallery |
| `/about` | `about/index.html` | About page |
| `/legal` | `legal/index.html` | Legal page |

Navigation loads pages via HTMX into `<div id="content">`. The shell (`index.html`) contains the header, hamburger menu, and notification area.

---

## Main Editor / Layout Components (creator/index.html)

All editor markup lives in `creator/index.html`. It is a single HTML fragment (no components/templating) with this structure:

```
.main-content
  ├── #frame-element-editor        Modal popup: per-frame image editing (opacity, HSL, masks, etc.)
  ├── #textbox-editor              Modal popup: textbox bounds editor
  └── .creator-grid                Main 2-column grid (canvas + menu)
      ├── canvas#previewCanvas     Card preview canvas (left col on wide screens)
      └── .creator-menu            All controls (right col on wide screens)
          ├── .creator-menu-tabs   Tab row: Frame | Text | Art | Set Symbol | Watermark | Collector | Import/Save | Tutorial
          └── #creator-menu-sections
              ├── #creator-menu-frame       Frame tab content
              ├── #creator-menu-text        Text tab content
              ├── #creator-menu-art         Art tab content
              ├── #creator-menu-setSymbol   Set Symbol tab content
              ├── #creator-menu-watermark   Watermark tab content
              ├── #creator-menu-bottomInfo  Collector info tab content
              ├── #creator-menu-import      Import/Save tab content
              └── #creator-menu-tutorial    Tutorial tab content
          [below tabs, always visible in .creator-menu]
          ├── AutoFrame dropdown
          └── Download buttons (PNG, JPEG, Alt)
```

Key JS file: `js/creator-23.js` — all creator logic in a single 5017-line file, including:
- Card state object (`card`)
- Canvas drawing (`drawCard()`)
- Export (`downloadCard()`)
- Save/load (`saveCard()`, `loadCard()`)
- Tab switching (`toggleCreatorTabs()`)
- Art/frame/text/watermark editing functions
- Drag-to-reorder frame list
- Scryfall API integration

---

## Rendering / Export — HIGH RISK Files

> **Do not touch these files for layout work. Any change here affects card output.**

| File | Risk | What it does |
|---|---|---|
| `js/creator-23.js` | 🔴 CRITICAL | `drawCard()` and `downloadCard()` — all canvas rendering |
| `data/scripts/versions/*/` | 🔴 CRITICAL | Per-frame version rendering: text layout, mana symbols, planeswalker loyalty, etc. |
| `js/frames/pack*.js` | 🟠 HIGH | Frame pack definitions — load images, set canvas dimensions, trigger re-render |
| `js/frames/version*.js` | 🟠 HIGH | Special version helpers (planeswalker, saga, dungeon, etc.) |
| `js/autoFrame.js` | 🟡 MEDIUM | Auto-selects frame based on card type — triggers re-renders |

---

## State / Data — Do Not Change Casually

| Location | What it holds |
|---|---|
| `card` object (in memory, `creator-23.js`) | All current card data: art, frames[], texts[], watermark, setSymbol, version, etc. |
| `localStorage['cardKeyList']` | Array of saved card name keys |
| `localStorage[cardName]` | Serialized card JSON per saved card |
| `localStorage['colorPalette']` | Current theme name |
| CSS custom properties (`:root`) | Live theme values (set by palette JS files) |

The save format (localStorage JSON) must not change without an explicit migration strategy.
