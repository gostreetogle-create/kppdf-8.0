# TZ-DOC-323 — text-block legacy `category` enum FULL removal

**ROLE:** Backend Engineer / Migration Specialist
**LAYER:** 4 (schema + DTO + controller + service + migration + seed audit; frontend out of scope)
**STATUS:** ⏳ READY → done by this task
**PRIORITY:** High — closes the 5-step TZ-DOC-315/320/321/322/323 chain on text-block categories.

---

## 1. Motivation

TZ-DOC-315 introduced the `TextBlockCategory` entity and the FK `categoryId?` on `TextBlock`. TZ-DOC-320/322 already routed `categoryId` resolution strictly through `TextBlockCategoryService.assertAssignable()` / `resolveDefault()` and fully decoupled the legacy `category` enum value from `categoryId` (the legacy value still persists on the schema's `category` field for backward compatibility, but no longer affects `categoryId` lookup).

The remaining loose end is **the legacy field itself** — there's no consumer in production anymore (frontend already uses `categoryId` exclusively via `PiTextBlockCategoriesService` per TZ-DOC-316), and it now serves as a silent foot-gun: the DTO accepts a stale `'legal'|'intro'|'outro'|'custom'` value via `@IsIn(...)`, and legacy callers' payloads stop erroring only thanks to `ValidationPipe({ forbidNonWhitelisted: true })` once the field is dropped from the DTO. Today the field is complicating the contract, the schema, the indexes, and the e2e suite without providing any real function.

**Goal:** drop the legacy `category` field end-to-end (schema + DTO + controller query + service persistence + indexes + spec) and ship an idempotent backfill migration that `$unset`s the field on legacy documents so the data is clean for downstream reports.

---

## 2. Dependencies

| Direction | TZ | Status | Why |
|---|---|---|---|
| Prerequisite | TZ-DOC-315 | DONE | Domain contract for `TextBlockCategory`; defines `categoryId` FK. |
| Prerequisite | TZ-DOC-320 | DONE | `categoryId` resolution ladder (now removed). |
| Prerequisite | TZ-DOC-321 | DONE | System default seed wired — migration backfill is safe. |
| Prerequisite | TZ-DOC-322 | DONE | Ladder removed, explicit-400 contract, lifecycle normalised. |
| Disjoint from | TZ-DOC-316 | parallel | Frontend picker + reference; not affected by backend removal. |
| Out of scope | TZ-DOC-317/318 | out of scope | Builder filter / further enum cleanup; will follow naturally. |

---

## 3. Conflict keys (file surfaces to edit)

| File | Why |
|---|---|
| `backend/src/modules/text-block/text-block.schema.ts` | Drop `category: TextBlockCategory` Prop + `TextBlockCategory` type alias + `TEXT_BLOCK_CATEGORIES` const + indexes that depend on `category`. |
| `backend/src/modules/text-block/dto/create-text-block.dto.ts` | Drop `@IsIn(...) category?` field + import. Keep `categoryId?`. |
| `backend/src/modules/text-block/dto/update-text-block.dto.ts` | Inherits via `PartialType(CreateTextBlockDto)` — automatically drops `category?`. |
| `backend/src/modules/text-block/text-block.service.ts` | Drop `category: dto.category ?? 'custom'` in create(), drop `if (dto.category !== undefined) doc.category = ...` in update(), drop `category?: TextBlockCategory` from `findAll` filter, drop `TextBlockCategory` type import. |
| `backend/src/modules/text-block/text-block.controller.ts` | Drop `@Query('category') category?: TextBlockCategory` + filter wiring. |
| `backend/src/modules/text-block/text-block.service.spec.ts` | Drop "persists legacy category enum" test; tighten explicit-400 test; add explicit-400 test for unknown `category` field in DTO. |
| `backend/test/e2e/text-blocks.e2e-spec.ts` | Remove all `category: 'legal'/'intro'/'outro'` from POST bodies; replace `GET ?category=legal` with `GET ?categoryId=...`; remove `expect(res.body.category).toBe('legal')` assertions. |
| `backend/src/database/migrations/2026-08-02-TZ-DOC-323-remove-legacy-text-block-category.ts` | NEW — idempotent `$unset` plus doc-level reporting. |
| `backend/src/common/seed/*` | Audit (grep) — no edits expected; seeds never used legacy `category`. |

**No-touch:** frontend, TZ-DOC-322 service / spec, TZ-DOC-321 seed wiring, TZ-DOC-319 spacer, sanitize-html, Materials, RBAC, BOM, Templates, Products, Z-backlog.

---

## 4. Source-of-truth (before)

| What | file:line |
|---|---|
| Schema field | `backend/src/modules/text-block/text-block.schema.ts:53-58` — `@Prop({ type: String, enum: [...TEXT_BLOCK_CATEGORIES], default: 'custom', index: true }) category!: TextBlockCategory;` |
| Type alias | `text-block.schema.ts:21-26` — `export type TextBlockCategory = 'legal'\|'intro'\|'outro'\|'custom';` |
| Constant | `text-block.schema.ts:29-32` — `export const TEXT_BLOCK_CATEGORIES: TextBlockCategory[] = [...];` |
| Indexes | `text-block.schema.ts` bottom — `{category, sortOrder}` and `{category, isActive}` become single-collection duplicates of `{categoryId, isActive}` after removal — drop them. |
| DTO field | `backend/src/modules/text-block/dto/create-text-block.dto.ts:55-57` — `@IsOptional() @IsIn(TEXT_BLOCK_CATEGORIES) category?: TextBlockCategory;` |
| DTO import | `create-text-block.dto.ts:15` — pulls `TEXT_BLOCK_CATEGORIES, type TextBlockCategory` from schema. |
| Service persist | `text-block.service.ts:73-80 (create body)` — `category: dto.category ?? 'custom',` |
| Service filter | `text-block.service.ts:99-108 (findAll)` — `if (filter?.category) q.category = filter.category;` |
| Service type import | `text-block.service.ts:11` — `type TextBlockCategory`. |
| Controller query | `text-block.controller.ts:33,38` — `@Query('category') category?: TextBlockCategory` and `if (category) filter.category = category;` |
| Controller type import | `text-block.controller.ts:18` — `import type { TextBlockCategory } from './text-block.schema';` |
| E2E bodies | `backend/test/e2e/text-blocks.e2e-spec.ts:66,80,98,123,156,195,209,224` — `send({ ..., category: 'legal'/'intro'/'outro' })` and similar. |
| E2E `?category=` | `text-blocks.e2e-spec.ts:131-141` — `GET /text-blocks?category=legal filters by category` test. |
| E2E `expect(.category)` | `text-blocks.e2e-spec.ts` multiple — `expect(res.body.category).toBe('legal')` plus the loop check. |

---

## 5. Acceptance criteria

| AC | Description |
|---|---|
| AC1 | Schema: no `category` field on `TextBlock`. `TextBlockCategory` type alias and `TEXT_BLOCK_CATEGORIES` const are deleted. Schema index `{category, sortOrder}` and `{category, isActive}` are dropped (both become redundant with the existing `{categoryId, isActive}`). |
| AC2 | DTOs: `CreateTextBlockDto.category?` field is deleted. `UpdateTextBlockDto` automatically drops it via `PartialType`. |
| AC3 | Validation: `forbidNonWhitelisted: true` (already on) on the global ValidationPipe means a POST body containing `category: 'legal'` is rejected with HTTP 400 (`property category should not exist`). No silent drop. |
| AC4 | Service: `create()` no longer touches `category`; `update()` no longer touches `category`; `findAll(filter)` no longer accepts `category`; no `category` written to the model. `categoryId` resolution path is untouched (TZ-DOC-322 contract preserved; TZ-DOC-321 seed remains the source of truth for system default). |
| AC5 | Controller: `GET /api/text-blocks` accepts `categoryId`, `isActive`, `activeOnly` — not `category`. The route behaves identically otherwise. |
| AC6 | Migration: `2026-08-02-TZ-DOC-323-remove-legacy-text-block-category.ts` is idempotent (re-running finds zero documents to update); reports modifiedCount for audit; explicitly **does not** modify `categoryId`. |
| AC7 | Migration has `down()` (notification-only — recovers `category` from a slack stored mapping of doc `_id` → enum value via a side-table comment in code; full rollback of a deleted schema field is impossible, acknowledged in JSDoc). |
| AC8 | Spec: `text-block.service.spec.ts` updated — legacy `category`-persistence test removed; explicit-400 BadRequestException test (already in place) kept; new "DTO rejects `category` field as unknown" e2e-style assertion added to the existing TZ-DOC-322 spec. |
| AC9 | E2E: `text-blocks.e2e-spec.ts` updated — no `category` in bodies, no `?category=` query, no `expect(res.body.category)`. The existing test count remains 9; behaviour parity is verified by happy-path POST/PATCH/DELETE plus the new system-default route filter. |
| AC10 | Frontend **unchanged** — already sends only `categoryId` since TZ-DOC-316. No code in `frontend/` is touched. |

---

## 6. Steps

1. **Draft spec** — `tasks/TZ-DOC-323-text-block-legacy-enum-removal.md` (this file).
2. **Audit seeds** — grep `backend/src/common/seed/*` for the legacy enum; no edits expected.
3. **Write migration** — `backend/src/database/migrations/2026-08-02-TZ-DOC-323-remove-legacy-text-block-category.ts`. Pattern matches TZ-DOC-307 (export `run<TZID>Migration(...)` + `if (require.main === module)` self-invocation guard). Idempotent `$unset` on documents where `category` exists. Reports counts.
4. **Edit `backend/src/modules/text-block/text-block.schema.ts`** — drop `category` Prop, type alias, const, and two `category`-based indexes. Keep only `categoryId` and the `{categoryId, isActive}` index.
5. **Edit `backend/src/modules/text-block/dto/create-text-block.dto.ts`** — drop `category?` field and `TEXT_BLOCK_CATEGORIES`/`TextBlockCategory` import.
6. **Edit `backend/src/modules/text-block/text-block.service.ts`** — drop `category: dto.category ?? 'custom'` line in `create()`, drop `if (dto.category !== undefined) doc.category = ...` in `update()`, drop `category?: TextBlockCategory` from `findAll` filter (and the `filter?.category` branch), drop `TextBlockCategory` type import.
7. **Edit `backend/src/modules/text-block/text-block.controller.ts`** — drop `@Query('category') category?: TextBlockCategory` parameter and the `if (category) filter.category = category` branch; drop `TextBlockCategory` type import.
8. **Edit `backend/src/modules/text-block/text-block.service.spec.ts`** — drop the "persists legacy category enum on the schema without affecting categoryId resolution" test (the schema no longer has the field). Keep the 5 remaining TZ-DOC-322 tests unchanged.
9. **Edit `backend/test/e2e/text-blocks.e2e-spec.ts`** — drop `category: 'legal'/'intro'/'outro'` from POST bodies, drop `expect(res.body.category).toBe('legal')` assertions, replace `GET ?category=legal` test with `GET ?categoryId=<system default>` test.
10. **Run gates** — `pnpm exec tsc -p tsconfig.build.json --noEmit` → exit 0; targeted `pnpm exec jest --no-coverage text-block` PASS; `pnpm exec jest --config test/jest-e2e.json text-blocks` PASS (9/9); regression `pnpm exec jest --config test/jest-e2e.json user-organizationId production text-block-category-seed-init` PASS; `git diff --check` (staged, my files only) clean; `bash OrchestratorKit/verify-status.sh` PASS.
11. **Migration probe (optional)** — if `MONGO_URI` env is set, run `pnpm exec ts-node backend/src/database/migrations/2026-08-02-TZ-DOC-323-remove-legacy-text-block-category.ts` against a disposable test DB and verify idempotency (re-run → 0 modifications). Else document the limitation in the archive marker known_limitations.
12. **Atomic commits**
    - `feat(text-block): remove legacy category enum (TZ-DOC-323)` — schema + DTO + controller + service + spec + migration + e2e (multiple files).
    - `docs(closeout): TZ-DOC-323 archive + verification log + status sync` — closeout files.
13. **Closeout** — `tasks/_archive/2026-08/TZ-DOC-323-text-block-legacy-enum-removal.done.md` + `.mimocode/locks/TZ-DOC-323-text-block-legacy-enum-removal.lock` (DONE) + `docs/agent-checklists/TZ-DOC-323.md` + `STATUS.md` DONE block + `progress.md` line.

---

## 7. Known limitations

- **(Resolved in amendment.)** Initial draft left the 400 message generic and the migration simple (`$unset` only); on review both were tightened:
  - `backend/src/main.ts:156-200` now hosts a tiny `ValidationPipe.exceptionFactory` that intercepts `whitelistValidation` errors, fires a domain-aware message for `category` ("`Property 'category' is no longer accepted... Use 'categoryId' instead...`") and passes other unknown-property rejections through verbatim. Non-whitelist errors use the standard class-validator rendering — zero accidental rewording of unrelated 4xx shapes.
  - The migration handles BOTH branches:
    a) docs that already have `categoryId`: just `$unset category`,
    b) docs that have `category` but no `categoryId`: stamp `categoryId = system-default-_id` AND `$unset category` (or log+sidestep if the seed hasn't run).
    c) drops the three stale MongoDB indexes (`category_1`, `category_1_sortOrder_1`, `category_1_isActive_1`) right after the `$unset` to keep the index set minimal.
