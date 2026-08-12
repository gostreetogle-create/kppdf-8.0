# TZ-SALES-367 checklist

> Status: **DONE**
> Marker: archived → `tasks/_archive/2026-08/TZ-SALES-367.done.md`
> Commit/push: **YES** (executor continuous; deploy НЕ)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: agent-3e757640b7
- claimed_at: 2026-08-12T16:48:59Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Unknown task: TZ-SALES-367; sync tasks first) — Claim slot + `_active` = source of truth

## Preflight

- [x] Get-Location + git rev-parse → `D:\kppdf-8.0`
- [x] `_active-map.md` + `tasks/_active/` — нет чужого CLAIM на `proposal-create.page.ts` (366 DONE)
- [x] TZ / канон / audit / PO-DIARY §1–§4 / spec §0 прочитаны
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-SALES-367.md` на месте (удалён при archive)

## Acceptance

- [x] DOM Create КП без `data-test="kp-save-bar"`
- [x] Под chips сразу studio: rails + A4
- [x] Нет UI: статус/версии/заказ/копировать/«Сохранено» на create
- [x] Rail «Вывод» → Печать · PDF · Архив; Печать первой
- [x] Autosave write-path без полосы
- [x] FE tsc + proposal-create.page.spec.ts PASS (37/37)
- [x] Spec §0 + page.md обновлены

## Integrity slot (до READY / archive)

- [x] Тип: page
- [x] FIC: page.md + studio-spec
- [x] page.md обновлён
- [x] SECTION-READINESS N/A (chrome fix, не новый route)
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS (exit 0)
- `cd frontend && pnpm exec jest --testPathPattern=proposal-create.page --no-coverage` → PASS 37/37

## Executor report

- savebar removed; output on right rail; lifecycle left on /proposals
- conflict: none (366 already DONE)
- known_limitation: no dedicated «view finished КП» page (park)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-12T16:55:00Z
