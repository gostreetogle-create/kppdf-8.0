# TZ-NX-REG-CATEGORY-WIRE-DETAILS checklist

> Status: **DONE**
> Archive: `tasks/_archive/2026-09/TZ-NX-REG-CATEGORY-WIRE-DETAILS.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-11T14:12:00Z
- workspace: D:\kppdf-8.0

## Preflight

- [x] TZ-02 DONE (`70a3e777`) — зависимость закрыта
- [x] `material-form-dialog.component.ts` целиком прочитан: `isDetailForm()` уже существующий computed (`lockMaterialKind==='part' || entityLabel==='деталь'`), уже используется для BOM-панели — реюз того же условия для category-required, не новый флаг
- [x] `material.service.ts` `loadAssignableMaterialCategory()` уже валидирует `category.type==='material'` + `isActive` на BE create/update — обнаружено при чтении, не нужно дублировать на клиенте
- [x] `material.service.ts` `findAll()` уже делает `.populate('categoryId')` — колонка «Категория» в `details.registry.ts`/`materials.registry.ts` (`formatMaterialRef`) уже показывает имя, не raw ObjectId, до этой TZ
- [x] Проверил все существующие `RegistryFilter` во всех `*.registry.ts` — ни один select использует async-загруженные options; live-select фильтр для categoryId потребовал бы новой платформенной возможности, за рамками этой TZ (задокументировано, не сделано)

## Acceptance

- [x] Создать деталь без категории → UI block (не POST) — `Validators.required` + `form.invalid` guard в `onSubmit()`
- [x] Создать сырьё без категории → OK; с категорией → сохраняет categoryId — тест на оба случая
- [x] Select = type=material из реестра Категории — `PiCategoriesService.list({type:'material'})`, только `isActive`
- [x] Имя категории в таблице деталей — уже было (BE populate), подтверждено, не regressed
- [x] nx build PASS

## Integrity slot

- [x] Тип изменения: 1 форма (select вместо text input) + 2 filter label/placeholder wording fixes — не redesign, не BE schema
- [x] FIC: N/A — dialog, не route
- [x] page.md: `registries.page.md` (категория в materials/details dialog note + История)
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Канон: `materialKind` не тронут; не спутал с Category

## Gates (факт)

- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → PASS
- `cd frontend-nx && pnpm test` → PASS 114 suites / 780 tests (+13 в material-form-dialog.component.spec.ts, было 11)
- `cd frontend-nx && pnpm exec nx lint kppdf-web` → baseline unchanged (271/38)
- `cd frontend-nx && pnpm exec nx build kppdf-web` (последний) → PASS

## Executor report

- **Reused `isDetailForm()` as-is for `categoryRequired`** — it's the exact same "деталь vs сырьё" distinction the dialog already made for BOM-panel visibility (`lockMaterialKind==='part' || entityLabel==='деталь'`); metизы/purchased/other created via the same «Детали» registry (`allowKindSelect: true`, no `lockMaterialKind`) also get `entityLabel: 'деталь'` fixed at dialog-open time, so they inherit the same requirement uniformly — matches the TZ's own wording ("для режима детали... Validators.required"), not just the `part` kind specifically.
- **Deliberately did NOT touch the `categoryId` registry filter's mechanics** (item 5, "живые категории"). Checked every existing `RegistryFilter` across all `*.registry.ts` files — every `type: 'select'` filter's `options` is a static array resolved at registry-build time; `createRegistriesCatalog()` itself builds the whole catalog synchronously. A true live/async-populated filter dropdown would need a new platform capability (async-resolved filter options) that doesn't exist for any registry today — building it for just this one filter is disproportionate scope for this TZ, and the ask was one line among 5 concrete, form-focused items. Fixed the filter's placeholder wording instead (`"ID из реестра «Категории»"` instead of the bare, confusing `"MongoDB ObjectId категории"`) — a true, honest improvement (there's now somewhere real to look up that ID) without overclaiming a dropdown that isn't there.
- **Column already showed the resolved name, verified by reading the BE, not assumed.** `MaterialService.findAll()` already does `.populate('categoryId')`, and `formatMaterialRef()` (used by both `details.registry.ts` and `materials.registry.ts`'s "Категория" column) already extracts `.name` from a populated ref, falling back to the raw id only when unpopulated. AC #4 was already satisfied before this TZ touched anything — confirmed rather than re-implemented.
- **Test fallout across 6 separate `TestBed.configureTestingModule` blocks** in `material-form-dialog.component.spec.ts` (no shared setup helper existed) — each needed a new `PiCategoriesService` provider (component now injects it unconditionally). One block (`TZ-NX-PHOTO-P1`, `entityLabel: 'деталь'`) calls `onSubmit()` on a fixture whose original material fixture had no `categoryId` — with the new required validator this would have silently blocked submission (no error, `create`/`update` just never called) rather than crash, exactly the kind of regression that's easy to miss without running the suite. Fixed by adding `categoryId: 'cat-1'` to that fixture's data. Added a dedicated new describe block with 2 tests covering the actual required/optional behavior end to end (option list content, blocked-then-unblocked submit for деталь; visible-but-optional for сырьё).
- No live browser click-through performed in this session (no windowed environment). Recommend PO does one visual pass creating a деталь without picking a category (should block) and a метиз/сырьё without one (should save) before calling this fully closed visually.

## Closeout

- [x] archive + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-11T14:45:00Z
