═══════════════════════════════════════════════════════════════
TZ-DESK-412: extract shared order-hub-tray (orders + desk)
═══════════════════════════════════════════════════════════════

PAGES: /desk ; /orders
PAGE_DOCS: manager-desk.page.md ; orders.page.md

РОЛЬ АГЕНТА: Frontend. Root TZ, GEMINI.md. Freebuff.

ЗАВИСИМОСТИ: TZ-DESK-405 DONE. **Делать до TZ-DESK-403** (состав в tray).

LAYER: 3 — hot files: orders.page + desk

CONFLICT KEYS: frontend/src/app/pages/orders/orders.page.ts; frontend/src/app/pages/orders/orders.page.spec.ts; frontend/src/app/pages/desk/manager-desk.page.ts; frontend/src/app/pages/orders/order-hub-tray.component.ts (новый)

Проверено: PO reuse-first — «чинить в источнике, потом копировать». Сейчас tray логика
только в orders.page ~200 строк #expandedTpl. Desk 405 делает fixture-tray отдельно → drift.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — standalone `order-hub-tray.component.ts`
- Inputs: `order`, `mode: 'hub' | 'desk'` (desk может скрыть «Открыть карточку» как primary exit).
- Outputs: expand composition, open supply, open docs, primary CTA click.
- Перенести разметку групп Заказ / Исполнение / (composition block shell) из orders.page.

ШАГ 2 — orders.page host
- `#expandedTpl` → `<app-order-hub-tray …>`; **zero regression** — orders.page.spec HUB-302/303 must PASS.

ШАГ 3 — desk host
- Fixture tray заменить на `<app-order-hub-tray>` с mock order shape **или** live Order после 402.

ШАГ 4 — gates
```
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm test -- --testPathPattern=orders.page
cd frontend && pnpm test -- --testPathPattern=manager-desk.page
```

КРИТЕРИИ ПРИЁМКИ
- Один tray component; orders hub визуально не сломан.
- Desk использует тот же component (fixture or live).
- Archive + push. **403** только добавляет tree/combine inside tray, не fork template.

НЕ: менять API; менять compose tree write-path.
