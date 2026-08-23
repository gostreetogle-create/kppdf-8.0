# TZ-UI-PLUS-604: «+» в форме КП и параметрах (org / клиент)

**CONFLICT KEYS:** `proposal-form-dialog.component.ts`; `proposal-create-inspector.component.ts`; specs  
**Эталон:** PLUS-601 green square

## ЧТО

1. `proposal-form-dialog`: у select клиента / нашей фирмы — **+** (CounterpartyFullEditor / OrganizationFullEditor create) → выбрать.
2. `proposal-create-inspector`: у select организации — **+** создать org (если только «Открыть» — оставить открыть + добавить create +). Клиент уже в левой панели.
3. Не дублировать gold CTA. Visual = `.pi-select-add-btn`.

## AC

tsc + jest proposal-form-dialog proposal-create-inspector · lint  
Commit: `feat(ui): + create party/org in KP form selects (PLUS-604)`
