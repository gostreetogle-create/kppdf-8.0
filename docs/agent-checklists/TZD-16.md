# TZD-16 checklist

> Status: **CLAIMED / IN PROGRESS**  
> Marker: `tasks/_active/TZD-16.md`  
> Commit/push: **YES — PO explicitly requested scoped commit/push**

## Claim slot

- agent_id: `agent-796e2f8bba` / Buffy `openai/gpt-5.6-luna`
- claimed_at: `2026-08-06T17:54:46Z`
- workspace: `D:\\kppdf-8.0\\.freebuff\\worktrees\\4e0737af-9c57-4b50-8947-647df49ab6ee`
- team_room_claim: `unavailable` — Team Room has stale TZD-15 state and no TZD-16 registration

## Preflight

- [x] `origin/main` synchronized to `61f3fe2d` before implementation.
- [x] TZD-15 is landed/archived on `origin/main`; inbox/MCP files excluded.
- [x] Existing untracked production audit preserved and excluded from this TZ.
- [x] `_active-map.md` and `tasks/_active/` checked; no TZD-16 claim or overlapping pairing-dialog owner found.
- [x] TZD-16, `desktop/docs/PAIRING.md`, pairing design, and project contracts read.
- [x] Claim slot filled; Status = CLAIMED / IN PROGRESS.
- [x] `tasks/_active/TZD-16.md` exists.

## Acceptance

- [ ] Local `cd desktop && pnpm tauri build` attempted; `.exe`/`.msi` stay outside git (currently blocked by missing `desktop/src-tauri/icons/icon.ico`).
- [x] `desktop/dist-installers/` is ignored.
- [x] Pairing dialog has `Скачать приложение`, `data-test="pairing-download-button"`.
- [x] Download URL uses `DESKTOP_DOWNLOAD_URL`; default is `/downloads/kppdf-desktop-setup.exe`.
- [x] Empty configured URL disables button and shows Russian hint.
- [x] Jest covers configured URL, default URL, empty URL, and download activation.
- [x] `PAIRING.md`, `desktop/README.md`, and Synology static path note describe download → install → paste JSON and Node limitation.
- [x] Deployment config documents optional `DESKTOP_DOWNLOAD_URL`; `deploy.py` injects it into the built SPA without committing runtime config (config.env value takes precedence; process environment is fallback).
- [x] Scoped FE/desktop typecheck/check/lint/format gates pass or are documented as blocked.
- [x] No production/catalog/warehouse/desktop inbox/MCP changes.

## Gates (fact)

- `cd frontend && pnpm exec jest --config jest.config.js --runInBand --testPathPattern="pairing-dialog"`
- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`
- `cd frontend && pnpm exec eslint <scoped pairing files>`
- `cd frontend && pnpm exec prettier --check <scoped pairing/docs files>`
- `cd desktop && pnpm typecheck`
- `cd desktop && pnpm check`
- `cd desktop && pnpm tauri build`
- `git diff --check`

## Executor report

- Implemented download button, runtime URL token/default/empty state, Jest coverage, installer ignore, pairing/deploy documentation, and `deploy.py` runtime injection.
- Desktop `pnpm tauri build` is blocked by pre-existing missing `desktop/src-tauri/icons/icon.ico`; no binary bundle was produced or staged.

## Review handoff

- [x] READY FOR REVIEW after all applicable gates are evidenced; Tauri bundle remains blocked by missing icon asset.
- [ ] Cursor/PO review before closeout/archive where required.

## Closeout

- [ ] Archive `tasks/_archive/2026-08/TZD-16.done.md` with `ARCHIVE_MARKER`.
- [ ] Create `.mimocode/locks/TZD-16-*.lock`.
- [ ] Update `progress.md`.
- [ ] Remove `tasks/_active/TZD-16.md` only after archive.
- [ ] Status = DONE.
