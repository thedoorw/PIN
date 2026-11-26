# PIN — GitHub Pages

PIN is a static website hosted from this repository. The public source includes its UI, catalog, browser-side Google integration, site settings, and source verification.

**Privacy boundary:** This repository, every public branch, and published Pages assets are publicly readable. Personal notebooks, original conversations, unpublished manuscripts, Google credentials, and private Drive contents belong outside this repository. A Google file ID or OAuth client ID in public source is not a permission grant; Google Drive/Sheets access is enforced by Google authorization and file ACLs.

## Website

- [PIN on GitHub Pages](https://thedoorw.github.io/PIN/)
- [Entry page](./index.html)
- [Public catalog](./catalog/entries.json)
- [Public site settings](./config/site.json)

## Files needed for the site

| Path | Role |
| --- | --- |
| `index.html`, `app.js` | Page entry, catalog display, and interaction |
| `styles/`, `assets/favicon.svg` | Styles and favicon |
| `catalog/entries.json` | Public entries displayed by PIN |
| `research-sheet.js` | Browser-side Google Sheets integration |
| `site-settings.js`, `config/site.json` | Public site settings |
| `.nojekyll` | GitHub Pages static hosting |
| `tools/verify.mjs` | Source and catalog regression check |

There is no required build step. For a local browser preview, serve the repository from an HTTP origin rather than opening `index.html` through `file://`, because the catalog is loaded with `fetch`.

## Verification and publication

Run `node tools/verify.mjs` before proposing a change. Website publishing uses **GitHub Pages → Deploy from a branch → `main` / root**.

Unmerged work is tracked separately:

- [Draft PR #7](https://github.com/thedoorw/PIN/pull/7): notebook UI candidate.
- [Draft PR #9](https://github.com/thedoorw/PIN/pull/9): private Google Drive read-only preview candidate.

These drafts do not imply changes are already published or accepted. Private Google files remain restricted to authorized Google accounts; no public file or page must contain their content or tokens.
