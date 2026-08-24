# gh-pages — legacy redirect shim

This branch exists for one reason: **shipped LABYRAINTH builds open
`gufo-games.github.io/LandingPage/...` URLs**, and those binaries are already in
players' hands. They cannot be patched retroactively.

| Opened by | Legacy URL | Answered by |
|---|---|---|
| `MainMenuUI.cpp` — Survey button | `/LandingPage/PageStructure/Feedback/feedback.html` | `PageStructure/Feedback/feedback.html` — **200** |
| `GameSettingsUI.cpp` — Community button | `/LandingPage/#community` | `index.html` — 200 |
| `Config/DefaultGame.ini` — project Homepage | `/LandingPage/` | `index.html` — 200 |

GitHub Pages serves `404.html` for every unmatched path, so one generic rule
still covers everything else (old locale routes, `/PageStructure/index.html`,
old CSS/JS assets).

**The real site lives on the VPS** and is built from `main`. Nothing here is
part of it — do not add content to this branch.

## Indexability — the asymmetry is deliberate

| File | HTTP | `robots` | Why |
|---|---|---|---|
| `index.html` | 200 | **none → `index, follow`** | The only URL here that still holds ranking. Pages cannot emit a 301, so `canonical` + the 0-second meta refresh are the *entire* site-move signal. |
| `404.html` | 404 | `noindex, nofollow` | A 404's `canonical` is ignored regardless. These URLs are gone; saying so is honest. |
| `PageStructure/Feedback/feedback.html` | 200 | `noindex, nofollow` | Exists only so a shipped-build path answers 200. Its destination `/feedback/` is itself `noindex`, so there is nothing to transfer. |

**Do not "tidy" this by making the three consistent.** `noindex` and `canonical`
are mutually exclusive instructions: `canonical` says *merge my signals into that
URL*, `noindex` says *forget I exist*. Engines resolve the conflict by dropping
the page and never reading the canonical — so a `noindex` here **discards** the
ranking this address still holds instead of handing it to the new site.

That was the bug this branch originally shipped with (both tags present at once),
found 2026-08-24 when `gufo-games.github.io` was still outranking the live site
for the query *gufo games*, and fixed in the same pass.

## Retirement

Delete this branch and turn Pages off once:

1. a game build ships with the new URLs (PieMH/LabyrAInth#5), **and**
2. players have had reasonable time to update.

Until both are true, this stays. Tracked in the ops repo spec
`2026-08-13-fe-deploy-pipeline-design.md` §8.
