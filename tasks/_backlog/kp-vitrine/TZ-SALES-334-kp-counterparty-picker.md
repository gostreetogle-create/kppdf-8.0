═══════════════════════════════════════════════════════════════
TZ-SALES-334: Create КП — выбор Клиента (все Counterparty + поиск)
═══════════════════════════════════════════════════════════════

PAGES: /proposals/create
PAGE_DOCS: proposals-create.page.md

РОЛЬ АГЕНТА: frontend (+ wire Save из 333)
ЗАВИСИМОСТИ: TZ-SALES-333 DONE (лучше после 338)
LAYER: 3
CONFLICT KEYS: frontend/src/app/pages/commercial/proposals/proposal-create-inspector.component.ts; frontend/src/app/pages/commercial/proposals/proposal-create.page.ts; frontend/src/app/pages/commercial/proposals/proposal-create.page.spec.ts; frontend/src/app/shared/services/pi-counterparty.service.ts; docs/pages/proposals-create.page.md

Проверено: inspector stub «Клиент (заглушка)» disabled; `PiCounterpartyService.list` есть; роли customer/supplier/… — PO: **без фильтра по роли**, любая организация может купить; Organization ≠ клиент.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

1. В панели **Параметры**: `PiOverflowSelect` label **«Клиент»** (не «заглушка»).
2. Источник: `Counterparty.list` — **все** активные контрагенты, **без** filter по type/role (customer/supplier/contractor/…).
3. `searchable="auto"` (поиск при ≥10) — быстрый поиск по имени.
4. Значение → state Create + уходит в Save/resume (333); после reopen клиент на месте.
5. Tests + page doc.

НЕ: Organization as client; EAV; фильтр «только покупатели»; deploy.

AC: выбираешь любого клиента из полного списка; Save/reopen сохраняет выбор.
Archive после gates (+ visual лёгкий).