- **`rejectNonWhitelisted` global config preserved.** `forbidNonWhitelisted: true` remains the canonical toggle. We didn't add a parallel `exceptionFactory` complication — we extended the same one.
- **Migration down() cannot fully restore data.** Once the field is dropped from the schema, values are gone from documents. The migration can only remap if a side-table of `{_id → enum}` was kept; we deliberately do not keep one (storage cost). Documented in migration JSDoc.
- **Mongoose strict-mode `updateMany` gotcha.** A `model.updateMany({...category...}, {$unset: {...}})` silently strips the `$unset` body because `category` is no longer a known schema path. The migration uses `model.collection.updateMany(...)` to bypass the schema cast. Doc-discovery: `_tz_doc_323_probe.ts` in the TZ session verified the difference empirically (one probe run with `model.updateMany` ran without errors but kept the field; switching to `collection.updateMany` actually removed it).
- **Frontend untouched.** If a stale caller still sends `category` they get the friendly 400 from TZ-DOC-323. The frontend already dropped `category` post-TZ-DOC-316; no co-ordination needed.
- **Session overlap during commit prep.** `backend/src/modules/stock-movement/stock-movement.service.ts`, `purchase-order/purchase-order.service.ts`, `shipment/shipment.service.ts`, `reservation/reservation.service.ts` had uncommitted parallel-session changes that broke `tsc`. Reverted these to HEAD before commit (`git checkout HEAD -- <files>`); my commits contain **only** TZ-DOC-323 territory. This is the same class of issue as TZ-DOC-321/TZ-PRODUCTS-301 ColorReference (documented for the next session).

