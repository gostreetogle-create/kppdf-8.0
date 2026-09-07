# TZ-OPS-DEPLOY-NX-STATIC checklist

> Status: **DONE** — archived `tasks/_archive/2026-09/TZ-OPS-DEPLOY-NX-STATIC.done.md`
> Marker: removed (`tasks/_active/TZ-OPS-DEPLOY-NX-STATIC.md` deleted at closeout)
> Spec: `tasks/_ready/TZ-OPS-DEPLOY-NX-STATIC.md`  
> Canon: `docs/ops/DEPLOY-NX-PROD.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-08T04:00:00+03:00
- workspace: `D:\kppdf-8.0`
- branch: main

## Preflight

- [x] `git status` / `_active` empty of conflicting deploy.py owners
- [x] Read `docs/ops/DEPLOY-NX-PROD.md` + TZ
- [x] VPN not required for this TZ (no SSH)

## Work

- [x] `deploy.py` builds NX → copies to `frontend/browser/` (verified locally: `build_frontend()` run directly, `frontend/browser/index.html` now NX content byte-identical to `frontend-nx/dist/apps/kppdf-web/browser/index.html`)
- [x] README / DEPLOY.md / RUNBOOK.md updated (legacy `pnpm --dir frontend build` / `kppdf-frontend` dist refs replaced with NX path)
- [x] `nx build kppdf-web` green
- [x] Full gates per `tasks/PROMPT-CLAUDE-DEPLOY-PREP-NX.md` — all PASS (see `PRE-DEPLOY-2026-09-07-NX.md` Gates table)
- [x] `PRE-DEPLOY-2026-09-07-NX.md` filled
- [x] `DEPLOY-READY.md` → READY + `frontend_target: nx` + `wipe_default: false`
- [x] Archive + commit + push
- [x] **Did not** run `deploy.ps1` / wipe / SSH write

## Integrity

- deploy path ships NX only — `pnpm --dir frontend build` no longer called by `build_frontend()`
- Mongo policy documented warm (`wipe_default: false`, `wipe_reason` in stamp)
- stamp SHA = tip after push (recorded in follow-up docs commit, same pattern as other archive SHA closeouts)
