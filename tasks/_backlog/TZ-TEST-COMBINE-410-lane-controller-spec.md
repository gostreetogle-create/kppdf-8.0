# TZ-TEST-COMBINE-410: BE spec PATCH line lane (controller)

РОЛЬ: Backend tests  
LAYER: 1  

CONFLICT KEYS: `backend/src/modules/order/order.controller.ts` ; `backend/src/modules/order/order.controller.spec.ts` (создать если нет) ; возможно только service если controller тонкий — тогда расширить `order.service.spec.ts` кейсами HTTP-контракта DTO

## ЧТО ДЕЛАТЬ

1. Найти/добавить spec на endpoint `PATCH /orders/:id/lines/:lineId/lane`.  
2. Кейсы: happy path shop; reject `lane=shipped` 400; unknown lineId 404; rollup вызывается (mock/spy ok).  
3. Gates: BE tsc + jest pattern `order.controller|order.service`.

## НЕ

- Менять production FE  
- Deploy  

## AC

- [ ] ≥3 новых теста зелёные  
- [ ] archive + push  
