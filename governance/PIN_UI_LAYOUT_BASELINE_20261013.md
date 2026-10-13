# PIN UI Layout Baseline — 2026-10-13

Status: **SUPERSEDED / FREEZE LIFTED by USER**. This document is a historical snapshot only. Its layout values are no longer binding; use current user instructions for subsequent changes.

Historical reference only. The USER withdrew the layout freeze; future changes may revise this arrangement. GitHub `main` is the source of truth. A later task must modify only its named scope and must preserve all unrelated frozen properties. If a layout change is intentional, request USER approval and update this baseline in the same change.

## 1. Visual hierarchy / positioning

- Homepage: Pinterest-like visual gallery. Main surface consists of PIN title, optional user-defined caption, category navigation, and image grid. Research functions remain secondary in upper-right settings.
- Palette: black, white, gray only for interface UI. No colored category or metadata badges. Artwork itself retains its original colors.
- Desktop: `main { max-width: 1580px; padding: 16px 59px 44px; }`; `.grid { margin: 13px -32px 0 -16px; }` (top/right/bottom/left). These are **asymmetric by design**. Leftmost thumbnail is inset 16px relative to the main content edge; rightmost thumbnail remains closer to the window edge. Do not make margins symmetrical without approval.
- PIN title and category bar use the main content alignment (not the grid's offset). The title has optional caption directly beneath it.
- Upper-right magnifier plus settings menu form a single vertically centered toolbar aligned with the **right edge of the gallery**. Desktop `.pin-head-actions { margin-right: -32px; height:40px; }`. Do not position the controls against the title's right edge.
- At widths <=640px, `main` padding is `12px 10px 30px`, toolbar right margin returns to 0, and gallery outer margins return to 0. Responsive rule ownership: `styles/base.css`, `styles/gallery.css`.

## 2. Search and settings

- Frameless icon buttons; magnifier and settings icon align on the same vertical centerline.
- Click magnifier: underlined search field grows **leftward in the same row**, never appears below.
- Desktop open search width: `190px`; mobile width: `min(160px, 38vw)`. Input has only a **1px gray (#999) bottom rule**, including focus. No white box or rounded border.
- Opening **and closing** animate width and flex-basis with `0.28s ease`. Closing must not prematurely set `display:none`, `hidden`, `visibility:hidden`, or zero opacity that makes the field vanish instead of retract.
- Settings contains appearance (editable PIN title, optional caption, favicon), management/trash, advanced filters/backup, catalog stats, and operating instructions. Homepage should not regrow permanent toolbars or long instruction paragraphs.

## 3. Cards, URLs and research disclosure

- Desktop grid uses 5 equal columns, 15px gaps; responsive breakpoints 1330/960/640/355px produce 4/3/2/1 columns.
- Images reside in fixed **3:2** aspect-ratio frames with `object-fit: contain`: do not crop artwork.
- Every title occupies **exactly two lines of vertical space** (`line-height:1.48`, height `2.96em`), including short titles. Longer titles truncate at two lines; full title remains available via hover title.
- Research ID under title; checkbox is shown in management/trash mode for batch action.
- On artwork click, open `showcaseUrl` if present, else the approved source URL. **“來源” is an inline text link, not a full-width clickable blank row**; opens the same destination as the thumbnail.
- The separate **three-dot (···)** control opens/recloses research details. Do not remove this disclosure while simplifying source links. Expanded details currently include associated research source URLs; may gain metadata in a future approved revision.
- Browser-local trash, restore, notes, backups, title/favicon/caption settings, and existing localStorage keys must remain compatible. No public GitHub catalog mutation from viewer clicks.

## 4. Module ownership and change policy

| File | Owns |
| --- | --- |
| `styles/base.css` | page/title/category/search/header alignment |
| `styles/gallery.css` | card grid, aspect ratio, title space, source link, three-dot details |
| `styles/settings.css` | popover, management panel and settings forms |
| `app.js` | catalog, cards, source and detail control events, local client data |
| `site-settings.js` | appearance editor |
| `index.html` | DOM structure, stylesheet/script imports, auxiliary research area |

- Modify an **existing owner**, not another late CSS override block. Avoid new `!important` rules and unowned CSS.
- Keep implementation and this specification consistent. If two CSS selectors conflict, consolidate them rather than stacking another layer.
- Existing auxiliary private research section in `index.html` currently has inline style/script; this is acknowledged remaining work, **not** part of the frozen gallery layout, and should be extracted in a separate explicit task.
- Do not modify `catalog/entries.json` for UI-only work.
- Before merging further work, check: right toolbar/gallery edge, desktop asymmetric margins, mobile overflow, search two-way animation, 3:2 image containment, two-line card alignment, source-only hitbox, details expand/collapse, three category choices, trash restore and local settings.
- **Verification distinction:** code-level values are verified from GitHub as of this checkpoint; visual confirmation in actual browser is still pending. Never claim browser acceptance unless tested.

## 5. Frozen technical reference

Read the current `main` state in `thedoorw/PIN`; do not reuse historical CSS snapshots. Current checkpoint was reviewed on 2026-10-13 after header alignment and card disclosure adjustments. A later commit changing only this governance document does not change the UI itself.
