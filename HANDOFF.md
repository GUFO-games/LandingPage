# HANDOFF — LabyrAInth Landing Page → go-live phase

Written 2026-08-12 by the ops-repo session that audited and completed the pre-deploy launch/SEO layer. Audience: the next Claude Code session (or human) taking this repo to production. **Everything pre-deploy is done and verified; what remains is the deploy pipeline + the post-deploy findability run.**

Related docs: business/process live in the ops repo `E:\Pietro\AI\AIforBusinesses` — `docs/technical/launch-seo-checklist.md` (v1.1, the doctrine this repo was audited against), `sites/gufo-landing/` (DESIGN.md, content contract, design handoff). This file is self-contained if you don't have that repo.

## What this is

- Marketing site for **LABYRAINTH** (styled LabyrAInth) — sci-fi roguelite FPS by indie studio **G.U.F.O. Games**, in Steam Early Access.
- Two pages: the **landing** (FOCUS: *Play on Steam* — always "play", never "buy"; highest-contrast element, three placements) and the **Feedback Center** (`/feedback/`) — an unlisted page reachable only by direct URL, offering 4 localized Google Forms.
- 9 locales (en it es pt fr de ru ja zh), design direction "Cosmic Descent" (AAA cinematic; magenta rationed to exactly 3 places: imagery, the "AI" pair in the wordmark, Steam CTAs).

## Architecture facts you must not break

1. **Astro 5 static, no React**, CSS custom properties under `[data-theme="cosmic-descent"]`, vanilla JS only (IntersectionObserver-class effects).
2. `astro.config.mjs`: `site: 'https://gufo-games.github.io'`, `base: '/LandingPage'`, `trailingSlash: 'always'` — a GitHub Pages **project site**. The default locale (en) lives at the **root** (`/LandingPage/`); the live URL must not change.
3. i18n is route-based (`src/pages/[locale]/`). ALL copy goes through `src/i18n/<locale>.json`; **`en.json` is the typed key registry** (`MessageKey = keyof typeof en`) — add new keys there first; other locales fall back to English per-key, so partial translations never render empty.
4. Binding external links live ONLY in `src/i18n/index.ts` (`LINKS`, `SOCIALS`, `FEEDBACK_FORMS`, `VIDEO_IDS`, `TEAM_NAMES`) — that's the content contract. Never hardcode a URL elsewhere.
5. `src/layouts/Base.astro` owns the entire `<head>`: required `title`/`description` props (typed — `astro check` fails without them), canonical, hreflang matrix (x-default = en), OG/Twitter, favicon links, JSON-LD (`VideoGame` + `Organization`), and the `noindex` switch — which deliberately also suppresses hreflang and JSON-LD.
6. The Feedback Center stays: unlinked from nav, `noindex`, excluded from the sitemap, and **NOT disallowed in robots.txt** (a disallow line would both advertise the URL publicly and stop crawlers from ever reading the noindex).
7. Gate for any change: `npm run verify` (guard-build → `astro check` → build → asset-reference check). Before showcasing to Pietro: the ops repo's `pre-qa` skill checklist (double reloads, asserted click-throughs, viewport sweep, etc.).

## Launch/SEO layer — state at handoff

