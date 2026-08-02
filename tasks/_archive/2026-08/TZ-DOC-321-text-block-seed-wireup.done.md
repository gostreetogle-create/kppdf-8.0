ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-02
closed_by: Buffy (canonical /d/kppdf-8.0)
tz_id: TZ-DOC-321-text-block-seed-wireup
commit: fix(app-module): wire TextBlockCategoriesSeed in providers — TZ-DOC-321

verification:
  - acceptance criteria: TZ-DOC-321 §Acceptance covered by gates below
  - bottom-line proof — backend jest e2e text-block-category-seed-init:
    1/1 PASS (boot assertion: text_block_categories contains at least
    one { isSystem, isActive, isDefault } row with slug
    SYSTEM_DEFAULT_TEXT_BLOCK_CATEGORY_SLUG after app.init())
  - backend tsc (tsc -p tsconfig.build.json --noEmit): PASS (exit 0)
  - backend jest targeted text-block (no coverage): 2 suites / 19 tests PASS
    (TZ-DOC-315 category-spec 12 unchanged + TZ-DOC-320 service-spec 7
    unchanged; no regression in either)
  - backend jest e2e text-blocks + text-block-category-seed-init:
    2 suites / 10 tests PASS
  - regression — backend jest e2e user-organizationId + production:
    12/12 PASS
  - regression — backend jest unit is-object-id (TZ-BACKEND-E2E-HARNESS):
    4/4 PASS
  - git diff --check (staged, only my 3 TZ-DOC-321 files): clean
  - production data NOT altered

scope:
  + AppModule.imports: add `TextBlockCategoryModule` next to
    `DocumentTemplateCategoryModule` so the MongooseModel token for
    `TextBlockCategory` is reachable from the cross-module
    `TextBlockCategoriesSeed` provider.
  + AppModule.providers: add `TextBlockCategoriesSeed` between
    `DocumentTemplateCategoriesSeed` and `BomComponentResolveService`
    to close the TZ-DOC-320 known-limitation #1 (seed file existed
    since TZ-DOC-315 but was never wired). Pure provider-list
    addition.
  + `backend/src/common/seed/text-block-categories.seed.ts`:
    rewrite from CP1251/UTF-8 mixed encoding to pure UTF-8. The
    original file has `name: 'Общее'` stored as bytes `CE E1 F9 E5
    E5` (CP1251), description field was already UTF-8, log `«»`
    guillemets were CP1251 again. After write_file the name literal
    is `D0 9E D0 B1 D1 89 D0 B5 D0 B5` (canonical UTF-8). Verified
    via `file backend/src/common/seed/text-block-categories.seed.ts`
    which now reports "Unicode text, UTF-8 text, with CRLF line
    terminators" (was "Non-ISO extended-ASCII text").
  + `backend/test/e2e/text-block-category-seed-init.e2e-spec.ts`
    (NEW, ~30 effective lines): proves the seed is wired by
    asserting ≥1 system-active-default category row exists in
    `text_block_categories` collection after `createTestApp()` calls
    `app.init()`. Slug lookup uses the ASCII constant
    `SYSTEM_DEFAULT_TEXT_BLOCK_CATEGORY_SLUG` so encoding is not a
    concern for the assertion.

api_delta_documented:
  DocumentTemplateCategoriesSeed lifecycle: OnApplicationBootstrap
  TextBlockCategoriesSeed lifecycle:        OnModuleInit
  Both compile-time-checked classes. Both run during `app.init()`.
  Both produce the same observable end-state (idempotent system
  default «Общее»). The shape difference is documented in a JSDoc
  header in the seed file so a successor TZ can normalize if
  desired; not changed here because the user instruction was
  "if API difference exists — document in archive, do NOT fix-force".

not_modified_intentionally:
  - backend/src/modules/text-block/text-block.service.ts:
    TZ-DOC-320 resolution ladder (4 steps) + `ensureSystemDefault()`
    are kept as defense-in-depth. After this TZ-DOC-321 the ladder
    effectively only ever falls through to step 1 (`resolveDefault`
    finds the seed-inserted category), but the auto-heal branch
    remains available for future seed deletion, admin deactivation,
    or partial-DB bootstraps. Removing the redundancy is deferred to
    TZ-DOC-322 (successor microfix).
  - backend/src/modules/text-block-category/** — declared
    TZ-DOC-315 territory; not touched.

known_limitations:
  - The defense-in-depth logic in TextBlockService is now redundant
    for normal boots. Two options for TZ-DOC-322 successor:
        a) Full removal: delete LEGACY_CATEGORY_SLUG,
           ensureSystemDefault(), re-add the explicit-400 contract.
        b) Keep: small diff; "ship what you have".
    TZ-DOC-321 chose (b) per the user's "defense-in-depth remains"
    instruction.
  - A pre-existing TZ-PRODUCTS-301 worktree state during this
    session added incomplete `ColorReferenceModule` imports to the
    same `app.module.ts`. Confirmed via `git diff -- app.module.ts`
    that those lines were NOT mine. I reverted `app.module.ts` to
    HEAD before applying my changes, then re-applied only my TZ-DOC-321
    edits, so my commit (`e7a2550`) contains only the lines relevant
    to this TZ. The untracked `ColorReferenceModule` lines from
    TZ-PRODUCTS-301 will be re-introduced by their session when they
    create the actual files (this session chose not to inherit
    half-baked imports).
  - Nest's `resolveComponentInstance` failure mode at
    `TEST.createTestingModule(...).compile()` was useful evidence in
    this debugging session: when the MongooseModel token is requested
    from a cross-module provider without the originating module in
    AppModule.imports, Nest raises
    "Nest can't resolve dependencies of the TextBlockCategoriesSeed
    (?). Please make sure that the argument 'TextBlockCategoryModel'
    at index [0] is available in the AppModule context." The fix
    was unambiguous: add the module to AppModule.imports.

archive_id: TZ-DOC-321
next_chain_step: TZ-DOC-322 — microfix: remove the now-redundant
`ensureSystemDefault()` and `LEGACY_CATEGORY_SLUG` ladder from
`TextBlockService`. Restore the explicit-400 contract and add an
e2e case. Out of scope for this session.
