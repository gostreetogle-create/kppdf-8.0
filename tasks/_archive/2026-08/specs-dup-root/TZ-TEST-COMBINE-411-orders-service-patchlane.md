# TZ-TEST-COMBINE-411: FE OrdersService.patchLane spec

РОЛЬ: Frontend tests  
LAYER: 1  

CONFLICT KEYS: `frontend/src/app/pages/orders/orders.service.ts` ; `frontend/src/app/pages/orders/orders.service.spec.ts` (или рядом существующий spec)

## ЧТО ДЕЛАТЬ

1. Spec: `patchLane` бьёт `PATCH .../orders/:id/lines/:lineId/lane` с body `{ lane }`.  
2. Кейсы: ok → data; http error → SilentResult ok:false.  
3. Gates: FE tsc + jest `orders.service`.

## НЕ

- Править dashboard.page.ts логику  
- Deploy  

## AC

- [ ] ≥2 теста  
- [ ] archive + push  