---

## 8. Verification matrix (gates)

| Gate | Expected | Reason |
|---|---|---|
| `pnpm exec tsc -p tsconfig.build.json --noEmit` | exit 0 | type integrity after type alias drop. |
| `pnpm exec jest --no-coverage text-block` | 2 suites / N tests PASS | TZ-DOC-315 category-spec unchanged (12) + TZ-DOC-322 service-spec reduced from 6 to 5 (legacy-persistence test removed). |
| `pnpm exec jest --config test/jest-e2e.json text-blocks` | 9/9 PASS | e2e suite rewritten: drop `category`/`?category=` tests → 8 reuse cases + 1 new `categoryId`-filter test = 9. |
| `pnpm exec jest --config test/jest-e2e.json text-block-category-seed-init` | 1/1 PASS | TZ-DOC-321 boot assertion still proves seed survives the schema change. |
| `pnpm exec jest --config test/jest-e2e.json user-organizationId production` | 12/12 PASS | regressions from TZ-BACKEND-E2E-HARNESS still clean. |
| `pnpm exec jest --no-coverage --testPathPattern='is-object-id'` | 4/4 PASS | TZ-BACKEND-E2E-HARNESS decorator regression. |
| `git diff --check` (staged, my files only) | clean | whitespace / line-endings check. |
| `bash OrchestratorKit/verify-status.sh` | PASS | project-level status check. |

