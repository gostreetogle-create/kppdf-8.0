# TZ-COMBINE-406: moduleLanes SoT (v1.1 PARK)

> Старт только после COMBINE-405 DONE (уже на main). Opus: v1 без модулей.

STATUS: **READY** — unpark PO 2026-08-16 (добить модули). Зависимость: COMBINE-405 DONE.

РОЛЬ АГЕНТА: Backend order schema/service

LAYER: 2

CONFLICT KEYS: `backend/src/modules/order/order.schema.ts` ; `backend/src/modules/order/order.service.ts` ; `backend/src/modules/order/order.controller.ts` ; dto lane/module

---

## Domain preflight

Карточки изделий уже на `boardLane`. Модуль едет отдельно → разреженный `Order.moduleLanes[]`.
Ключ: `(lineId, moduleId)` — как estimate composite, не только moduleId.
Материалы не участвуют. Только top-level BOM модули изделия.

## ЧТО ДЕЛАТЬ

1. Schema: `moduleLanes: [{ lineId, moduleId, lane }]` sparse  
2. PATCH `.../lines/:lineId/modules/:moduleId/lane`  
3. Полоса линии = **min** по её moduleLanes (если есть записи); иначе boardLane линии  
4. Last module leave → parent lane follows (min rule)  
5. Specs rollup min + reject shipped via PATCH  

## НЕ

- FE ghost (→ 407)  
- Partial ship  
- Deploy  

## AC

- [ ] Schema + API + jest  
- [ ] BE tsc PASS  
