═══════════════════════════════════════════════════════════════
TZ-DESK-407: crumbs + view=gantt|combine на том же /desk
═══════════════════════════════════════════════════════════════

PAGES: /desk ; /production ; /design/combine
PAGE_DOCS: manager-desk.page.md

РОЛЬ АГЕНТА: Frontend. Root TZ, GEMINI.md. Freebuff.

ЗАВИСИМОСТИ: TZ-DESK-405 DONE. Желательно TZ-DESK-402 (живой orderId).
Не параллельно с 405 (desk page Layer 3).

LAYER: 3

CONFLICT KEYS: frontend/src/app/pages/desk/manager-desk.page.ts; frontend/src/app/pages/desk/desk-gantt-view.component.ts (новый); frontend/src/app/pages/desk/desk-combine-view.component.ts (новый); frontend/src/app/pages/production/blocks/gantt-bars.component.ts (read-only import); frontend/src/app/pages/desk/manager-desk.page.spec.ts

Проверено: PO хочет «тот же Гант» через crumbs **на странице стола**, back crumb → queue.
404 уже даёт `/production?from=desk` как fallback. 407 = embed reuse, не iframe.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — query `view`
- `view=desk|gantt|combine` (default desk). F5 restore с `orderId`.
- Crumbs:
  - desk+expand: `Рабочий стол` / `З-1001`
  - gantt: `Рабочий стол` / `З-1001` / `Гант` (last current)
  - combine: `… / Комбайн`
- Клик «Рабочий стол» → `view=desk`, сохранить `orderId` + expand.

ШАГ 2 — desk-gantt-view
- Child component: хостит `GanttBarsComponent` + минимальный context для **одного** orderId
  (reuse `ProductionReadFacade` / patterns из cockpit — **не** копировать 800 строк).
- Toolbar stub: «На стол» = crumb, не новая кнопка.
- Если embed > ~200 строк diff → known_limitation: оставить только crumb-link на
  `/production?orderId=&from=desk` и честно в archive (PO fallback).

ШАГ 3 — desk-combine-view
- Filtered subset combine rows для orderId (reuse card model из `dashboard.page.ts`).
- Read-only ok для v1; DnD lane — только если тот же PATCH что Комбайн (no second path).

ШАГ 4 — entry points
- Tray links «Гант» / «Комбайн» + R rail → set `view=` (не router.navigate away).
- 404 deep-links остаются fallback.

Gates: tsc + manager-desk.page spec (+ новые spec files if added).

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- Gantt write logic; boardLane rules; POST ship; deploy
- Полный production-cockpit refactor

КРИТЕРИИ ПРИЁМКИ
- `?view=gantt&orderId=` показывает Gantt для заказа на `/desk`.
- Crumb «Рабочий стол» возвращает queue+expand.
- tsc + spec PASS. Archive + push.

known_limitation: peek-overlay; full combine DnD optional.
