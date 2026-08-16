# TZ-COMBINE-408: Gate workType + days before shop (v2 PARK)

STATUS: **PARK** — после 405; желательно после Gantt assign волны

РОЛЬ АГЕНТА: Backend + optional FE toast

LAYER: 2

CONFLICT KEYS: `backend/src/modules/order/order.service.ts` (patchLane) ; dashboard drop shop path

---

## ЧТО ДЕЛАТЬ

1. При переходе линии в `shop`: проверить наличие workType + estimate days (overrides или каталог) для линии  
2. Иначе 400 RU + FE toast  
3. Specs  

## НЕ

- Auto-assign рабочих  
- Module lanes (если 406 ещё PARK — gate на уровне линии)  

## AC

- [ ] Guard + tests  
- [ ] BE tsc + order.service jest PASS  
