═══════════════════════════════════════════════════════════════
TZ-DESK-403: состав заказа в центре стола
═══════════════════════════════════════════════════════════════

PAGES: /desk
PAGE_DOCS: manager-desk.page.md

РОЛЬ АГЕНТА: Frontend. Root TZ, GEMINI.md. Freebuff.

ЗАВИСИМОСТИ: TZ-DESK-402 DONE; **TZ-DESK-412 DONE** (shared tray). PO layout ok.

LAYER: 3

CONFLICT KEYS: frontend/src/app/pages/orders/order-hub-tray.component.ts; frontend/src/app/pages/desk/manager-desk.page.ts; frontend/src/app/pages/desk/manager-desk.page.spec.ts

Проверено: live BOM = `app-composition-tree` + forest. **HUB-303:** supply lazy on expand mandatory.
Tray = host `order-hub-tray`, не копипаста.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — tray (via order-hub-tray 412)
- Добавить в shared tray: composition-tree, combine-strip, **lazy supply** (HUB-303 pattern).
- **Создать документ** — reuse row-actions / hub handler.
- Expand → scrollIntoView row (optional util).
- Пустой состав: RU «Нет изделий» + CTA открыть flyout create/edit (добавление
  линий — существующая форма, не новая таблица).
- Карандаш = существующий `open-catalog-composition-edit` (остаёмся на `/desk`,
  catalog dialog ок; не router `/products/:id` как основной путь).

ШАГ 2 — spec
- Выбранный fixture/live заказ с productId → tree запрошен или показан empty RU.
- Не уходим на `/orders/:id` при раскрытии состава.

ШАГ 3 — gates
```
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm test -- --testPathPattern=manager-desk.page
```

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- Новый snapshot BOM на Order; production-cockpit; второй tree component «для стола»
- deploy

КРИТЕРИИ ПРИЁМКИ
- Состав выбранного заказа виден на `/desk` без маршрута карточки.
- tsc + spec PASS. Archive + push. Далее 404 если ещё не взят.
