═══════════════════════════════════════════════════════════════
TZ-ORDERS-306: D7 stub-КП из прямого заказа
═══════════════════════════════════════════════════════════════

STATUS: BLOCKED_UNTIL_301 · WAVE-PARTY-DOCS #4
DEPENDS ON: TZ-PARTY-301 DONE → тогда READY (можно ‖ 302/303)
LAYER: 3
CHECKLIST: docs/agent-checklists/TZ-ORDERS-306.md
PAGES: /orders (detail)
PAGE_DOCS: orders.page.md

РОЛЬ: Backend order + thin FE action

CONFLICT KEYS:
backend/src/modules/order/order.service.ts;
backend/src/modules/order/order.controller.ts;
frontend/src/app/pages/orders/**;
docs/pages/orders.page.md;
docs/agent-checklists/TZ-ORDERS-306.md;

---

## ИСХОДНОЕ

Прямой заказ без КП → нет «КП» для PDF-пакета. Нужен stub commercial proposal.  
Sole owner order.service в этой волне.

## ЧТО ДЕЛАТЬ

1. API: создать stub КП из order (status draft/stub; связь order↔proposal).  
2. Не дублировать supply/line-ready (уже есть).  
3. FE: кнопка/меню на order detail «Создать черновик КП» если КП нет.  
4. Документы: если нужен proposalId — после stub доступен.  
5. Тесты order.service + FE smoke.

## НЕ

- PDF generator rewrite  
- Full КП editor rewrite  
- deploy  

## AC

1. Order без КП → stub создаётся → proposalId доступен.  
2. Повторный вызов идемпотентен или понятная ошибка.  
3. BE+FE gates.  
4. Archive + push; deploy NO.
