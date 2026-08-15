# TZ-PRODUCTION-334 checklist

> Status: **DONE**
> Marker: archived `tasks/_archive/2026-08/TZ-PRODUCTION-334.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: cursor-grok-4.6-executor
- claimed_at: 2026-08-15T19:55:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: yes (`TZ-PRODUCTION-334-workers-list-limit`)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на те же keys
- [x] TZ / канон / deps прочитаны
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-PRODUCTION-334.md` на месте (removed at archive)

## Acceptance

- [x] Cockpit load does not request workers?limit=200
- [x] Jest facade: list called with limit 100 (or ≤100)
- [x] FE tsc + production-read.facade.spec PASS
- [x] Archive

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: page
- [x] FIC §A–E: §A page.md + PAGE-TZ-INDEX; §B–E N/A (no permission/module/MCP)
- [x] page.md / PAGE-TZ-INDEX обновлены
- [x] SECTION-READINESS N/A — labels already existed; 400 fix only
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS (exit 0)
- `cd frontend && pnpm exec jest --config jest.config.js --testPathPattern=production-read.facade.spec` → PASS 2/2 (exit 0)
- `cd frontend && pnpm exec eslint src/app/pages/production/production-read.facade.ts src/app/pages/production/production-read.facade.spec.ts` → PASS (exit 0)

## Executor report

- Fix: `getWorkersByWorkType` `limit: 200` → `100` (BE `@Max(100)`).
- Spec asserts `list({ limit: 100, isActive: true })`.
- No pagination (shop ~10; TZ optional). Other modules' `limit: 200` untouched.
- Conflict: none in `_active`. Unrelated dirty: `docs/PO-DIARY.md`, `data/paspots/`, `data/products/` — not staged.
- Deploy: not run.

## Review handoff

- [x] TZ не требует Cursor Verdict — closeout after gates
- [x] N/A review inbox

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-15T19:58:00Z
