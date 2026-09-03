# TZ-NX-DOCSTUDIO-S12-DATA-CASCADE: заказ → клиент

**РОЛЬ АГЕНТА:** Executor (frontend-nx)  
**LAYER:** 3  
**PAGES:** document-studio  
**ЗАВИСИМОСТИ:** S10 cascade КП done  
**CONFLICT KEYS:** `studio-editor.page.ts`

## ИСХОДНОЕ

`onQuotationChange` auto-fills client if empty. `onOrderChange` — только PATCH orderId.

## ЧТО ДЕЛАТЬ

1. `onOrderChange`: если client пуст → взять `order.counterpartyId` → `onCounterpartyChange`.
2. Spec smoke in studio-editor or data-panel spec.
3. Не перезаписывать client если уже выбран.

## КРИТЕРИИ ПРИЁМКИ

1. Order без client → client заполнился.
2. Order с existing client → client не меняется.
3. `nx test kppdf-web --testPathPattern=studio` + build exit 0.

## Финализация

Archive → `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S12-DATA-CASCADE.done.md`
