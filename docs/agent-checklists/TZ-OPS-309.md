# TZ-OPS-309 checklist

> Status: **DONE**
> Workspace: `D:\\kppdf-8.0`, canonical `main`
> Deploy: **NO**

## Claim

- agent_id: `buffy`
- claimed_at: `2026-08-09T19:58:46Z`
- closed_at: `2026-08-09T20:00:36Z`
- base: `12382db9`
- `_active/` was empty before claim; only active TZ was OPS-309.

## Scope

- [x] Committed `tasks/_archive/2026-08/TZ-DOC-343.done.md` as the existing DOC-343 closeout.
- [x] Committed `tasks/_backlog/TZ-DOC-344-builder-single-default-background.md` as parked backlog only.
- [x] DOC-344 was not implemented.
- [x] WAVE-KP-COMPLETE / TZ-SALES-340…348 were not touched.
- [x] Foreign dirty WIP was not staged.

## Acceptance / smoke evidence

- [x] One existing Nest backend owned `:3000` (PID 5256); no duplicate Nest was started.
- [x] `GET http://127.0.0.1:3000/api/health` returned HTTP 200 with `status: ok`; Mongo, memory, and disk were `up`.
- [x] One existing Angular frontend was used on `:4200` (PID 16776).
- [x] Admin login succeeded once with configured credentials; no credentials were printed or persisted.
- [x] `/proposals` opened in Russian and showed `Все КП` / `Создать КП`.
- [x] `/proposals/create` opened `KPPDF — Создать КП` with Russian studio content and no blocker.
- [x] `/admin/roles` opened `KPPDF — Роли`; system rows showed `Системная` and `Редактировать` actions, with no Delete action present.
- [x] Browser console errors and HTTP 5xx responses were absent during the final smoke run.

## Gates

- [x] `pnpm --dir frontend exec tsc -p tsconfig.app.json --noEmit` — PASS
- [x] `pnpm --dir backend exec tsc -p tsconfig.build.json --noEmit` — PASS
- [x] `git diff --check` — PASS

## Integrity / closeout

- [x] No product-code hotfix was required.
- [x] Only OPS-309 metadata plus the permitted DOC-343/DOC-344 files were staged.
- [x] Archive created: `tasks/_archive/2026-08/TZ-OPS-309.done.md`
- [x] Lock created: `.mimocode/locks/TZ-OPS-309-deploy-prep-hygiene-smoke.lock`
- [x] `tasks/_active/TZ-OPS-309.md` removed.
- [x] Checkpoint: `READY TO PROPOSE DEPLOY` · `NEXT idle` · `Deploy NO`.
