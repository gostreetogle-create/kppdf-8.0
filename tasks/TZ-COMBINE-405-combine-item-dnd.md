# TZ-COMBINE-405: FE DnD линий + freeze modal + ship dialog

РОЛЬ АГЕНТА: Frontend Комбайн DnD

ЗАВИСИМОСТИ: TZ-COMBINE-404 DONE

LAYER: 3

CONFLICT KEYS: `frontend/src/app/pages/dashboard/dashboard.page.ts` ; `frontend/src/app/pages/dashboard/dashboard.page.spec.ts` ; `frontend/src/app/pages/orders/orders.service.ts`

CHECKLIST: `docs/agent-checklists/TZ-COMBINE-405.md`

---

## ЧТО ДЕЛАТЬ

1. CDK DnD карточек изделий → `PATCH .../lines/:lineId/lane`  
2. Первый переход любой линии заказа в `shop` → модалка «Состав заказа будет заморожен…» → OK продолжает  
3. Дроп в «Отгружены»: если не все линии заказа в `to_ship`/`shipped` → toast отказ RU; если все в to_ship → существующий confirmShip заказа  
4. Optimistic + rollback как SWEEP-401  
5. Specs  

## НЕ

- Module DnD  
- Partial ship API  
- Deploy (orchestrator)  

## AC

- [ ] DnD + freeze modal + ship-whole gate  
- [ ] tsc + dashboard specs PASS  
- [ ] archive wave note; push  
