# Product category filter fix (TZ-MIG-306)

> Дата аудита: 2026-08-13 (symptom) · closeout verify: 2026-08-17  
> SoT target: `http://192.168.1.103:3000` (Synology LAN) · Executor workspace: `main`

## Symptom

На `/products` категории в списке populate'ятся, но фильтр по категории возвращает пустой список.

| Observation (2026-08-12) | Value |
|--------------------------|-------|
| Products on SoT | 699 |
| Categories | ~13–15 |
| Products with populated `categoryId` | ~670/699 |
| `GET /api/products?categoryId=<same _id>` | **total: 0** |
| Products without category (KP3 empty `category`) | 29 (expected) |

## Root cause

**String vs BSON ObjectId mismatch in Mongo after KP3 load.**

- FE и API передают `categoryId` как hex-строку (валидный MongoId).
- Старый `ProductService.findAll` ставил `filter.categoryId = new Types.ObjectId(q.categoryId)` — строгое равенство ObjectId.
- После MIG-302 часть документов хранит `categoryId` как **string** (legacy KP3/migrate rows), часть — как **ObjectId** (schema ref).
- Populate по ref всё равно показывает категорию в list без фильтра, но equality-фильтр ObjectId ≠ string → `total: 0`.
- PATCH того же id не помогал, пока в базе оставались string-строки и фильтр был ObjectId-only.

**Not in scope:** photoIds (TZD-47 / MIG-303); data mass-rebind script не понадобился — BE `$in` покрывает оба типа.

## Fix (BE, minimal)

`backend/src/modules/product/product.service.ts` — `findAll`:

```typescript
if (q.categoryId) {
  filter.categoryId = Types.ObjectId.isValid(q.categoryId)
    ? { $in: [new Types.ObjectId(q.categoryId), q.categoryId] }
    : q.categoryId;
}
```

Unit test: `TZ-MIG-306 — findAll categoryId string|ObjectId match` in `product.service.spec.ts`.

Code landed: commit `bceb1762` (`fix(products): restore category filter on list`).

## Verification

| Gate | Command | Result (2026-08-17) |
|------|---------|---------------------|
| BE typecheck | `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` | **PASS** (exit 0) |
| Unit tests | `pnpm exec jest --testPathPattern=product.service.spec --no-coverage` | **17/17 PASS** (incl. 1× MIG-306) |
| Live `GET /api/products?categoryId=…` | Synology LAN + local MCP | **BLOCKED** — API/MCP unreachable from executor |
| UI `/products` category filter | Browser on SoT | **BLOCKED** — same (no live API) |

### Live verify (deferred to PO)

When SoT is up:

1. Login admin → pick product with populated category → note `_id`.
2. `GET /api/products?categoryId=<id>` → expect `total ≥ 1`.
3. UI `/products` → select same category → list non-empty.
4. Optional mongo spot-check: `{ categoryId: { $type: 'string' } }` count on 3 samples.

## Before / after (expected on SoT after deploy)

| Metric | Before fix | After fix (expected) |
|--------|------------|----------------------|
| Filtered GET for category with products | `total: 0` | `total ≥ 1` |
| Unfiltered list | unchanged | unchanged |
| 29 without category | visible in «все» | unchanged |

Deploy: **не** в рамках этой closeout-сессии (PO rule).

## References

- Spec: `tasks/_backlog/migrate-kp3/TZ-MIG-306-fix-category-filter.md` → archived `tasks/_archive/2026-08/TZ-MIG-306.done.md`
- KP3 load: `docs/audits/2026-08-12-kp3-mcp-load-report.md`
- Checklist: `docs/agent-checklists/TZ-MIG-306.md`
