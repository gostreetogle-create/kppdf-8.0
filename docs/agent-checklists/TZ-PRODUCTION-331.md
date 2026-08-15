# TZ-PRODUCTION-331 checklist

> Status: **DONE**
> Marker: archived `tasks/_archive/2026-08/TZ-PRODUCTION-331.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: cursor-grok-4.6-executor
- claimed_at: 2026-08-15T19:12:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (root TZ; kit CLI unknown task)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на те же keys
- [x] TZ / канон / deps прочитаны (expanded: plan fields + siteId heal)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-PRODUCTION-331.md` на месте (removed after archive)

## Acceptance

- [x] PATCH plannedDate on ready → allowed (200 path)
- [x] PATCH notes on ready → still 400
- [x] shipped + plannedDate → still 400
- [x] in_production + priority → allowed
- [x] missing siteId + patchEstimateDays → heal + save
- [x] no Site for Counterparty → RU BadRequestException
- [x] local-demo seed always sets siteId
- [x] FE canEditOrder / readOnly only shipped|delivered|cancelled
- [x] page.md + PAGE-TZ-INDEX

## Integrity slot (до READY / archive)

- [x] Тип изменения: module + page
- [x] FIC §C (API freeze/heal) + page.md; §A/B/D/E N/A
- [x] page.md / PAGE-TZ-INDEX обновлены
- [x] SECTION-READINESS N/A (раздел Цех уже есть; статус секции не меняется)
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

- `backend` `tsc -p tsconfig.build.json --noEmit` — PASS (exit 0)
- `backend` `jest --testPathPattern=order.service.spec` — PASS 34 tests (exit 0)
- `frontend` `tsc -p tsconfig.app.json --noEmit` — PASS (exit 0)
- `frontend` `pnpm test -- --testPathPattern=pages/production` — PASS 6 suites / 74 tests (exit 0)
- eslint owned files — PASS (1 pre-existing OnInit warning)

Primary signal: ready/in_production plan PATCH allowed; composition frozen; missing siteId healed — met
Secondary: tsc/jest/lint — PASS

## Executor report

BE `update()` allowlist `{plannedDate, priority, materialsSource}` on in_production/ready; hard-freeze shipped/delivered/cancelled for plan fields. Heal missing `siteId` from first Counterparty Site before save on Gantt write-paths. Demo seed writes/heals siteId. FE maps leftover English/siteId toasts to RU; readOnly stays shipped|delivered|cancelled.

Conflict disclosure: did not stage `docs/PO-DIARY.md`, `data/paspots/`, `data/products/`.
Known limits: existing Mongo orders without siteId and without any Site on the CP still get RU 400 until a Site is created. Deploy not run.

## Review handoff

- [x] TZ issued as executor work; archive after green gates
- [x] No separate Cursor Verdict inbox required

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-15T19:16:00Z
