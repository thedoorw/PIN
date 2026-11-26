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

## PIN UI Master — preview-first design workflow

PIN uses the **INK UI Master principle**: discuss and accept a real, browser-operable design draft **before** changing the live GitHub Pages website. Keep one current UI Master for desktop and mobile; do not treat an unapproved preview as a released feature.

1. **Isolate the draft.** Start a dedicated `preview/pin-ui-master-*` branch from the latest `main`. Do not alter or deploy `main` during design iterations. One evolving branch and its Draft PR/Issue are enough; do not open a new PR for every small visual adjustment.
2. **Design with future site sources.** Prefer editing the real HTML/CSS/JavaScript structure on that branch, not creating a separate mockup that must later be manually rebuilt. The initial design language is **HEAD = notebook cover**, **BODY = open split-screen notebook**, **FOOT = back cover**. These are three page scenes, not merely top/middle/bottom bars. The BODY has independently scrollable, independently switchable left and right panes. Visual acceptance includes coordinated cover/back typography, fine rules, small labels, restrained color, flexible interior templates, responsive layouts, and A4 landscape print treatment.
3. **Share an immutable browser preview.** Following INK's documented method, open the committed public HTML through RawGitHack, for example `https://raw.githack.com/thedoorw/PIN/<full-commit-sha>/index.html`. Use the **full commit SHA**, check that relative CSS/JS/data assets load and interactions work, and give USER the tested fixed-version URL. Each revision produces a new fixed-version URL. RawGitHack is a third-party public preview, **not** PIN Pages deployment.
4. **Verify before visual review.** Check source/links and `node tools/verify.mjs` when applicable; operate the actual browser draft (including independent scrolling and content switching), check desktop/mobile presentation and print only when tested, and report PASS / FAIL / NOT_RUN honestly. **USER visual approval** is a separate required gate.
5. **Keep private integrations out of the draft.** Use public or fictitious placeholder content; never put personal conversations, private Drive files, Google tokens or credentials in the public branch or RawGitHack preview. Google OAuth/Docs/Drive/Sheets owner-account behavior requires its own authorized-origin, permission and browser acceptance checks.
6. **Integrate only after approval.** Preserve the accepted commit SHA and design decision in the Draft PR/Issue. With USER authorization, integrate the checked site sources into `main`, verify the Pages deployment and live behavior separately, and keep an ordinary revert path. Preview PASS does not imply Google OAuth PASS or live Pages PASS.

**Architecture / template distinction:** One UI Master means one shared design language and interaction contract, **not** one fixed page template. Keep Architecture (HEAD cover / BODY independent split-screen leaves / FOOT back cover), Mechanisms (navigation, scrolling, print), interchangeable Templates, and a future owner-controlled authoring/backend layer distinct. Templates can have their own revisable visual drafts while sharing the same code and behavior; owner configuration and private Google integration are future work, not present draft functionality. The first recorded architecture and visual candidate are [PIN Issue #11](https://github.com/thedoorw/PIN/issues/11) and [Draft PR #12](https://github.com/thedoorw/PIN/pull/12); verify their current status before continuing.

This separates **design acceptance** from **runtime integration** without introducing a second long-lived UI implementation. It is the handoff rule for future PIN design sessions, not an authorization to create a branch or publish a redesign.

## Verification and publication

Run `node tools/verify.mjs` before proposing a change. Website publishing uses **GitHub Pages → Deploy from a branch → `main` / root**.

Historical candidate status (not an active work queue):

- [PR #7](https://github.com/thedoorw/PIN/pull/7): notebook UI v0 — **closed, not merged**; retained as design history, not live.
- [PR #9](https://github.com/thedoorw/PIN/pull/9): private Google Drive read-only preview — **closed, not merged**; mock checks do not establish owner OAuth or live acceptance.
- [PR #10](https://github.com/thedoorw/PIN/pull/10): public Pages source cleanup — **merged**.

Current work requires a new USER direction and a fresh branch/PR as appropriate. Private Google files remain restricted to authorized accounts; no public file or page may contain their contents or tokens.
