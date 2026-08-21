# gh-pages — legacy redirect shim

This branch exists for one reason: **shipped LABYRAINTH builds open
`gufo-games.github.io/LandingPage/...` URLs**, and those binaries are already in
players' hands. They cannot be patched retroactively.

| Opened by | Legacy URL |
|---|---|
| `MainMenuUI.cpp` — Survey button | `/LandingPage/PageStructure/Feedback/feedback.html` |
| `GameSettingsUI.cpp` — Community button | `/LandingPage/#community` |
| `Config/DefaultGame.ini` — project Homepage | `/LandingPage/` |

GitHub Pages serves `404.html` for every unmatched path, so one generic rule
covers all of them plus the locale routes (`/LandingPage/it/` and friends).

**The real site lives on the VPS** and is built from `main`. Nothing here is
part of it — do not add content to this branch.

## Retirement

Delete this branch and turn Pages off once:

1. a game build ships with the new URLs, **and**
2. players have had reasonable time to update.

Until both are true, this stays. Tracked in the ops repo spec
`2026-08-13-fe-deploy-pipeline-design.md` §8.
