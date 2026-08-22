═══════════════════════════════════════════════════════════════
TZ-DESK-402: заказ во flyout — тот же write-path
═══════════════════════════════════════════════════════════════

PAGES: /desk
PAGE_DOCS: manager-desk.page.md

РОЛЬ АГЕНТА: Frontend. Root TZ, GEMINI.md. Freebuff.

ЗАВИСИМОСТИ: TZ-DESK-406 DONE. (Gate «раскладка ok» снят — PO 2026-08-18 delegated full desk wave.)

**Reuse-first:** вынести/хостить `order-form-panel` из dialog; **не** новый FormGroup.
Баг при переносе → fix в `order-form-dialog` / `OrdersService` сначала, потом desk.

LAYER: 3

CONFLICT KEYS: frontend/src/app/pages/desk/manager-desk.page.ts; frontend/src/app/pages/orders/order-form-dialog.component.ts; frontend/src/app/pages/orders/order-form-panel.component.ts; frontend/src/app/pages/desk/manager-desk.page.spec.ts; frontend/src/app/pages/orders/order-form-dialog.component.spec.ts

Проверено: форма заказа = `OrderFormDialogComponent` + `OrdersService`; клиент
`counterpartyId` (Counterparty ≠ Organization); unique = `Order.number`;
после create на `/orders` список refresh, **заказ не выбирается**.
Спек §3: desk хостит ту же форму, не второй FormGroup.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — один компонент формы
- Вынести тело формы в shared panel (напр. `order-form-panel.component.ts` рядом
  с dialog) **или** тонко обернуть существующий класс так, чтобы его можно было
  вставить во flyout без `PiDialog` width lg.
- Dialog на `/orders` остаётся тонкой оболочкой: тот же panel + close.
- Тот же `OrdersService.create/update`. Запрет копипасты валидации.

ШАГ 2 — стол
- Убрать fixture как SoT. `GET /orders` в очередь.
- **Invalid `orderId`:** RU «Заказ не найден», clear query, не падать.
- **After create:** close flyout, select+expand new id, scroll row into view.
- Flyout create/edit → panel (reuse-first §11).
- CTA по живому `Order.status` всё ещё могут быть disabled, кроме тех, что
  уже делает форма (сохранить). PATCH status / POST ship — **не** этот TZ
  (successor или 404+).

ШАГ 3 — gates
```
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm test -- --testPathPattern=manager-desk.page
cd frontend && pnpm test -- --testPathPattern=order-form-dialog
```

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- production-cockpit; combine; desktop; новый DTO заказа; pi-input CVA
- deploy

КРИТЕРИИ ПРИЁМКИ
- Один write-path: create с стола = тот же сервис, что `/orders`.
- После create заказ выбран на `/desk`.
- tsc + specs PASS. COUPLING-MAP §4: строка «Стол `/desk` | Order.status».
- Archive + push. Далее 403.

known_limitation: состав tree = 403; Гант = 404.
