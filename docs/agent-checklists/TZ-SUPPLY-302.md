# TZ-SUPPLY-302 checklist

> Status: **DONE** · Wave: SHOP-NORTH-B
> Source: `tasks/_backlog/shop-north-b/`

## Claim slot
- agent_id: Buffy / agent-3e757640b7
- claimed_at: 2026-08-08T13:29:52+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable — Team Room task registry has no TZ-SUPPLY-302 entry

## Conflict check
- [x] Canonical workspace is `D:\kppdf-8.0` on `main` at current `origin/main`.
- [x] `tasks/_active/` was empty before claim; no peer Shop-north conflict keys.
- [x] Desktop TZD wave is parallel and disjoint; no desktop files will be staged.
- [x] Banned zones reviewed: desktop/**, desktop/mcp/**, backend import-task/mutation-journal, app.routes.ts, SALES-304, SHIPPING-301, PRODUCTION-308…310, Gantt, deploy.ps1.

## Acceptance
- [x] POST `/api/supply-tasks/explode` reads order/module BOM and creates one draft task per material.
- [x] Repeated explode is idempotent for open tasks by order/material; unique index + duplicate-key handling cover concurrent calls.
- [x] `/supply` exposes “Создать из заказа” and reloads created rows.
- [x] BE/FE typecheck, supply tests, FE service test, ESLint, and diff checks PASS.
- [x] Archive + lock + commit/push → next in WAVE.

## Gates (fact)
- PASS `pnpm --dir backend exec tsc -p tsconfig.build.json --noEmit`
- PASS `pnpm --dir backend exec jest src/modules/supply/supply-task.service.spec.ts --runInBand --no-coverage` — 7/7
- PASS `pnpm --dir frontend exec tsc -p tsconfig.app.json --noEmit`
- PASS `pnpm --dir frontend exec jest src/app/shared/services/pi-supply.service.spec.ts --runInBand --no-coverage` — 3/3
- PASS targeted ESLint (BE supply + FE supply files)
- PASS `git diff --check`

## Closeout
- archive: `tasks/_archive/2026-08/TZ-SUPPLY-302.done.md`
- lock: `.mimocode/locks/TZ-SUPPLY-302-bom-explode-tasks.lock`
- progress: updated
- active marker: removed after archive
