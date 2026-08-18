# TZD-58 — checklist (desktop installer integrity)

task: `tasks/TZD-58-desktop-release-installer-integrity.md`
semver: **0.5.6**

## Preflight

- [x] `desktop/package.json` version = `tauri.conf.json` = 0.5.6
- [x] WIP gate in `publish-installer.mjs` committed
- [x] `release-installer` script in `desktop/package.json`

## Build + publish

- [x] `cd desktop && pnpm run release-installer` completes
- [x] NSIS: `KPPDF Desktop_0.5.6_x64-setup.exe` exists

## Verify

- [x] `frontend/browser/downloads/kppdf-desktop-setup-v0.5.6.exe` mtime fresh; size ≠ 2899027 (stale 0.5.4)
- [x] PE FileVersion starts with 0.5.6 (Windows)
- [x] `node scripts/publish-installer.mjs` without prior build → FAIL (no stale fallback)

## Gates

- [x] `cd desktop && npx tsc --noEmit` PASS

## Closeout

- [x] Archive `tasks/_archive/2026-08/TZD-58.done.md`
- [x] Lock `.mimocode/locks/TZD-58-desktop-release-installer-integrity.lock`
- [x] `_NOW.md` DESKTOP section updated
- [x] Commit + push (no deploy)

## Notes

- Do NOT use `KPPDF_PUBLISH_ALLOW_STALE`
- Do NOT bump semver above 0.5.6
