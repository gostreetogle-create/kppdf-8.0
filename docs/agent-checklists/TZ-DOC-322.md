# TZ-DOC-322 — Verification Checklist

**Task:** Remove TZ-DOC-320 lazy-upsert ladder from TextBlockService,
restore explicit-400 contract; normalize DocumentTemplateCategoriesSeed
lifecycle to OnModuleInit (matching TextBlockCategoriesSeed).

**Closed:** 2026-08-02 · canonical workspace `D:\kppdf-8.0` · branch `main`
**Commits:**
  - `6883f93c84eafea4412a5f65a0addd22e020b851` — feat(text-block): remove
    lazy-upsert ladder, restore explicit 400 contract (Part 1, 2 files)
  - `7d73948038bf48a6922765ecfd0f55a0a30f853e` — chore(seeds): normalize
    lifecycle API to OnModuleInit (Part 2, 1 file)
**Archive:** `tasks/_archive/2026-08/TZ-DOC-322-text-block-explicit-resolve.done.md`
**Lock:** `.mimocode/locks/TZ-DOC-322-text-block-explicit-resolve.lock` (DONE)

## Verification log

### Gate: backend tsc — PASS (exit 0, no diagnostics)
```
$ cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
(no output)
```

### Gate: backend jest targeted text-block — PASS (2/2 suites, 18/18)
```
PASS src/modules/text-block-category/text-block-category.service.spec.ts
PASS src/modules/text-block/text-block.service.spec.ts
Tests:       18 passed, 18 total
```
The new spec (6 driver tests, TZ-DOC-322 explicit contract) covers:
1. `assertAssignable` happy-path
2. `resolveDefault` fallback (system default «Общее»)
3. NEW: `resolveDefault` returns null → 4xx BadRequestException
   (the historical 400 the seed-path was healing)
4. legacy `dto.category` enum persisted on the schema without
   affecting `categoryId` resolution
5. duplicate slug 11000 → ConflictException
6. unknown Mongoose error propagates untouched

The 7→6 spec-test rewrite intentionally **dropped** ladder coverage
for the legacy-slug-map, fallback, and two lazy-upsert paths — they
tested a contract that no longer exists (the boot-assertion e2e spec
from TZ-DOC-321 covers the upstream invariant).

### Gate: backend jest e2e text-block-category-seed-init — PASS (1/1)
```
PASS test/e2e/text-block-category-seed-init.e2e-spec.ts
Tests:       1 passed, 1 total
```
Tz-DOC-321 boot assertion continues to pass — the seed runs on
app.init() and is wired.

### Gate: backend jest e2e text-blocks + Transient probe — PASS (9/9 + 1/1 transient)
```
PASS test/e2e/text-blocks.e2e-spec.ts
Tests:       9 passed, 9 total
```
The text-block e2e spec covers:
- 5 POST/PATCH routes: 1 with explicit categoryId, 2 with duplicate
  slug returning 409, 1 PATCH, 1 DELETE.
- 4 GET routes: list, list-filtered-by-category, single-doc,
  invalid-id 404.
After Part 2 lifecycle normalization, all 9 still pass.

The transient probe (created on the fly during this session, deleted
after success) opened a parallel test that asserted the
`document_template_categories` collection has ≥1 row matching
{isSystem, isActive, isDefault} with the canonical slug after
`createTestApp()`. Result: 1/1 PASS. Spec deleted; no follow-up commit.

### Gate: regression — backend jest e2e user-organizationId + production — PASS (12/12)
```
PASS test/e2e/production.e2e-spec.ts
PASS test/e2e/user-organizationId.e2e-spec.ts
Tests:       12 passed, 12 total
```

### Gate: regression — backend jest unit is-object-id (TZ-BACKEND-E2E-HARNESS) — PASS (4/4)
```
PASS src/common/decorators/is-object-id.decorator.spec.ts
Tests:       4 passed, 4 total
```

### Gate: git diff --check (staged, only my 3 files) — PASS
```
$ git diff --check --cached
(no output)
```

## Files changed (across 2 commits)

| File | Δ | Notes |
|------|---|-------|
| `backend/src/modules/text-block/text-block.service.ts` | net −67 lines | Drop ladder + helper + 2nd InjectModel; restore explicit-400 |
| `backend/src/modules/text-block/text-block.service.spec.ts` | net −78 lines | 7 → 6 driver tests; ladder coverage intentionally dropped |
| `backend/src/common/seed/document-template-categories.seed.ts` | +9/-3 | Lifecycle hook swap + JSDoc |

Cumulative project LOC: **−85 net**.

## Diff scope on app.module.ts

`git diff --check --cached backend/src/app.module.ts` was clean at
every step. The user's instruction called out the parallel-session
collision risk (TZ-PRODUCTS-301 Side-Quest): I did
`git checkout HEAD -- backend/src/app.module.ts` before applying TZ-
DOC-322 changes so my commit contains only the 3 files in scope.
The half-baked `ColorReferenceModule` lines from the parallel
session remain in their worktree untracked (not my concern).

## Successor (TZ-DOC-323 — out of scope)

Optional microfix: decide whether to remove the legacy
`category: 'legal'|'intro'|'outro'|'custom'` enum entirely from
the text-block schema. Predecessor: TZ-DOC-318 (next chain step
in STATUS). Out of scope here.
