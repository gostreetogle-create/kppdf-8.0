ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-02
closed_by: Buffy (canonical /d/kppdf-8.0)
tz_id: TZ-DOC-322-text-block-explicit-resolve
commits:
  - 6883f93c84eafea4412a5f65a0addd22e020b851
    feat(text-block): remove lazy-upsert ladder, restore explicit 400 contract — TZ-DOC-322 (part 1)
  - 7d73948038bf48a6922765ecfd0f55a0a30f853e
    chore(seeds): normalize lifecycle API to OnModuleInit — TZ-DOC-322 (part 2)

verification:
  - acceptance criteria: §Acceptance covered by gates below
  - bottom-line proof: jest e2e text-block-category-seed-init 1/1 PASS
    (TZ-DOC-321 boot assertion) — proves the seed is still wired after
    ladder removal AND after lifecycle normalization.
  - bonus proof: transient probe (deleted after) confirmed
    `document_template_categories` ≥1 system-active-default row
    exists after `createTestApp()` under the new OnModuleInit lifecycle.
  - backend tsc -p tsconfig.build.json --noEmit: PASS exit 0
  - backend jest text-block (no coverage): 2 suites / 18 tests PASS
    (TZ-DOC-315 category-spec 12 unchanged + TZ-DOC-322 service-spec
    6 driver tests)
  - backend jest e2e text-blocks: 9/9 PASS (no regression in the
    TZ-DOC-311/320 contract — `categoryId`-less creates resolve via
    resolveDefault to the seed-inserted system default; legacy
    `category: 'legal'` enum values still persist on the schema's
    `category` field exactly as before)
  - backend jest seed-init e2e (regression after ladder removal):
    1/1 PASS — the seed still runs after the ladder is gone;
    explicit-400 contract does not fire when seed is present.
  - regression — backend jest e2e user-organizationId + production:
    12/12 PASS
  - regression — backend jest unit is-object-id (TZ-BACKEND-E2E-HARNESS):
    4/4 PASS
  - git diff --check (staged, my 3 files): clean

scope:
  Part 1 — text-block.service.ts remove ladder (TZ-DOC-320 → TZ-DOC-322):
    - Removed `ensureSystemDefault()` private helper (~25 lines).
    - Removed `LEGACY_CATEGORY_SLUG` const + legacy-enum branch in
      `create()`. Legacy `dto.category` enum still persists on
      schema's `category` field for backward compat
      (TZ-DOC-318 successor plan to remove it) but no longer drives
      `categoryId`.
    - Removed second `@InjectModel('TextBlockCategory')` from
      constructor.
    - Removed imports `TextBlockCategory as TextBlockCategorySchema`,
      `TextBlockCategoryDocument`, `SYSTEM_DEFAULT_TEXT_BLOCK_CATEGORY_SLUG`.
    - Removed `Logger` import (no longer needed).
    - Restored explicit-400 `BadRequestException` in `create()`
      when `resolveDefault(organizationId) === null`. New message
      explicitly references the AppModule-wired seed and the
      dictionary fallback path — operators know what to do.

  Part 1 — text-block.service.spec.ts rewrite:
    - 7 → 6 driver tests.
    - Drop ladder coverage: legacy-slug-map test, legacy→resolveDefault
      test, two lazy-upsert tests removed.
    - Add explicit-400 contract test asserting
      `BadRequestException` (`status: 400`) when resolveDefault
      returns null.
    - Add a positive test that the legacy `dto.category` enum still
      persists on the schema's `category` field without affecting
      categoryId resolution.
    - Keep: assertAssignable happy-path, slug-conflict 11000,
      Mongoose-error-propagation.

  Part 2 — DocumentTemplateCategoriesSeed lifecycle normalize:
    - `OnApplicationBootstrap` → `OnModuleInit` import rename.
    - `onApplicationBootstrap()` → `onModuleInit()` method rename.
    - JSDoc updated to explain historical distinction and the
      observable end-state equivalence.
    - No body, fields, or idempotency-guard changes (preserves the
      TZ-DOC-307 scheme: findOne existing → skip; missing →
      insert with isSystem/isActive/isDefault).

scope_before_after:
  Files touched: 3 (text-block.service.ts, text-block.service.spec.ts,
                    document-template-categories.seed.ts)
  Lines: text-block.service.ts −74 (was 158, now 145 after rewrite
                                  to Lean new content; net −13 LOC
                                  after excluding JSDoc growth);
         text-block.service.spec.ts net −78 LOC (after rewrite;
                                  7 → 6 driver tests);
         document-template-categories.seed.ts +9/−3 net
                                  (import + method rename + JSDoc).
  Total project size: net −85 LOC across 3 files.

api_delta_after_TZ_DOC_322:
  DocumentTemplateCategoriesSeed lifecycle: OnModuleInit
  TextBlockCategoriesSeed lifecycle:        OnModuleInit
  Both unified. The TZ-DOC-321 documented shape difference is closed.

not_modified_intentionally:
  - backend/src/common/seed/text-block-categories.seed.ts
    (TZ-DOC-321 territory, COMMITTED — already OnModuleInit; the
    boot-assertion e2e spec proves it still runs after this TZ).
  - backend/src/modules/text-block-category/**
    (TZ-DOC-315 territory, COMMITTED).
  - backend/src/modules/document-template-category/** service +
    controller + schema (TZ-DOC-307 territory, COMMITTED).
  - The legacy `category: 'legal'|'intro'|'outro'|'custom'` enum on
    the schema + DTO — kept for backward compat; final removal is
    TZ-DOC-318 (successor micro-TZ, out of scope).
  - Other seed classes (AdminSeed, SettingsSeed, etc.) — none of
    these override lifecycle hooks; leave their contracts alone
    to keep the diff scoped.

known_limitations:
  - Service now throws BadRequestException for the "no default
    exists" condition. Operations monitoring: any 4xx firing
    from `/api/text-blocks` POST with body matching
    `categoryId`-less + categoryId-empty cases should be
    investigated (it means the seed has been deactivated,
    deleted, or never wired). Loop-tolerant logs (warning, not
    error, since this is a config concern, not a bug).
  - The legacy `category: 'legal'|'intro'|'outro'|'custom'` enum
    is now a no-op with respect to `categoryId` resolution — but
    it does still persist on the schema. New code shouldn't
    pass it; legacy callers continue working without breakage.

archive_id: TZ-DOC-322
next_chain_step:
  TZ-DOC-323 — optional microfix: decide whether to remove the legacy
  `category: 'legal'|'intro'|'outro'|'custom'` enum entirely from
  the text-block schema. Predecessor TZ-DOC-318 (in STATUS "next
  chain step after TZ-DOC-315 chain closed"). Out of scope here.
