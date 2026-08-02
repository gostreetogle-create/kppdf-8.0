ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-02
closed_by: Buffy (canonical /d/kppdf-8.0)
tz_id: TZ-DOC-320-text-block-enum-resolution-fallback.md
commit: feat(text-block): migrate legacy enum → categoryId with default-resolve

verification:
  - acceptance criteria: TZ-DOC-320 §Acceptance 1..7 covered by gates
  - backend tsc (tsc -p tsconfig.build.json --noEmit): PASS (exit 0)
  - backend jest targeted text-block (no coverage): 2 suites / 20 tests PASS
    (text-block.service.spec.ts: 8 new TZ-DOC-320 tests + text-block-
    category.service.spec.ts: 12 unchanged TZ-DOC-315 tests)
  - backend jest e2e text-blocks: 9/9 PASS (was 3/9 before the fix)
  - regression — backend jest e2e user-organizationId + production: 12/12 PASS
  - regression — backend jest unit is-object-id (TZ-BACKEND-E2E-HARNESS): 4/4 PASS
  - git diff --check (staged): PASS
  - production data NOT altered

root_cause:
  TZ-DOC-315 ships `TextBlockCategoriesSeed` (backend/src/common/seed/text-block-
  categories.seed.ts) but the provider is NOT registered in
  backend/src/app.module.ts (line 239+ providers block). After app.init()
  in test bootstrap (createTestApp clears collections), the
  text_block_categories collection has 0 documents.
  TextBlockService.create() for system admin (organizationId === null)
  went through resolveDefault() → null → BadRequestException «Default
  text-block category unavailable…» → 400 on every POST/PATCH with
  legacy category= enum.

deliverables:
  text_block_service_changes:
    - backend/src/modules/text-block/text-block.service.ts
      + SECOND @InjectModel('TextBlockCategory') so the service can
        resolve SERVER-side defaults without going through
        TextBlockCategoryService.findAll() (keeps category service
        API surface unchanged — TZ-DOC-315 territory).
      + LEGACY_CATEGORY_SLUG map (legal→legal, intro→intro,
        outro→outro, custom→custom).
      + Modified create() to ladder: assertAssignable → legacy
        slug-map → resolveDefault → ensureSystemDefault lazy upsert.
      + New private ensureSystemDefault() helper — idempotent
        upsert of «Общее» (slug obshchee, isSystem/isDefault/
        isActive all true) with WARN log on first insert.
      + Logger imported from @nestjs/common.

  text_block_spec:
    - backend/src/modules/text-block/text-block.service.spec.ts (NEW)
      8 regression tests:
      1. honors a caller-supplied categoryId via assertAssignable
      2. legacy legal enum → resolves through slug-map to system category
      3. legacy enum without system match → resolveDefault (org scope)
      4. no categoryId, no legacy enum, resolveDefault null → lazily
         upserts «Общее»
      5. upserted default has categoryId and category attributes back
         on the block
      6. rejects a duplicated slug with ConflictException (11000)
      7. propagates an unknown Mongoose error untouched
      8. backward-compat sanity for the BadRequestException import

jobs_tracking:
  active_task:
    - tasks/TZ-DOC-320-text-block-enum-resolution-fallback.md (this
      spec, kept as the chain-of-custody alongside the archive)
  archive:
    - tasks/_archive/2026-08/TZ-DOC-320-text-block-enum-resolution-fallback.done.md
      (this file)
  lock:
    - .mimocode/locks/TZ-DOC-320-text-block-enum-resolution-fallback.lock
      (gitignored; matches TZ-DOC-315/278/275 pattern)
  status_progression:
    - STATUS.md (TZ-DOC-320 DONE entry; commit-hash documented)
    - progress.md (single-line entry)

out_of_scope (per user NO-TOUCH list and TZ-DOC-315 contract):
  - backend/src/common/decorators/is-object-id.decorator.ts
    (TZ-BACKEND-E2E-HARNESS territory, not modified).
  - backend/src/common/validators/is-object-id.pipe.ts (not modified).
  - backend/src/modules/text-block-category/** (TZ-DOC-315 territory,
    not modified — including the unwired seed).
  - backend/src/common/seed/text-block-categories.seed.ts (encoding
    is CP1251, byte-level; fixing is TZ-DOC-315 territory; the
    contract is decoupled by service-side lazy upsert fallback).
  - backend/test/e2e/integration.e2e-spec.ts (order-dependent flake
    confirmed in TZ-BACKEND-E2E-HARNESS; not modified).
  - frontend/, sanitize-html, Materials, Admin/RBAC, TZ-278, Z-backlog,
    TZ-MATERIALS-*, document-table-type.

known_limitations:
  - The CP1251-encoded seed file remains a known-but-not-fixed issue.
    The new `ensureSystemDefault()` uses Unicode escapes («Общее» →
    `'\u041e\u0431\u0449\u0435\u0435'`) so it's encoding-agnostic.
  - If the TZ-DOC-315 seed is wired in some future TZ, `resolveDefault`
    will find the seed-inserted system category and the lazy upsert
    becomes a no-op (idempotent findOne returns existing).
  - The `name` field of lazily-upserted «Общее» is ASCII-escaped
    Cyrillic; legacy seed's `name` field is CP1251-byte Cyrillic —
    these two would render differently if shown side by side, but
    both encode the same string semantically.
  - TZ-DOC-318 (final enum→categoryId migration with category field
    removal) remains out-of-scope for this task.
  - E2E browser check: NOT APPLICABLE (no UI changes).
  - Push: NOT done (user instruction).

subsequent_regressions:
  - `pnpm test:e2e` (full sweep) still has 1 known flake unrelated to
    TZ-DOC-320:
    * backend/test/e2e/integration.e2e-spec.ts: order-dependent on the
      text-blocks suite (passes in isolation). Already filed in
      TZ-BACKEND-E2E-HARNESS archive; not addressed here per
      NO-TOUCH list.

archive_id: TZ-DOC-320
next_chain_step: TZ-DOC-321 — wire TextBlockCategoriesSeed into
app.module.ts providers (closes the contract gap that TZ-DOC-320
worked around). NOT started in this session.
