═══════════════════════════════════════════════════════════════
TZ-ORDERS-304: Ready-for-work on order line / module (D8)
═══════════════════════════════════════════════════════════════

STATUS: READY · WAVE-SHOP-NORTH-B #2
DEPENDS ON: TZ-ORDERS-303 DONE; TZ-SUPPLY-302 DONE (wave order)
LAYER: 3
CHECKLIST: docs/agent-checklists/TZ-ORDERS-304.md
PAGES: /orders/:id · PAGE_DOCS: docs/pages/orders.page.md (или order-detail page doc)

РОЛЬ: Backend order lines + Frontend order-detail

CONFLICT KEYS:
backend/src/modules/order/**;
frontend/src/app/pages/orders/**;
docs/agent-checklists/TZ-ORDERS-304.md;

Canon: docs/audits/2026-08-08-sales-to-shop-flow-canon.md D8 — ready на модуле и/или линии; не только на всём изделии. Гант не трогать.

---

## ИСХОДНОЕ

Нет явного «готово к работе» на линии/модуле заказа → проектировщик/цех не видят кусок.

## ЧТО ДЕЛАТЬ

1. Поля на order line (и/или nested module ref): `readyForWork: boolean`, `readyAt?`, `readyByUserId?`.  
2. PATCH API линии/модуля toggle ready.  
3. UI на order-detail: чекбокс/кнопка «Готово к работе» на линии (и модуле если UI дерево показывает модули).  
4. Список/фильтр опц. «только ready» — nice-to-have, не блокер.  
5. НЕ менять Gantt bars / production-cockpit.

## НЕ

Gantt auto-schedule; SHIPPING; desktop; app.routes; composition-tree rewrite.

## AC

1. Toggle ready сохраняется и видно после F5.  
2. Можно ready один модуль/линию без ready всего заказа.  
3. Gates: BE+FE tsc; точечные tests.

known_limitation: очередь проектировщику (design queue) — отдельный TZ после Desktop TZD-29.
