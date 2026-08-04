# TZ-CATALOG-304 checklist

> Status: **DONE** — Cursor Architect PASS 2026-08-04  
> Archive: `tasks/_archive/2026-08/TZ-CATALOG-304.done.md`  
> Lock: `.mimocode/locks/TZ-CATALOG-304-composition-migrate.lock`  
> Task: `tasks/TZ-CATALOG-304.md` · canonical workspace only.  
> Commit/push: **NO** unless PO explicitly authorizes it.

## Claim slot

- agent_id: `agent-3e757640b7` (Basher) + Cursor closeout `2026-08-04`
- claimed_at: `2026-08-04T19:09:30.699Z`
- workspace: `D:\kppdf-8.0`
- Team Room: claimed successfully; lease active.

## Preflight

- [x] Canonical `D:\kppdf-8.0`
- [x] Verdict TZ-CATALOG-303 = PASS; TZ-CATALOG-317 = PASS (HARD GATE)
- [x] No frontend / 305 work in this closeout beyond adjacent e2e bleed

## Conflict keys (+ necessary cost dual-read)

- `backend/src/database/migrations/2026-08-04-TZ-CATALOG-304-composition-migrate.ts` (+spec)
- `backend/src/modules/product/product.service.ts`
- `backend/src/modules/product-module/product-module.service.ts` (+spec)
- `backend/test/e2e/products-attach-modules.e2e-spec.ts`
- `backend/test/e2e/product-modules.e2e-spec.ts`
- `backend/test/e2e/cost-calculation.e2e-spec.ts`
- also: `cost-calculation.service.ts` / `.module.ts` (AC4 dual-read)
- adjacent bleed fixed: `catalog-composition.e2e-spec.ts`, `product-module-photos.e2e-spec.ts`

## Acceptance

- [x] Dry-run migration reports counters without writes
- [x] Apply idempotent; nonempty composition skipped; legacy fields remain
- [x] Legacy writes rejected (attach/detach 410; non-empty materials[] 400); empty `materials: []` treated as omit
- [x] Cost dual-read composition-first + legacy fallback
- [x] tsc + focused unit/e2e PASS
- [x] Executor evidence (unit dry-run / 2nd apply = 0)
- [x] Cursor PASS + archive (this session)

## Gates (Cursor re-run 2026-08-04)

- backend `tsc -p tsconfig.build.json --noEmit`: **PASS**
- unit migrate + product-module.service: **8/8 PASS**
- e2e cost + product-modules + products-attach + catalog-composition + product-module-photos: **25/25 PASS**

## Executor report

### Migration evidence (unit, in-memory models)

```
[TZ-CATALOG-304] dry-run: modules=1, products=1, moduleLines=1, productLines=1,
  modifiedModules=0, modifiedProducts=0, skippedModules=0, skippedProducts=0
[TZ-CATALOG-304] apply: ... moduleLines=1, productLines=1, modifiedModules=1, modifiedProducts=1
[TZ-CATALOG-304] apply (2nd): moduleLines=0, productLines=0, modifiedModules=0, modifiedProducts=0,
  skippedModules=1, skippedProducts=1
```

Sample: module with `materials[{materialId}]` → `composition[{lineType:material,refId,...}]`; product with `productModuleIds` → `composition[{lineType:module,...}]`. Skip-if-nonempty documented in migrate.ts.

### Runtime

- `attachModule` / `detachModule` → GoneException 410
- non-empty `materials[]` create/update → 400; composition = only write path
- MATERIALS-309 immutable override restored on composition material lines
- Cost: composition-first; fallback productModuleIds / materials[]; workTypes legacy; product-level material lines included

### Known limits

- Prod Mongo dry-run not run in this session (unit evidence + CLI `--dry-run` available); prod-apply only after PO OK (AC7 + 317 already PASS)
- Nested module recursion in cost deferred (305)
- Legacy schema columns retained (successor cleanup)

## Architect verdict

- Status: see `CATALOG-WAVE1-REVIEW.md`
