# TZ-DESK-422 checklist

> Status: **CLAIMED / IN PROGRESS**
> Marker: `tasks/_active/TZ-DESK-422-queue-group-by-customer.md`
> Commit/push: executor commit после gates

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: freebuff
- claimed_at: 2026-08-22T13:42:15+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable

## Preflight

- [x] Get-Location + git rev-parse → `D:\kppdf-8.0`
- [x] `git status` / branch / worktree проверены; main, конфликтов нет
- [x] Прочитан `_NOW.md` + `tasks/_active/` — TZ-DESK-419 archived; active UI-404/UI-405 не конфликтуют по keys
- [x] TZ / canon / deps прочитаны
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-DESK-422-queue-group-by-customer.md` на месте
- [x] Domain preflight: `CounterpartyService` + `counterpartiesLookup` в manager-desk уже есть (стр. 951-953); `counterpartyIdOf(order)` возвращает id → `lookup.byId()[id]?.name` → `ООО «…»`

## Acceptance

- [ ] Заказы одного заказчика идут подряд (stable groupBy по первому попаданию)
- [ ] Разделитель перед первой записью группы: название заказчика, тонкая строка, минимальный padding
- [ ] Пустые группы не показываются при поиске
- [ ] Одиночные заказчики тоже имеют разделитель (единообразие)
- [ ] Счётчик N заказов — как сейчас (считает заказы)
- [ ] Expand/tray поведение без изменений
- [ ] Light/dark без изменений
- [ ] `manager-desk.spec` обновлён — проверяет группировку

## Gates (факт)

- [ ] `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`
- [ ] `cd frontend && pnpm test -- manager-desk`
- [ ] `cd frontend && pnpm lint`

## Closeout (после PASS)

- [ ] archive + удалить `_active`
- [ ] Status = DONE
- closed_at: _