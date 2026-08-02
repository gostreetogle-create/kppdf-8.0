# Agent checklist — TZ-DOC-315 — TextBlockCategory backend contract

**Closed at:** 2026-08-02 (Buffy canonical session)
**Status:** DONE
**Acceptance pass:** see tasks/_archive/2026-08/TZ-DOC-315.done.md

## Evidence

| Step | Evidence |
|------|----------|
| New schema/module | `backend/src/modules/text-block-category/{schema,service,controller,module}.ts` — sparse-unique `{organizationId, slug}` + system «Общее» pattern mirrors TZ-DOC-307 |
| Wire-in into TextBlock | `text-block.schema.ts` lines 80-95 (`categoryId?: Types.ObjectId` Prop, sparse index) |
| Server-side default | `text-block.service.ts` `create()` lines 36-66 — `resolveDefault` if no `dto.categoryId`; `assertAssignable` if provided |
| IDOR guard | `update()` foreign-org → 403; `remove()` foreign-org → 403 (service spec lines 235-285) |
| 409 on in_use | `remove()` calls `blockModel.countDocuments({ categoryId })` (text-block-category.service.ts) |
| 409 on system | `isSystem: true` checks on `update()` + `remove()` |
| Seed | `backend/src/common/seed/text-block-categories.seed.ts` — idempotent OnModuleInit |
| App module wiring | `app.module.ts` imports list (TextBlockCategoryModule after TextBlockModule) + provider list (TextBlockCategoriesSeed after DocumentTemplateCategoriesSeed) |

## Tests

`pnpm exec jest src/modules/text-block-category --no-coverage` → 12/12 PASS. Coverage:
- `resolveDefault`: org-scoped default → system fallback → null;
- `assertAssignable`: invalid id / missing / inactive / cross-org / system-accepted;
- `create` uniqueness: dup slug → 409;
- `remove` protection: isSystem → 409; in_use count > 0 → 409; foreign-org caller → 403.

## Backend typecheck

`pnpm exec tsc -p tsconfig.build.json --noEmit` → exit 0 (no diagnostics).

## Failed / skipped checks

- E2E browser live flow on dev-stack — `MANUAL_BROWSER_CHECK_REQUIRED` (dev-stack credentials unavailable in canonical session).
- Backend full jest regression against Mongo Replica Set — deferred to whichever next agent has a live Mongo instance; the existing tests touched by TZ-DOC-315 changes (text-block + text-block-category) all pass without a live DB.
