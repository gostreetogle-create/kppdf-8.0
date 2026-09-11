# TZ-NX-TEXT-CAT-PARENT checklist

> Status: **DONE**
> Archive: `tasks/_archive/2026-09/TZ-NX-TEXT-CAT-PARENT.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-11T07:52:37Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — пусто, нет чужого CLAIM
- [x] Audit + WAVE + TZ прочитаны; `text-block-category.schema/service/controller.ts`, `text-block.schema/service/controller.ts`, оба DTO, оба `.service.spec.ts` прочитаны полностью
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-TEXT-CAT-PARENT.md` на месте

## Acceptance

- [x] POST category with parentId of subcategory → 400 (`assertValidParent` rejects when `parent.parentId` truthy) — unit test added
- [x] POST text-block with root categoryId → 400 RU (`assertAssignable` rejects `!doc.parentId`) — unit test added
- [x] POST text-block with leaf categoryId → 201 — covered by existing + new unit tests
- [x] Gates backend tsc/test/lint PASS

## Integrity slot (до READY / archive)

- [x] Тип изменения: module (BE schema/service/controller/DTO)
- [x] FIC: C (API shape change — documented in `text-block-categories.page.md`)
- [x] page.md обновлён: `text-block-categories.page.md` (API table + новая секция «Дерево»)
- [x] DOMAIN-MAP: N/A — не новый module/route, расширение существующего
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Coupling map: N/A — `parentId`/`categoryId` не «активный»-статус на нескольких экранах
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` (baseline, до кода) → **PASS**
- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` (после кода) → **PASS**
- `cd backend && pnpm test -- text-block` → **PASS** 31/31 (2 suites: `text-block.service.spec.ts` 12, `text-block-category.service.spec.ts` 19 — up from 9/14 respectively, new coverage for parentId/leaf/rootsOnly/children-guard + rewritten create/update tests matching the new mandatory-subcategory contract)
- `cd backend && pnpm test` (full) → **PASS** 130 suites / 1277 passed, no regressions
- `cd backend && pnpm lint` → **PASS** 0 errors / 198 pre-existing warnings (unchanged baseline)
- `pnpm architecture:check` → **PASS** (1473 files; baseline 17; resolved since baseline: 2)

## Executor report

- `text-block-category.schema.ts`: added `parentId?: Types.ObjectId` (indexed via `@Prop`, no duplicate explicit index — caught and fixed a Mongoose "duplicate schema index" warning from an initial redundant `schema.index({parentId:1})`).
- `create-text-block-category.dto.ts`: added optional `parentId` (`@IsMongoId`); `UpdateTextBlockCategoryDto` inherits it via `PartialType`.
- `text-block-category.service.ts`:
  - `create()`/`update()`: validate `parentId` via new private `assertValidParent` (must exist, must itself be a root — depth≤1, must be in caller's org scope or system) and new private `assertDefaultNotOnSubcategory` (isDefault is root-only, checked against the **effective** post-update state on `update()`, not just the dto's own fields).
  - `findAll()`: rewritten to compose independent filter clauses (isActive/search+scope/parentId/rootsOnly) via `$and` instead of the old single-slot `$and`/`$or`, so the new `parentId`/`rootsOnly` query options compose cleanly with everything else.
  - `remove()`: now also refuses (409) when the category has child subcategories, not just when TextBlocks reference it.
  - `assertAssignable()`: now rejects root categories (`!doc.parentId`) with a RU 400 — this is the single enforcement point for "TextBlock.categoryId must be a leaf," reused by both `TextBlockService.create()` and `.update()`.
- `text-block-category.controller.ts`: `GET` now accepts `parentId`/`rootsOnly` query params, wired to the service.
- `text-block.service.ts`: `create()` no longer silently falls back to `resolveDefault()` when `categoryId` is omitted — throws a RU 400 instead (PO: subcategory mandatory). `update()` gained `categoryId` handling (previously silently ignored!) — an explicit `categoryId` is validated via `assertAssignable`; omitting it leaves the existing category untouched (partial-update semantics, and matches "existing root-pointing blocks stay readable, no mass migration").
- `text-block.controller.ts`: `PATCH` now passes the caller's `organizationId` through to `service.update()` (previously not passed at all — the signature had no such parameter).
- Test rewrites (both `.service.spec.ts` files) to match the new contract — full accounting in the executor report of the commit message; notably fixed a **pre-existing gap** in `text-block-category.service.spec.ts`'s `FakeModel.find()` mock, which silently ignored its query argument and returned every stored doc regardless of filter — never caught before because no prior test exercised `findAll()` with a real filter.

## Closeout (после PASS)

- [x] archive + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-11T08:10:00Z
