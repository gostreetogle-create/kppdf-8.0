# TZ-NX-REG-CATEGORY-WIRE-PRODUCTS checklist

> Status: **DONE**
> Archive: `tasks/_archive/2026-09/TZ-NX-REG-CATEGORY-WIRE-PRODUCTS.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-11T14:47:00Z
- workspace: D:\kppdf-8.0

## Preflight

- [x] TZ-02 DONE — зависимость закрыта
- [x] `product-form-dialog.component.ts` целиком прочитан; `categoryId` — ObjectId text, no required
- [x] BE `product.service.ts`: `findAll()`/`findById()` уже `.populate('categoryId')` — колонка «Категория» в `products.registry.ts` (`formatMaterialRef`) уже показывает имя; **но** нашёл `patchProduct()` принимал только `typeof categoryId==='string'` — реальный баг, populated-объект при edit отбрасывался в пустую строку
- [x] `Product.subcategory` (BE schema/DTO) — legacy free-text поле, **не отрендерено** ни в одной NX-форме уже сегодня; TZ просит не раздувать — оставлено как есть, не тронуто
- [x] `products.registry.ts` — нет categoryId-фильтра вообще (в отличие от details/materials) — нечего переименовывать

## Acceptance

- [x] Create product without category blocked — `Validators.required`
- [x] Select = product categories from registry — `PiCategoriesService.list({type:'product'})`, только `isActive`
- [x] nx build PASS

## Integrity slot

- [x] Тип изменения: 1 форма (select вместо text input) + 1 реальный bug-fix (`refId()` для edit-patch) — не redesign
- [x] FIC: N/A
- [x] page.md: `registries.page.md` (products row + История)
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Канон: Module schema не тронута; Category CRUD не редизайнена

## Gates (факт)

- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → PASS
- `cd frontend-nx && pnpm test` → PASS 114 suites / 782 tests (+9 в product-form-dialog.component.spec.ts, было 7)
- `cd frontend-nx && pnpm exec nx lint kppdf-web` → baseline unchanged (271/38)
- `cd frontend-nx && pnpm exec nx build kppdf-web` → PASS

## Executor report

- **Real bug found and fixed, not just the ask.** `patchProduct()`'s `categoryId: typeof p.categoryId === 'string' ? p.categoryId : ''` silently discarded a populated `categoryId` ref — and `GET /products` (list) **and** the detail endpoint both already `.populate('categoryId')`, so editing ANY product that already had a category assigned would show the field blank, pre-dating this TZ entirely. Caught while wiring the new select (needed a correct initial value for the dropdown anyway) and fixed with a local `refId()` helper — same tiny pure function `material-form-dialog.component.ts` already has (and `production-read.facade.ts`, independently) — no shared util exists for it across the codebase yet, duplication is the established convention here, not introduced by this TZ. Wrote a dedicated regression test (`extracts the id from a populated categoryId ref...`) that fails against the old code and passes now.
- **Products get NO optional-for-some-kind exception**, unlike details' раw-material carve-out — the TZ's own wording never mentioned one, and `Product` has no equivalent to `materialKind`. `Validators.required` is unconditional.
- **`Product.subcategory` deliberately untouched** — confirmed via grep across BE schema/DTO/service that it's a legacy free-text field, and confirmed it is not rendered in the NX form today. Nothing to "not raise" since nothing referenced it; noted explicitly per the TZ's own caution against turning it into a second category concept.
- **No categoryId filter existed on the `products` registry at all** (unlike `details`/`materials`) — nothing to rename/fix there; the TZ's filter item didn't apply here.
- Test fallout: all 3 `TestBed.configureTestingModule` blocks in `product-form-dialog.component.spec.ts` needed the new `PiCategoriesService` provider; the shared `SAMPLE` fixture (spread into the photo describe's `EDIT_SAMPLE`) needed a `categoryId` added or its `onSubmit()`-calling tests would have silently stopped calling `update()` once the field became required — caught by running the suite, not assumed.
- No live browser click-through performed in this session (no windowed environment). Recommend PO does one visual pass: create a product without a category (should block) and edit an existing product that already has one (category should now show pre-selected, not blank) before calling this fully closed visually.

## Closeout

- [x] archive + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-11T15:10:00Z
