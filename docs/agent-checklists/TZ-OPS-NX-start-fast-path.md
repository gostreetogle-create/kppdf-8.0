# TZ-OPS-NX-start-fast-path checklist

> Status: **DONE**
> Marker: archived as `tasks/_archive/2026-08/TZ-OPS-NX-start-fast-path.done.md`

## Claim slot
- agent_id: cursor-executor-ops-fast-path
- claimed_at: 2026-08-29T13:58:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: N/A

## Acceptance
- [x] Healthy Mongo reuse (skip recreate when running+healthy+rs ok).
- [x] Cold Mongo faster healthcheck (`interval: 3s`, `start_period: 5s`).
- [x] Ready panel wall-clock timing + per-service breakdown.
- [x] Unit tests (`scripts/start-fast-path.test.mjs`, 10/10).
- [x] Smoke harness cold + reuse + stop/restart (`scripts/start-fast-path-smoke.mjs`).
- [x] Gates PASS.

## Integrity slot
- [x] Тип: ops (`start.mjs`, docker-compose healthcheck, scripts tests).
- [x] FIC §A–E: N/A — no product behavior.
- [x] page.md / PAGE-TZ-INDEX: N/A.
- [x] SECTION-READINESS: N/A.
- [x] Чужой WIP не в коммите; conflict keys: start.mjs + docker-compose mongo healthcheck.
- [x] Coupling map: N/A.
- [x] Канон: `docs/DOCS-INTEGRITY.md`.

## Gates
- `node --check start.mjs`: PASS
- `node --test scripts/start-fast-path.test.mjs`: PASS (10/10)
- `node scripts/start-fast-path-smoke.mjs`: PASS
- `pnpm exec nx build kppdf-web`: PASS
- `pnpm exec nx run-many -t lint --all`: PASS (0 errors)
- `pnpm run architecture:check:nx`: PASS
- `pnpm run ui:tokens:nx`: PASS

## Executor report
Implemented fast-path per TZ-OPS-NX-start-diagnostics findings: Mongo reuse, faster cold healthcheck, honest Ready timing. No product code touched. **Outcome: PASS.**

## Closeout
- [x] Archive created.
- [x] Active marker removed.
- closed_at: 2026-08-29T14:01:00+03:00
