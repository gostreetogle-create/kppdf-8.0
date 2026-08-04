# TZ-CATALOG-302 checklist

> Status: **DONE** — Cursor Architect PASS 2026-08-04; archived.
> TZ: `tasks/TZ-CATALOG-302.md` · archive: `tasks/_archive/2026-08/TZ-CATALOG-302.done.md`
> Executor: backend agent on `D:\kppdf-8.0`, branch `main`.
> Commit/push: **NO COMMIT / NO PUSH** unless PO explicitly authorizes it.

## Preflight (before code)

- [x] Read `GEMINI.md`, `docs/AI-AGENT-GUIDE.md`, `docs/AUDIT-METHODOLOGY.md`, `docs/TZ-AUTHORING.md`.
- [x] Read `docs/PO-DIARY.md` §1–§4, `tasks/TZ-CATALOG-300.md`, `tasks/CATALOG-WAVE1.md`, and catalog audit.
- [x] Confirmed `TZ-CATALOG-301` archive is present and 302 is the only claimed catalog Wave 1 task.
- [x] Joined Team Room, checked status/inbox, and claimed `TZ-CATALOG-302`.
- [x] Checked current branch/worktree: `main`, HEAD `5c9d33e6774304e06b5d7337f41a6bf3a712fd9b`.
- [x] Reviewed dirty state. This main worktree contains substantial unrelated staged/unstaged work from parallel sessions; it will not be reverted, staged, committed, or rewritten.
- [x] Compared 302 conflict keys with active-map and Team Room. No competing owner for the 302 keys was reported.
- [x] Confirmed no existing composition implementation in Product/ProductModule schemas or controllers; existing legacy attach/material endpoints must remain compatible.
- [x] Confirmed Mongo/e2e availability must be tested; if unavailable, status is BLOCKED and no DONE archive is allowed.

## Scope lock

### In scope

- `composition[]` on Product and ProductModule with generated subdocument `_id`.
- Module/material composition CRUD endpoints.
- Product material-kind rule: `raw` material is rejected; other/legacy material kinds are accepted.
- Deduplication by `(lineType, refId)` with quantity increment.
- Max 1000 lines, positive quantities, ObjectId/existence validation.
- Dual-read GET fallback from legacy `productModuleIds[]` / `materials[]`, without writing legacy or composition during fallback.
- Regression/e2e coverage for composition and existing legacy attach/module flows.

### Explicitly out of scope

- `lineType=product` and `unitPriceOverride` (TZ-CATALOG-305).
- Full mixed graph DFS, cycle and depth guards (TZ-CATALOG-303).
- Legacy migration/wipe and legacy write lock (TZ-CATALOG-304).
- Frontend, composition tree/editor, Wave 2 (310+), Excel, BOM write, cost-rollup rewrite, where-used, photos/documents/stock redesign.
- Refactoring existing duplicate/legacy attach routes unless a demonstrated 302 regression requires the smallest compatibility fix.

## Acceptance

- [x] `composition[]` on Product + ProductModule with generated `_id` lines.
- [x] CRUD composition endpoints for both parents.
- [x] Product + raw material → 400.
- [x] Dedup → quantity++.
- [x] Positive quantity, valid refs, parent/child type rules, max 1000.
- [x] Legacy fields remain; dual-read GET is read-only and deterministic.
- [x] Generic PATCH cannot silently overwrite composition.
- [x] `attachModule` continues writing legacy only in 302.
- [x] Backend tsc PASS.
- [x] Targeted unit tests PASS.
- [x] E2E catalog-composition 6/6 PASS.
- [x] `git diff --check` on conflict keys PASS.
- [x] Independent Cursor review PASS before DONE.
- [x] Archive, lock, progress/status synchronization and task cleanup completed only after all gates.

## Executor report (2026-08-04)

**Bug fixed:** `ProductService.addComposition` dedup (lineType, refId) quantity increment was broken because `doc.composition` returned hydrated Mongoose subdocuments. `upsertDeduplicated` created a mixed array (subdocs + new plain object from spread), and `findOneAndUpdate` with `$set` failed to serialize the mixed array properly, reverting to original state.

**Fix:** Added `plainCompositionLine()` helper that converts each composition subdocument to a clean plain object before passing to `upsertDeduplicated` (and `updateComposition`/`removeComposition`). This ensures `$set` always receives an array of plain objects, not mixed Mongoose subdocuments.

**Changes:**
- `backend/src/modules/product/product.service.ts` — `plainCompositionLine()` helper + use in addComposition/updateComposition/removeComposition
- `backend/src/modules/catalog/composition-line.service.spec.ts` — new unit tests for `upsertDeduplicated` (4 tests: append, dedup 2+3→5, different lineTypes, hex string equality)

**Gates:**
- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` → PASS
- `cd backend && pnpm exec jest --no-coverage composition-line --forceExit` → 4/4 PASS
- `cd backend && pnpm exec jest --config test/jest-e2e.json --runInBand catalog-composition --forceExit` → 6/6 PASS
- `git diff --check` on conflict keys → PASS (no whitespace issues)

**Conflict disclosure:** No frontend/materials touched. No 316/317 files touched. Pre-existing trailing whitespace in docs/tasks NOT touched per user instruction. Parallel process added `versionedCompositionFilter` helper (retained, integrated). Debug `console.error PRODUCT_COMPOSITION_DEBUG` was already removed by parallel process.

## Architect verdict

- Status: **PASS** (Cursor 2026-08-04) — re-ran `composition-line` 4/4 + `catalog-composition` e2e 6/6.
- Archive: `tasks/_archive/2026-08/TZ-CATALOG-302.done.md`
- Lock: `.mimocode/locks/TZ-CATALOG-302-composition-api.lock`
- Nit (non-blocking): Module `addComposition` may still pass hydrated subdocs into upsert via `doc.save()`; Product `$set` path was the proven failure. Optional harden in successor.
- Next: TZ-CATALOG-303.