| Item | Where | Status |
|---|---|---|
| Unique titles/descriptions per locale | `i18n/*.json` `meta.*` → Base required props | ✅ |
| Canonical + hreflang matrix | `Base.astro` | ✅ |
| OG/Twitter + `og.png` 1200×630 | `Base.astro`, `public/og.png` | ✅ |
| JSON-LD `VideoGame` + `Organization` | `Base.astro` (off on noindex pages) | ✅ |
| Sitemap (9 landing URLs only) | `astro.config.mjs` filter excludes feedback/demo | ✅ |
| robots.txt (allow all incl. AI crawlers + sitemap URL) | `public/robots.txt` | ✅ |
| Custom 404 (real 404 status, FOCUS CTA, noindex) | `src/pages/404.astro` | ✅ added 2026-08-12 |
| Favicon set (96px = Google SERP size; apple-touch 180) | `public/favicon-96.png`, `public/apple-touch-icon.png`, Base head | ✅ fixed 2026-08-12 (old `favicon.ico` is a mislabeled 200×200 PNG; file kept for legacy direct hits, link removed) |
| llms.txt | `public/llms.txt` | ✅ exists, kept as-is — doctrine says don't invest further (no major assistant consumes it); it's factual, zero maintenance |
| Trailers | click-to-load `youtube-nocookie` iframes | ✅ privacy-correct embed pattern |
| Visible contact email + socials | `ContactFooter`, `LINKS`/`sameAs` | ✅ |
| Analytics | — | ✅ **deliberately none** → zero cookies, no banner needed. Only approved future option: self-hosted Plausible/Umami on Pietro's VPS. **GA4 is forbidden by doctrine** unless Pietro explicitly reverses. |

Pre-qa verified 2026-08-12 on this exact tree: `npm run verify` green (19 pages, 1,139 asset refs), double fresh-reloads on 404/landing, asserted click-throughs (404 CTAs, theater play/next), 0 failed resources and 0 broken images on landing / `/it/` / `/feedback/` / 404, no horizontal scroll at 375/768/desktop, 404 content visible without motion, document returns genuine HTTP 404.

## Go-live run-list (what YOU do, in order)

0. **Pre-flight:** `git status --short` clean (an uncommitted `public/` asset passes locally and 404s in production), `npm run verify` green.
1. **Build the deploy pipeline — it does not exist yet.** There is no `.github/workflows/`; legacy branch-based Pages cannot build Astro. Add the official Astro Pages workflow (`withastro/action`) on the default branch, and in repo Settings → Pages **switch source to "GitHub Actions" BEFORE merging** (proven lesson: the legacy Jekyll builder races the Actions workflow if you merge first).
2. **Push + merge:** branch `redesign/astro-rebuild` is **local-only** — push it, PR into `main` (default branch; remote also has stale `CoreFunctionality` and `Restyle` branches).
3. **Live smoke:** `/LandingPage/` + `/LandingPage/it/` + `/LandingPage/feedback/` + `/LandingPage/qualcosa-inventato/` (must show the branded 404 with HTTP 404 status — check in devtools Network).
4. **Google Search Console:** URL-prefix property `https://gufo-games.github.io/LandingPage/`, HTML-file verification (drop the file in `public/`, redeploy) → submit `sitemap-index.xml` → URL Inspection on the homepage → Request indexing.
5. **Bing Webmaster Tools:** one-click import from GSC — Bing's index feeds ChatGPT/Copilot; for a game this is not optional.
6. **Share tests:** paste the live URL in **WhatsApp AND Discord** (the game's audience lives on Discord; its embeds read the same OG tags). Previews cache hard — if a stale/missing image shows after a fix, bump the og:image URL with `?v=2`.
7. **Rich Results Test** (search.google.com/test/rich-results) on the live homepage — `VideoGame` + `Organization` must parse.
8. **Analytics decision (optional, Pietro's call):** zero-analytics is a valid steady state; if wanted, self-hosted Plausible on the Contabo VPS + one `<script defer data-domain=…>` line in `Base.astro`.

## Open content items (NOT launch blockers)

- 14 team avatars are placeholder gradient orbs — owl-crew avatar set is an open asset request (see design handoff in the ops repo).
- The 6 in-game screenshots are `ImmagineProva*` placeholders awaiting final marketing stills.
- If better trailers land, update `VIDEO_IDS` in `src/i18n/index.ts` — posters in `src/assets/posters/` are keyed by YouTube ID.

## Recent history

- v2.0.0 Astro rebuild on `redesign/astro-rebuild` (parallel session): full site + most of the SEO layer (hreflang, JSON-LD, sitemap, robots, og.png).
- 2026-08-12 (`7ae4515`): launch-layer audit against ops checklist v1.1 → added the 404 page + proper favicon set; full pre-qa pass. This file.
