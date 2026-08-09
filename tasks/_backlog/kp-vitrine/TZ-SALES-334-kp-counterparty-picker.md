═══════════════════════════════════════════════════════════════
TZ-SALES-334: Create КП — выбор Клиента (Counterparty)
═══════════════════════════════════════════════════════════════

PAGES: /proposals/create
PAGE_DOCS: proposals-create.page.md

РОЛЬ АГЕНТА: frontend (+ wire Save из 333)
ЗАВИСИМОСТИ: TZ-SALES-333 (можно || если keys только inspector — лучше после/с 333)
LAYER: 3
CONFLICT KEYS: frontend/src/app/pages/commercial/proposals/proposal-create-inspector.component.ts; frontend/src/app/pages/commercial/proposals/proposal-create.page.ts; frontend/src/app/pages/commercial/proposals/proposal-create.page.spec.ts; frontend/src/app/shared/services/pi-counterparty.service.ts; docs/pages/proposals-create.page.md

Проверено: inspector stub «Клиент (заглушка)» disabled; CounterpartyService.list есть; Organization ≠ клиент.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

1. В панели **Параметры**: `PiOverflowSelect` Клиент из Counterparty.list (searchable auto ≥10).
2. Значение в state Create + уходит в Save (333).
3. Убрать disabled stub; RU label «Клиент».
4. Tests: select emits counterpartyId; page doc.

НЕ: Organization as client; EAV; deploy.

AC: выбираешь клиента из списка; после Save/reopen клиент на месте.
Archive после gates (+ visual лёгкий с 333 ok).
