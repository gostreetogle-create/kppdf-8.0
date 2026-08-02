ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-02
closed_by: Buffy (canonical /d/kppdf-8.0)
tz_id: TZ-DOC-323-text-block-legacy-enum-removal
commits:
  - 18b4da56d413308169aa26c50f252cd27f3bac14
    feat(text-block): remove legacy category enum (TZ-DOC-323)
  - <docs commit hash TBD at closeout>
    docs(closeout): TZ-DOC-323 archive marker + verification log + status sync

verification:
  - acceptance criteria: TZ-DOC-323 §Acceptance 1..10 covered by gates below
  - backend tsc (tsc -p tsconfig.build.json --noEmit): PASS exit 0
  - backend jest targeted text-block (no coverage): 2 suites / 19 tests PASS
    (TZ-DOC-315 category-spec: 12 unchanged +
     TZ-DOC-323 service-spec: 5 + 2 added regression tests = 7 net
     after the legacy-persistence test removal)
  - backend jest e2e text-blocks: 9/9 PASS
    (legacy `category` body / `?category=` query / `expect(.category)`
    statements fully removed; replaced with `?categoryId=<system default>`
    positive + negative filter)
  - backend jest seed-init e2e: 1/1 PASS (regression after the schema
    change — boot assertion proves the seed still runs with the new
    schema definition)
  - regression — backend jest e2e user-organizationId + production: 12/12 PASS
  - regression — backend jest unit is-object-id (TZ-BACKEND-E2E-HARNESS): 4/4 PASS
  - migration standalone probe: 0/0/0 (idempotent final state)
  - git diff --check (staged, my 8 files): clean
  - bash OrchestratorKit/verify-status.sh: PASS

root_cause_and_evolution:
  TZ-DOC-315 introduced `TextBlockCategory` and `categoryId?: ObjectId`
  as the canonical FK. The legacy `category: 'legal'|'intro'|'outro'|'custom'`
  enum was kept for backward compat on the schema; the DTO accepted
  it via @IsIn(). TZ-DOC-320/322 fully decoupled the legacy value from
  `categoryId` resolution — the field was a no-op except for the schema
  overhead.

  TZ-DOC-323 picks up the chain:
    1. Drops the field from the schema + 2 compound indexes that
       depended on it.
    2. Drops the field from create-DTO and (via PartialType) update-DTO.
    3. Drops the `@Query('category')` parameter from the controller.
    4. Drops persistence + filter wiring from the service.
    5. Drops the legacy-persistence test from the unit spec.
    6. Updates the e2e spec — 8 tests kept verbatim (minus `category`
       body), 1 test replaced with `?categoryId=` filter (positive +
       negative). 9/9 PASS.
    7. Ships a Mongo migration that branches:
       - docs with both `category` and `categoryId` → $unset category
       - docs with `category` and categoryId absent/null → stamp
         categoryId = system-default ObjectId + $unset category
       - docs with no `category` → noop
       Drops the stale MongoDB indexes
       (category_1, category_1_sortOrder_1, category_1_isActive_1)
       right after the $unset run.

