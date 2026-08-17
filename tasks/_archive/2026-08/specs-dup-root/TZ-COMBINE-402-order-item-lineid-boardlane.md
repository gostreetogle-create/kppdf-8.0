# TZ-COMBINE-402: Schema lineId + boardLane

РОЛЬ АГЕНТА: Backend schema

ЗАВИСИМОСТИ: TZ-COMBINE-401 (canon) — можно параллельно если читал Opus-решения ниже

LAYER: 2

CONFLICT KEYS: `backend/src/modules/order/order.schema.ts` ; migration/backfill script if any under `backend/` or `scripts/` ; related DTO types only if required for schema export

PAGES: N/A  
CHECKLIST: `docs/agent-checklists/TZ-COMBINE-402.md`

---

## Domain preflight

`OrderItem` сейчас `_id: false`, адрес = index. Добавляем стабильный `lineId`.

## ЧТО ДЕЛАТЬ

1. `OrderItem.lineId: string` (uuid) — required после backfill  
2. `OrderItem.boardLane: 'prep'|'design'|'shop'|'to_ship'|'shipped'` — default `prep`  
3. При create item: генерить `lineId`, `boardLane: 'prep'`, `status: 'pending'`  
4. Backfill существующих: lineId = uuid (или `legacy-${index}-${orderId}` стабильный), boardLane из status:
   - pending → prep  
   - in_production → shop  
   - ready → to_ship  
   - shipped → shipped  
5. Документировать в schema jsdoc: status деривируется в 403, не писать вручную в 402  
6. Запрет удаления item если boardLane !== 'prep' — можно stub throw в service remove-line path **если существует**; иначе TODO comment + test placeholder в 403  

## НЕ

- PATCH lane API (→ 403)  
- FE  
- Менять estimateDayOverrides ключи (остаются orderItemIndex)  
- Deploy  

## AC

- [ ] Schema + backfill path  
- [ ] BE tsc PASS  
- [ ] Focused order schema/service create still works  
- [ ] Archive + push  

```text
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
cd backend && pnpm exec jest --testPathPattern=order.service --coverage=false
```
