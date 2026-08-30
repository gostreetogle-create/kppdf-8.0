# TZ-OPS-NX-launcher-frontend-failure checklist

> Status: **DONE**
> Marker: `tasks/_archive/2026-08/TZ-OPS-NX-launcher-frontend-failure.done.md`

## Claim slot

- agent_id: cursor-executor-ops-nx-launcher
- claimed_at: 2026-08-29T18:52:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: N/A

## Acceptance

- [x] `CI=1` в nx frontend child env (no interactive port hang).
- [x] Healthy :4201 reuse без duplicate spawn.
- [x] Frontend log `.logs/launcher-frontend.log`.
- [x] Early exit: command, cwd, code, tail stderr/stdout.
- [x] Fail-fast `exit(1)` при frontend/backend failure.
- [x] Regression tests (`scripts/start-launcher.test.mjs`).
- [x] Два полных `node start.mjs --nx --no-browser` PASS.
- [x] Gates PASS.

## Integrity slot

- [x] Тип: ops (`start.mjs`, launcher scripts).
- [x] FIC §A–E: N/A — no product behavior.
- [x] page.md / PAGE-TZ-INDEX: N/A.
- [x] SECTION-READINESS: N/A.
- [x] Чужой WIP не в коммите; conflict keys: start.mjs + launcher scripts.
- [x] Coupling map: N/A.
- [x] Канон: `docs/DOCS-INTEGRITY.md`.

## Gates

- `node --check start.mjs`: PASS
- `node --test scripts/start-fast-path.test.mjs`: PASS (10/10)
- `node --test scripts/start-launcher.test.mjs`: PASS (15/15)
- `pnpm exec nx build kppdf-web`: PASS
- `pnpm exec nx run-many -t lint --all`: PASS (0 errors)
- `pnpm run architecture:check:nx`: PASS
- `pnpm run ui:tokens:nx`: PASS
- `node start.mjs --nx --no-browser` run 1: PASS (frontend 6s, backend 15s, total 21s)
- `node start.mjs --nx --no-browser` run 2: PASS (reuse :4201, frontend 2s, backend 12s, total 19s)

## Executor report

Root cause: missing `CI=1` + kill/re-spawn on occupied healthy :4201. Fixed with reuse probe, SPA health, launcher log, fail-fast. Run2 validated occupied-port reuse path.

## Closeout

- [x] Archive created.
- [x] Active marker removed.
- closed_at: 2026-08-29T19:03:00+03:00
