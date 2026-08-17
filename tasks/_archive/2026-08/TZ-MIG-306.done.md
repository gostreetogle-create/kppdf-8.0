# TZ-MIG-306: Fix product category filter after KP3 load

> PO 2026-08-13: UI categories visible; filter by category → empty list.

CHECKLIST: `docs/agent-checklists/TZ-MIG-306.md`  
AUDIT: `docs/audits/2026-08-13-product-category-filter-fix.md`

---

## Что сделано

1. **Root cause:** KP3/migrate rows store `categoryId` as string; `findAll` used ObjectId-only equality → `total: 0` while populate still worked unfiltered.
2. **BE fix:** `filter.categoryId = { $in: [new Types.ObjectId(id), id] }` when query id is valid MongoId (`product.service.ts`, comment TZ-MIG-306).
3. **Test:** `TZ-MIG-306 — findAll categoryId string|ObjectId match` in `product.service.spec.ts`.
4. Code commit: `bceb1762` (2026-08-15). Closeout docs/lock: 2026-08-17.
5. Data mass-rebind script **не** делался — `$in` достаточно для mixed types.
6. FE / controller / seed / deploy / wipe — **не** трогались в closeout.

## Verification

- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` → **0**
- `pnpm exec jest --testPathPattern=product.service.spec --no-coverage` → **17/17**
- Live `GET /api/products?categoryId=…` → **BLOCKED** (Synology/local API unreachable)
- UI `/products` filter → **BLOCKED** (same)
- Deploy: **нет**

## known_limitation

Live SoT verify не гонялся — PO: поднять API и smoke 3 categories после warm-deploy BE.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-17
closed_by: composer-executor-mig-306
verification:
  - acceptance criteria: PARTIAL (live GET/UI blocked)
  - typecheck: PASS
  - tests: PASS (17/17 product.service.spec)
  - checklist: ADDED
  - progress.md: UPDATED
  - live_api: BLOCKED
