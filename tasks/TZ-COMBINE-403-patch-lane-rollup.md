# TZ-COMBINE-403: PATCH boardLane + Order.status rollup

РОЛЬ АГЕНТА: Backend order service

ЗАВИСИМОСТИ: TZ-COMBINE-402 DONE

LAYER: 2

CONFLICT KEYS: `backend/src/modules/order/order.service.ts` ; `backend/src/modules/order/order.controller.ts` ; `backend/src/modules/order/dto/*lane*` ; `backend/src/modules/order/order.service.spec.ts`

CHECKLIST: `docs/agent-checklists/TZ-COMBINE-403.md`

---

## ЧТО ДЕЛАТЬ

1. `PATCH /orders/:id/lines/:lineId/lane` body `{ lane }`  
2. Derive `item.status` from lane; write both atomically  
3. `rollupOrderStatus(order)` после смены lane — правила из COMBINE-401 / Opus D  
4. Guards: нельзя lane=`shipped` через PATCH; delete item only if prep  
5. Unit tests: all rollup rows + reject ship-via-lane  

## НЕ

- FE  
- Partial ship  
- moduleLanes  

## AC

- [ ] Endpoint + rollup + specs  
- [ ] BE tsc + order.service jest PASS  
- [ ] push  

```text
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
cd backend && pnpm exec jest --testPathPattern=order.service --coverage=false
```