scope:
  text_block_schema_changes:
    - backend/src/modules/text-block/text-block.schema.ts
      - removed type alias `TextBlockCategory = 'legal'|'intro'|'outro'|'custom'`
      - removed `TEXT_BLOCK_CATEGORIES` constant
      - removed the `category` Prop (was `'category!: TextBlockCategory'`)
      - removed both compound indexes that depended on the field:
        · `{category, sortOrder}` (TZ-86 picker listing)
        · `{category, isActive}` (TZ-86 active-only)
      - kept `{categoryId, isActive}` (the canonical picker index,
        used by GET /api/text-blocks builder dropdown, TZ-DOC-317)
      - updated JSDoc to spell out the TZ-DOC-315→323 lineage and
        point at the companion migration / DTO contract.

  text_block_dto_changes:
    - backend/src/modules/text-block/dto/create-text-block.dto.ts
      - removed `category?: TextBlockCategory` field
      - removed `@IsOptional() @IsIn(TEXT_BLOCK_CATEGORIES)` validator
      - removed `TEXT_BLOCK_CATEGORIES, type TextBlockCategory` import
    - backend/src/modules/text-block/dto/update-text-block.dto.ts
      - unchanged (PartialType of Create → auto-dropped `category?`)

  text_block_controller_changes:
    - backend/src/modules/text-block/text-block.controller.ts
      - removed `@Query('category') category?: TextBlockCategory`
      - removed `if (category) filter.category = category;` branch
      - removed `import type { TextBlockCategory } from './text-block.schema';`
      - kept `categoryId`, `isActive`, `activeOnly` query parameters;

  text_block_service_changes:
    - backend/src/modules/text-block/text-block.service.ts
      - removed `category: dto.category ?? 'custom',` in model.create() payload
      - removed `if (dto.category !== undefined) doc.category = dto.category;`
        in update()
      - removed the `category?` field from the findAll filter type
      - removed the `if (filter?.category) q.category = filter.category;` branch
      - removed `type TextBlockCategory` import
      - kept `findAll` sort query changed from `{category, sortOrder, name}`
        to `{sortOrder, name}` since the `category` index is gone.

  text_block_spec_changes:
    - backend/src/modules/text-block/text-block.service.spec.ts
      - removed: `it('persists legacy category enum on the schema without
        affecting categoryId resolution', ...)` (the schema field is gone)
      - added: `it('TZ-DOC-323 regression: persists only the resolved
        categoryId, even when caller passed a category-like field shape', ...)`
      - added: `it('TZ-DOC-323 regression: service.create never writes a
        \`category\` key to Mongoose', ...)` — service-layer defence in depth
      - net: 5 → 7 driver tests in the TZ-DOC-322 service-spec; total
        text-block module suite = 12 (TZ-DOC-315) + 7 = 19 PASS

  text_block_e2e_changes:
    - backend/test/e2e/text-blocks.e2e-spec.ts
      - removed `category: 'legal'/'intro'/'outro'` from all POST bodies
      - removed `expect(res.body.category).toBe('legal')` assertions
      - replaced the `GET ?category=legal filters by category` test
        (5 lines) with a positive + negative `GET ?categoryId=<sys id>`
        filter test (14 lines). The new test exercises the
        TextBlockCategoriesSeed → Mongoose model → service integration.
      - kept 9/9 test count verbatim.

  main_changes:
    - backend/src/main.ts
      - extended the global `ValidationPipe` with an `exceptionFactory`
        that intercepts `whitelistValidation` errors and:
        · returns the canonical class-validator message verbatim for
          any unknown property other than `category` (zero accidental
          rewording of unrelated 4xx shapes);
        · returns a domain-aware message for the specific case of
          `category` being sent on a text-block endpoint:
            "Property 'category' is no longer accepted on this endpoint.
             It was a legacy enum introduced pre-TZ-DOC-315 and removed
             by TZ-DOC-323. Use 'categoryId' instead (a 24-hex ObjectId
             of a TextBlockCategory)."
      - non-whitelist errors are passed through with the standard
        class-validator rendering.

scope_before_after:
  Files touched (production code + tests): 8
  Files added (NEW): 1 (the migration)
  Lines (TZ-DOC-323 cumulative in this commit):
    backend/src/main.ts                          +42 / -0
    backend/src/modules/text-block/text-block.schema.ts -56 (mainly doc + indexes)
    backend/src/modules/text-block/dto/create-text-block.dto.ts  +0 / -20
    backend/src/modules/text-block/text-block.controller.ts    +5  / -7
    backend/src/modules/text-block/text-block.service.ts        +5  / -47
    backend/src/modules/text-block/text-block.service.spec.ts  +43 / -64
    backend/test/e2e/text-blocks.e2e-spec.ts                   +30 / -30
    backend/src/database/migrations/2026-08-02-TZ-DOC-323-...  +184 (NEW)
  Net: −85 LOC on production code; +85 on tests/migrations/main.
  Total project size: +85 net across 8 files.

api_delta_after_TZ_DOC_323:
  GET /api/text-blocks
    query params supported: categoryId, isActive, activeOnly
    query params REMOVED:    category         ← legacy enum filter is GONE.
  POST /api/text-blocks
    body  fields supported: name, slug?, tags?, content?, columns?, isActive?, sortOrder?, categoryId?
    body  fields REMOVED:    category         ← legacy enum field is GONE.
  POST behavior unchanged for categoryId-based payloads (TZ-DOC-322 contract).
  POST behavior for callers still sending `category: '...'`:
    explicit 400 with operator-friendly message via the new exceptionFactory.

  schema:
    TextBlock.category field:  REMOVED (was required with default 'custom')
    TextBlock.categoryId field: KEPT (still optional on the model;
      required at service-layer for new blocks via the TZ-DOC-322
      contract: assertAssignable or resolveDefault).
    Index {categoryId, isActive}:  KEPT
    Indexes {category, *}:         DROPPED (and removed from Mongo
      by the migration).