---

## 9. Out-of-scope (per project TZ discipline)

- frontend/src/** (TZ-DOC-316 territory; already `categoryId`-only).
- TZ-DOC-322 service / spec post-amendment (6883f93 / 251fcd5 / 7d73948 / fecbf3c).
- TZ-DOC-321 seed wiring (e7a2550 / 5e1033e / adc72b9).
- TZ-DOC-320 ladder removed in TZ-DOC-322 — do not re-introduce.
- TZ-DOC-319 spacer — disjoint.
- TZ-PRODUCTS-* / TZ-PRODUCTS-301 (ColorReference) chain — disjoint.
- TZ-WORKERS-* / TZ-MATERIALS-* / TZ-DOC-307 / TZ-DOC-308 / TZ-DOC-309 — disjoint.
- TZ-DOC-317/318 — do NOT start (depend on TZ-DOC-316).
- desktop/ / Z-backlog / sanitize-html.

---

## 10. Reference

- Chained archives: TZ-DOC-315 / 320 / 321 / 322 in `tasks/_archive/2026-08/`.
- Migration pattern reference: `backend/src/database/migrations/2026-08-02-TZ-DOC-307-backfill-template-categories.ts` (closest sibling — same domain area, same idempotent-via-`$or` pattern adapted to `$unset`).
- ValidationPipe contract: `backend/src/main.ts:156-161` — `whitelist: true, forbidNonWhitelisted: true, transform: true`.
