# TZ-TEST-421 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-TEST-421.md` (removed)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: freebuff
- claimed_at: 2026-08-23T08:00:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (standalone executor)

## Preflight

- [x] Get-Location + git rev-parse → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на те же keys
- [x] TZ / канон / deps прочитаны
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-TEST-421.md` на месте

## Acceptance

- [x] `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` exit 0
- [x] `cd frontend && pnpm test -- orders.page.spec.ts` — все 17/17 PASS
- [x] focused `order-hub-tray` — 7/7 PASS (регрессия)
- [x] Нет ассертов на фразы, запрещённые каноном DESK-423 (grep confirmed)
- [x] Archive `tasks/_archive/2026-08/TZ-TEST-421.done.md` + sha; убрать из `_active`

## Integrity slot (до READY / archive)

- [x] Тип изменения: test-only
- [x] FIC: N/A (тесты)
- [x] page.md: N/A (не трогал product)
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите
- [x] Coupling map: N/A

## Gates (факт)

- FE tsc --noEmit: exit 0 PASS
- FE test orders.page.spec: 17/17 PASS
- FE test order-hub-tray: 7/7 PASS
- FE lint: 0 errors, 18 pre-existing warnings PASS

## Executor report

- 5 stale HUB-303/304 тестов обновлены под канон DESK-423
- Supply/logistics sections collapsed by default → тесты раскрывают их через aria-controls toggle
- Убраны ассерты на удалённые фразы: "Нет задач снабжения", "Нет броней", "Отгрузка пока не ведётся"
- Product .ts/.html/.css не тронут
- Conflict keys: только `orders.page.spec.ts`, других претендентов нет

## Closeout (после PASS)

- [x] archive + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-23T08:50:00+03:00