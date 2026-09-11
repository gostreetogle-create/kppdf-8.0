# TZ-NX-REG-CATEGORY-WIRE-MODULES checklist

> Status: **DONE**
> Archive: `tasks/_archive/2026-09/TZ-NX-REG-CATEGORY-WIRE-MODULES.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-11T15:15:00Z
- workspace: D:\kppdf-8.0

## Preflight

- [x] TZ-02 DONE — зависимость закрыта
- [x] `ProductModule` schema/DTO/service целиком прочитаны — в отличие от Material/Product, у Module **нет** существующего поля `categoryId`; это добавление, не замена text-input
- [x] BE `product-module.service.ts`: `findAll()`/`findById()` **не** делали `.populate('categoryId')` (поля не было) — добавлено вместе с самим полем
- [x] `Material`'s `loadAssignableMaterialCategory` — использован как образец для нового `assertModuleCategory()` (существование + `type=module` + `isActive`)
- [x] `article`'s `@IsMongoId({message:...})` без `@IsOptional()` — использован как idiom для `categoryId!: string` (required + custom RU-сообщение одним декоратором)
- [x] `grep -rln "new ProductModuleService"` по всему backend — нашёл доп. call site в `catalog-314.archive.spec.ts` (не основной spec), задетый сдвигом позиционных параметров конструктора

## Acceptance

- [x] `POST /modules` без `categoryId` → 400 RU «Категория модуля обязательна» (`@IsMongoId` без `@IsOptional()`, тот же idiom что `article`)
- [x] Форма модуля не сохраняет без категории — `Validators.required`, unconditional (как products, без raw-исключения materials)
- [x] Categories `type=module` из реестра «Категории» приходят в select — `PiCategoriesService.list({type:'module'})`, только `isActive`
- [x] Gates BE + nx build PASS

## Integrity slot

- [x] Тип изменения: BE — новое optional-схема поле + required DTO validator + populate; NX — новый select field в существующем диалоге + новая колонка реестра. Не redesign композиции/фото (explicitly excluded)
- [x] FIC: N/A
- [x] page.md: `registries.page.md` (modules row + История)
- [x] Чужой WIP не в коммите; conflict keys соблюдены (product-module/**, module*-types, module-form-dialog, modules.registry, registries.page.md, WAVE checklist, _NOW)
- [x] Канон: `Category`/`materialKind`/`TextBlockCategory` не смешаны; composition tree не тронут; photos не тронуты

## Gates (факт)

- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` → PASS
- `cd backend && pnpm exec jest --silent src/modules/product-module` → PASS 24/24
- `cd backend && pnpm exec jest --silent` (full suite) → PASS 132/132 test suites
- `cd backend && pnpm lint` → 202 warnings / 0 errors (baseline 198/0 via `git stash`; +4 delta = `@typescript-eslint/no-explicit-any` on new spec lines, consistent with file's existing `as any` convention)
- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → PASS
- `cd frontend-nx && pnpm exec jest module-form-dialog.component.spec.ts` → PASS 12/12
- `cd frontend-nx && pnpm test` (full) → PASS 114 kppdf-web suites / 784 tests + features 12/12
- `cd frontend-nx && pnpm exec nx lint kppdf-web` → 271/38, matches baseline exactly
- `cd frontend-nx && pnpm exec nx build kppdf-web` → PASS (2 pre-existing warnings only)
- `pnpm architecture:check` (repo root) → PASS

## Executor report

- **Only entity in this wave with no pre-existing `categoryId` field.** Unlike Material/Product (text input → select swap), this TZ added the field end-to-end: schema (`categoryId?: Types.ObjectId`, ref `Category`, indexed), DTO (`@IsMongoId({message:'Категория модуля обязательна'})`, required — no `@IsOptional()`, mirroring `article`'s own idiom), service (`assertModuleCategory()` mirrors Material's `loadAssignableMaterialCategory` — checks existence + `type==='module'` + `isActive`), module registration (`Category`/`CategorySchema` added to `MongooseModule.forFeature`).
- **`categoryId` is unconditionally required** — same as products, no raw-material-style optional carve-out; the TZ text never named an exception and "module without a category" has no domain meaning the way raw material does.
- **Populate added where it never existed for modules** — `findAll()` (both branches) and `findById()` now `.populate('categoryId')`; the new `modules.registry.ts` "Категория" column (`formatMaterialRef`, same formatter already used by details/products) resolves the name, not a raw ObjectId, from day one.
- **Real fallout bug found and fixed, not just the ask.** Adding a 4th constructor param (`categoryModel`) shifted every positional arg after it. `grep -rln "new ProductModuleService"` across the whole backend surfaced 2 direct-construction call sites in `catalog-314.archive.spec.ts` — an unrelated file testing `remove()`/archive behavior — that would have silently received wrong/undefined values for `compositionLines`/`catalogGraph`/`costCalculation`. Harmless for those specific tests (they don't touch those services) but semantically wrong; fixed by inserting the missing 4th positional arg at both sites.
- **No `categoryId` filter exists on the `modules` registry at all** (only `search`) — the live-select-vs-text platform question from TZ-03/04 doesn't apply here; nothing to decide or defer.
- Test fallout: all 5 `TestBed.configureTestingModule` blocks in `module-form-dialog.component.spec.ts` needed the new `PiCategoriesService` provider (one successful `replace_all`); `SAMPLE.categoryId = 'cat-1'` added to the shared fixture; 2 create-mode tests needed an explicit `categoryId.setValue('cat-1')` since create starts from an empty required control.
- **WAVE-NX-REGISTRY-CATEGORIES is now COMPLETE** — `Category` (`type: material|product|module|general`) is wired as the single categorization entity across all three catalog entities (materials/details, products, modules): required for деталь/изделие/модуль, optional for raw material; `materialKind` untouched throughout; `TextBlockCategory` untouched throughout.
- No live browser click-through performed in this session (no windowed environment). Recommend PO does one visual pass: create a module without a category (should block), pick a `type=module` category, save, then reopen the module (category should show pre-selected, not blank) and confirm the registry's "Категория" column shows the name.

## Closeout

- [x] archive + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-11T15:45:00Z