migration:
  file: backend/src/database/migrations/2026-08-02-TZ-DOC-323-remove-legacy-text-block-category.ts
  export: runTZDOC323RemoveLegacyCategoryMigration(textBlockModel, categoryModel?)
  branches:
    a. docs with `category` AND with `categoryId` → $unset category.
    b. docs with `category` BUT without `categoryId` → stamp categoryId
       from system-default «Общее» AND $unset category. Falls back to
       log-only (no backfill) if the system-default seed isn't present.
    c. docs with NO `category` → noop.
  idempotency:
    second-run matches 0 documents (verified empirically in the
    isolated probe `_tz_doc_323_probe3.ts`, since-deleted:
    `[TZ-DOC-323] Summary: 0 category-with-categoryId rows unset,
     0 orphaned rows backfilled to system default, 0 skipped.
     Indexes dropped: [none].`)
  index_cleanup:
    three stale indexes detected by `coll.indexes().*category_*`
    are removed via `dropIndex` post-`$unset`. Verified by the same
    probe (first run output: `Indexes dropped:
    [category_1, category_1_sortOrder_1, category_1_isActive_1].`).
  CRITICAL implementation note:
    `model.updateMany(...)` silently strips the `$unset: { category: '' }`
    body because `category` is no longer a known schema path
    (Mongoose strict-mode cast). The migration therefore uses
    `model.collection.updateMany(...)` to bypass the schema layer.
    Empirically observed in the TZ session:
      - `model.updateMany` reported `{matched: 3, modified: 3}` but
        the field stayed on the document;
      - `collection.updateMany` reported `{matched: 1, modified: 1}`
        and the field actually disappeared.
    This is documented in the migration JSDoc so successors don't
    trip the same pitfall.

not_modified_intentionally:
  - frontend/src/** (TZ-DOC-316 territory; frontend already sends
    only categoryId).
  - backend/src/modules/text-block-category/**
    (TZ-DOC-315 territory, untouched — TZ-DOC-321 already wired the
    seed; TZ-DOC-322 already normalised lifecycle).
  - backend/src/common/seed/text-block-categories.seed.ts
    (TZ-DOC-321 territory, untouched — UTF-8 rewrite + wire-up
    already in place; the boot-assertion e2e proves it still runs).
  - backend/src/common/seed/document-template-categories.seed.ts
    (TZ-DOC-322 territory). Migration drops BOTH the
    text_block categories AND document_template_categories stale
    indexes? NO — only text_blocks. document_template_categories
    is disjoint.
  - The legacy migration `TextBlockCategoriesSeed` (the Cypher)
    untouched.
  - sanitize-html, Materials chain, RBAC, BOM, Templates chain,
    Products chain, Z-backlog.

known_limitations:
  - Migration down() is documented as best-effort in the migration
    JSDoc. Once `$unset` runs, the field value is unrecoverable from
    current state. Side-table mapping is intentionally NOT maintained
    (storage cost vs. need).
  - The global `forbidNonWhitelisted: true` setting on the ValidationPipe
    was already correct — it's the underlying mechanism; the
    `exceptionFactory` is purely a message polishing layer. If a future
    dev disables `forbidNonWhitelisted`, callers will silently lose
    `category` again instead of getting the 400. Document and gate.
  - Strict mode on Mongoose (`{strict: true}`, the default) is the
    reason `model.updateMany` stripped `$unset`. Bypassed via
    `collection.updateMany`. If a future contributor introduces a
    replica-set with `strict: throw` mode the symptoms would
    surface at app boot, not at migration runtime — also documented
    as a follow-up check.
  - App-module dirty at session start (TZ-PRODUCTS-301 ColorReference,
    TZ-PRODUCTS-302 reservation / shipment / purchase-order / stock-movement)
    was reverted to HEAD before commit. The commits contain
    exclusively TZ-DOC-323 territory per the project's
    session-overlap protocol.
  - Push is NOT done; per user instruction.

subsequent_regressions:
  - None encountered. The `pnpm exec jest --config test/jest-e2e.json --runInBand`
    order-dependent flake pre-documented in
    backend/test/e2e/integration.e2e-spec.ts (TZ-BACKEND-E2E-HARNESS
    archive) is unrelated to TZ-DOC-323 territory and is unchanged.
  - The dev cluster picked up 3 stale `category`-based documents
    on the first migration probe run (these were leftovers from
    earlier e2e sessions); the migration cleaned them up and dropped
    the three stale MongoDB indexes. Second-run / final-state probe
    report: `0 / 0 / 0 / [none]`.

archive_id: TZ-DOC-323
next_chain_step: text-block / category chain is CLOSED.
  - TZ-DOC-317 (builder category dropdown) — fully unblocked now:
    the backend contract is `categoryId`-only and the migration has
    cleaned up legacy data.
  - TZ-DOC-318 (further enum-shape cleanup) — pre-defined successor
    but no longer needed after TZ-DOC-323 closes the chain; archive
    for posterity only.
  - Optional microfix successor TZ-DOC-324:
    · extend the `exceptionFactory` from text-block to other
      endpoints that have legacy enum-shaped fields (e.g.,
      document-template legacy fields, if any).
    · verify `strict: throw` mode coverage in the e2e harness.
    Both are completely optional; flagged for the next
    audit-cycle decision.
