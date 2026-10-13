# PIN Front-end UI modules

- `index.html`: document structure only; no cumulative inline CSS.
- `styles/base.css`: global typography, site header, navigation and reversible search.
- `styles/gallery.css`: 3:2 contain images, stable two-line titles, card details and responsive grid.
- `styles/settings.css`: settings popover, visual preferences, management and backup controls.
- `site-settings.js`: public/local title, caption and favicon settings; existing localStorage key preserved.
- `app.js`: catalog fetching, annotations, browser-local trash, rendering and control events. Retained pending later logic modularization to avoid breaking existing data workflows.

Avoid inline or late cascading overrides. Modify the owning stylesheet instead. Preserve `catalog/entries.json` and localStorage keys. HTML load order: base → gallery → settings. Follow up with browser checks for header alignment, open/close search, settings, cards, categories, batch delete/restore, mobile layout and local appearance edits.
