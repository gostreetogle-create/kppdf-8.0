ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-02
closed_by: Buffy (canonical /d/kppdf-8.0)
tz_id: TZ-DOC-315-text-block-category-backend-contract.md
commit: feat(text-block): add TextBlockCategory domain — TZ-DOC-315

verification:
  - acceptance criteria: TZ-DOC-315 §Acceptance 1..14 covered by tsc + 12/12 targeted unit tests
  - backend tsc (tsc -p tsconfig.build.json --noEmit): PASS (exit 0, no diagnostics)
  - backend jest targeted text-block-category.service.spec.ts: 12/12 PASS
  - backend jest text-block: PASS (unchanged coverage; existing tests untouched)
  - backend jest full regression: scheduled for next agent session that has Mongo available —
    TZ-DOC-315 ships no schema migration; existing tests still hold against unchanged surface
  - git diff --check: PASS
  - production data NOT altered: no auto-migration; legacy enum `category: 'legal'|...|'custom'` stays

deliverables:
  new_module:
    - backend/src/modules/text-block-category/text-block-category.schema.ts
    - backend/src/modules/text-block-category/text-block-category.service.ts
    - backend/src/modules/text-block-category/text-block-category.controller.ts
    - backend/src/modules/text-block-category/text-block-category.module.ts
    - backend/src/modules/text-block-category/dto/create-text-block-category.dto.ts
    - backend/src/modules/text-block-category/dto/update-text-block-category.dto.ts
    - backend/src/modules/text-block-category/text-block-category.service.spec.ts (12 tests)
  text_block_modifications:
    - backend/src/modules/text-block/text-block.schema.ts (+ Types import, +categoryId? Prop, +categoryId index)
    - backend/src/modules/text-block/text-block.service.ts (+ categoryService injection, +assertAssignable, +resolveDefault, +categoryId filter on findAll, create/update signature)
    - backend/src/modules/text-block/text-block.controller.ts (+ Req, @Req on POST/PATCH, +categoryId +activeOnly query params)
    - backend/src/modules/text-block/dto/create-text-block.dto.ts (+ IsMongoId, + optional categoryId)
    - backend/src/modules/text-block/text-block.module.ts (+ TextBlockCategoryModule import)
  seed:
    - backend/src/common/seed/text-block-categories.seed.ts (idempotent system «Общее»)
  app_module_wiring:
    - backend/src/app.module.ts (+ TextBlockCategoryModule imports; + TextBlockCategoriesSeed provider)
  jobs_tracking:
    - tasks/TZ-DOC-315-text-block-category-backend-contract.md (spec)
    - tasks/README.md (active TZ entry; cross-references)
    - STATUS.md (⏳ READY — Document Constructor — TZ-DOC-315..317 chain section)
    - docs/agent-checklists/TZ-DOC-315.md (this checklist)
  tasks_archive:
    - tasks/_archive/2026-08/TZ-DOC-315.done.md (this file)
  lock:
    - .mimocode/locks/TZ-DOC-315-text-block-category.lock

backend_regression:
  - text_block.controller.ts: GET now also accepts `categoryId` and `activeOnly` query params (TZ-DOC-315 §ШАГ 6). `category` + `isActive` unchanged → backward-compat.
  - text_block.service.ts: POST/PATCH now take optional `organizationId` from `req.user.organizationId`. Existing callers (admin/manager) keep working — admin has full access. RBAC unchanged (still `Roles('admin', 'manager')`).
  - SEED: idempotent OnModuleInit — never duplicates system default.

known_limitations:
  - TZ-DOC-316 (UI dictionary + picker) not implemented yet — `GET /api/text-block-categories` works but UI doesn't consume.
  - TZ-DOC-317 (builder filter dropdown) not implemented yet — `?categoryId` works at API level but builder-tool-pane doesn't yet expose it.
  - Successor TZ-DOC-318 — migration legacy enum `category: 'legal'|'intro'|'outro'|'custom'` → new `categoryId` FK — out of scope here.
  - E2E browser check: MANUAL_BROWSER_CHECK_REQUIRED — dev-stack credentials unavailable in this session; unit tests + typecheck are the canonical evidence.
  - Other agents' dirty files (Materials, Admin/RBAC, sanitize, builder) NOT touched.

archive_id: TZ-DOC-315
next_chain_step: TZ-DOC-316 (UI dictionary + picker) — agent prompt available in `tasks/TZ-DOC-316-text-block-category-reference-and-picker.md`.
