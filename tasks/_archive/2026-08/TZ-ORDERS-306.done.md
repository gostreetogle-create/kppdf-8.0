═══════════════════════════════════════════════════════════════
TZ-ORDERS-306: D7 stub-КП из прямого заказа
═══════════════════════════════════════════════════════════════

STATUS: DONE · WAVE-PARTY-DOCS #4
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

## ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08
closed_by: agent-3e757640b7 (Cursor executor)
protected_files:
  - backend/src/modules/order/order.service.ts
  - backend/src/modules/order/order.controller.ts
  - backend/src/modules/order/order.module.ts
  - backend/src/modules/quotation/quotation.schema.ts
  - backend/test/e2e/orders.e2e-spec.ts
  - frontend/src/app/pages/orders/order-detail.page.ts
  - frontend/src/app/pages/orders/orders.service.ts
  - docs/pages/orders.page.md
verification:
  - acceptance criteria: PASS (1–4)
  - backend typecheck: PASS в зоне (репо-дрейф в чужих spec — не из этой волны)
  - backend unit: PASS (order 18, +quotation/organization/counterparty = 71)
  - backend e2e orders: PASS 7/7 (новый кейс: два вызова → один quotationId)
  - frontend typecheck + development build: PASS
  - frontend tests pages/orders: PASS 21/21
  - lint (BE order/quotation, FE orders): 0 errors
  - checklist: UPDATED (docs/agent-checklists/TZ-ORDERS-306.md)
  - progress.md + ARCHITECTURE.md: UPDATED
  - supply / line-ready: NOT TOUCHED
  - PDF engine / КП-редактор: NOT TOUCHED
  - deploy: NO
extended_conflict_keys:
  - backend/src/modules/quotation/quotation.schema.ts (+isStub, +sourceOrderId)
  - backend/src/modules/order/order.module.ts (Quotation model + OrganizationModule)
  - backend/test/e2e/orders.e2e-spec.ts, order.service.spec.ts
  (в `_active/` параллельных TZ нет — конфликта не было)
notes: Статус заглушки — `draft`, не `converted`: конвертации не было и цены никто не считал.
  Флаг `isStub` нужен, чтобы заглушка не выглядела в списке КП как настоящее посчитанное КП.
  Модель Quotation зарегистрирована прямо в OrderModule: QuotationModule сам импортирует
  OrderModule (convert-to-order), обратный импорт дал бы цикл. Организацию берём через
  `OrganizationService.findCurrent` (PARTY-301), а не угадываем — иначе КП уехало бы от чужой
  фирмы. `BuildDocumentDto` по-прежнему не принимает `quotationId`: заглушка делает КП
  достижимым, а привязка КП к builder-документам — отдельное TZ.
