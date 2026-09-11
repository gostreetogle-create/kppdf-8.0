# TZ-NX-REG-CATEGORIES-CRUD checklist

> Status: **DONE**
> Archive: `tasks/_archive/2026-09/TZ-NX-REG-CATEGORIES-CRUD.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-11T13:22:00Z
- workspace: D:\kppdf-8.0

## Preflight

- [x] `tasks/_active/` пусто; TZ-01 DONE (зависимость закрыта)
- [x] `category.schema.ts`/`category.controller.ts`/`category.service.ts`/DTO прочитаны целиком; `remove()` уже блокирует по children/products/materials refs (НЕ по `isSystem` — не добавлял новое правило); нет type-consistency parent/child проверки на BE (client-only convention, как и просит TZ)
- [x] Gold: `text-block-categories.registry.ts`/`text-blocks-http-data-source.ts`/`work-type-registry-actions.ts`+`work-type-registry-dialog-host.ts` (dialogHost split pattern) — использован dialogHost pattern, не doc-studio-стиль (Category не doc-studio)
- [x] `registries.catalog.ts`'s 15-positional-arg `buildRegistriesCatalogDefault` — расширен 2 trailing optional параметрами, тот же приём, что workTypes/workers

## Acceptance

- [x] `/registries` → Справочники → Категории: CRUD type material/product/module
- [x] POST category type=module → 201 (BE enum расширен + DTO validator; unit + DTO-validation тесты)
- [x] Gates BE + nx build PASS

## Integrity slot

- [x] Тип изменения: BE enum extension (не редизайн) + новый NX registry/service/dialog — reuse `/api/categories` целиком, не второй write-path
- [x] FIC: A (`/registries/categories` через существующий `:registryKey` matcher — без правки route файла)
- [x] page.md: `registries.page.md` (2 таблицы + секция «Master-table…» обновлена); `docs/CONTEXT.md` новая строка Category vs materialKind vs TextBlockCategory
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Канон: не спутал `TextBlockCategory` с `Category`; не тронул `materialKind`

## Gates (факт)

- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` → PASS
- `cd backend && pnpm exec jest --silent src/modules/category` → PASS 7/7 (2 suites)
- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → PASS
- `cd frontend-nx && pnpm test` → PASS 114 suites / 778 tests
- `cd frontend-nx && pnpm exec nx lint kppdf-web` → baseline unchanged (271/38)
- `pnpm architecture:check` (repo root) → PASS
- `cd frontend-nx && pnpm exec nx build kppdf-web` (последний) → PASS

## Executor report

- **Design call: `slug` is never its own form field.** The BE DTO requires both `slug` (lowercase a-z0-9-, globally-scoped-per-type-unique) and `skuPrefix` (uppercase A-Z0-9-, globally unique) as separate required strings. Rather than ask the operator to think up two Latin codes for one Cyrillic name, `slug` is always derived as `skuPrefix.toLowerCase()` at submit time — valid by construction (skuPrefix's own character set is a strict subset), and its uniqueness rides on skuPrefix's pre-existing global-unique constraint. Only `skuPrefix` is a visible field, auto-suggested via a small local RU→Latin transliteration table until the operator edits it by hand (`suggestSkuPrefix()`, exported + unit-tested).
- **Real bug caught by writing the dialog's own test, not assumed correct:** `parentOptions` was originally a `computed()` reading `this.form.controls.type.value` — `computed()` only tracks Signal reads, and `FormControl.value` is a plain property, not a Signal, so it silently never recomputed after the type `<select>`'s `(change)` fired. The "type change filters the parent list" test failed with the WRONG (stale) sibling list, not a crash — exactly the kind of bug that reads as "looks fine" in a quick manual click-through. Fixed by making `parentOptions` a plain `signal`, updated explicitly from `onTypeChange()` (and once at construction).
- **Test-writing gotcha (documented inline in the spec for the next agent):** `app-pi-input`'s own template never forwards `id`/`data-test` onto its inner native `<input>` — verified by reading `input.component.ts`. DOM-level `querySelector('[data-test="..."]')` + `dispatchEvent('input')` against it silently targets the *outer* custom-element tag and does nothing; the form control never updates and no test failure explains why (it just looks like validation never passes). Fixed by mirroring `InputComponent.onInput()`'s own two effects directly — set the control, then call the `(valueChange)` handler — same substitute `supply-request-form-dialog.component.spec.ts` already uses (calling `onMaterialQuery(...)` directly instead of simulating a DOM event). Native `<select formControlName>` elements do NOT have this problem — they're plain elements, DOM `change` events work normally.
- **`registry-crud-actions.ts` reused as-is, no new delete-disable hook needed here** (unlike `TextBlockCategory` in the prior wave) — `CategoryService.remove()` already 409s on children/catalog-refs; `isSystem` has no BE delete-guard for `Category` today, and neither the audit nor this TZ asked for one, so none was invented.
- `buildRegistriesCatalogDefault` (`registries.catalog.ts`) gained 2 more optional trailing params (`categoriesService`, `categoryDialogHost`), matching the exact pattern already used for `workTypesService`/`workTypeDialogHost`/`peopleService`/`workerDialogHost` — the function now has 17 positional params, which is a lot, but changing that shape is out of scope for this TZ.
- New files: `category.types.ts` + `pi-categories.service.ts` (data-access, `catalog/` folder — cross-cutting, not doc-studio); `categories-http-data-source.ts` (+spec); `category-registry-dialog-host.ts` (+spec) — fetches the full category list fresh on every open (not cached) so the parent picker never shows stale siblings; `category-registry-actions.ts`; `categories.registry.ts` (+spec); `category-form-dialog.component.ts` (+spec, 7 tests covering auto-suggest, parent filtering, validation, submit payload shape, edit prefill).
- No live browser click-through performed in this session (no windowed environment). Recommend PO does one visual pass creating a root category, a subcategory under it, and switching the type dropdown mid-form before calling this fully closed visually — the `computed()`-vs-`signal` bug above is exactly the class of thing that's easy to miss without actually clicking the type select.

## Closeout

- [x] archive + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-11T14:10:00Z
