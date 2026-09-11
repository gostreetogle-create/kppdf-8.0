# TZ-NX-WH-PUT-MATERIAL-TYPEAHEAD checklist

> Status: **DONE**
> Archive: `tasks/_archive/2026-09/TZ-NX-WH-PUT-MATERIAL-TYPEAHEAD.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-11T11:52:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — пусто, нет чужого CLAIM
- [x] TZ прочитан; текущий `storage-put-on-stock-dialog.component.ts` (native `<select>`, full 100-item preload, no search/create); gold `supply-request-form-dialog.component.ts` (material typeahead: debounce 300ms/min 2 chars, chip-vs-search-box `@if`, `openCreateMaterial`/`pickMaterial`/`clearMaterial`, `onDialogCloseOnce`); gold `registry-create-button.component.ts` (accent Plus icon-btn, `registry-icon-btn-accent` token-based CSS); `MaterialFormDialogComponent`/`MaterialFormDialogData` shape; `PiMaterialsService.list({ search })` already supports server-side search
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-WH-PUT-MATERIAL-TYPEAHEAD.md` на месте

## Acceptance

- [x] Нет полного `<select>` материалов без поиска — удалён вместе с `materialOptions`/`loadMaterials`/`materialsLoading`
- [x] Ввод текста (≥2 символа, debounce 300мс) фильтрует список по имени/артикулу через `PiMaterialsService.list({ search, limit: 10 })`
- [x] «+» — `pi-registry-create-button` (accent Plus, тот же компонент, что и в реестрах) рядом с полем поиска (`flex items-end gap-2`); открывает `MaterialFormDialogComponent` `{ mode: 'create', allowKindSelect: true }`; после Save материал автоматически выбран (chip)
- [x] Поставить на склад с найденным/новым материалом работает как раньше — тот же `POST /api/materials/:materialId/storage-items` (`PiStorageItemsService.createForMaterial`), payload не изменился
- [x] `nx build kppdf-web` PASS последним

## Integrity slot (до READY / archive)

- [x] Тип изменения: один dialog-компонент (поле материала переписано с select на search+chip+create) + минимальное backward-compatible расширение shared icon-button (`dataTest` input, default сохраняет старое поведение) — не redesign остальной формы
- [x] FIC: N/A — dialog, не NX page/route; переиспользует уже FIC-approved `pi-registry-create-button` и `MaterialFormDialogComponent`
- [x] page.md обновлён: `storage-items.page.md` §«Поставить на склад» — новая заметка про typeahead+create
- [x] Чужой WIP не в коммите; conflict keys соблюдены — `storage-put-on-stock-dialog.component.ts`, `storage-dialogs.spec.ts` (единственный existing spec-файл для этого диалога — extend, не новый файл), `registry-create-button.component.ts` (минимальное расширение для реюза, не в исходных conflict keys, но необходимо для «reuse gold component» инструкции TZ), `storage-items.page.md`, `_NOW.md`
- [x] Канон: docs/DOCS-INTEGRITY.md — «не invent зелёный вне токенов»: `registry-icon-btn-accent` — единственный accent CSS, переиспользован как есть, ни одного нового цвета не добавлено

## Gates (факт)

- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → **PASS** exit 0
- `cd frontend-nx && pnpm test` (nx run-many -t test --all, 5 projects) → **PASS** 109 suites / 752 tests (7 skipped, было 747 — +5 новых), 0 failed
- `cd frontend-nx && pnpm exec nx lint kppdf-web` → баseline не изменился (271 problems / 38 errors, ни один новый/задетый файл не в списке)
- `cd frontend-nx && pnpm exec nx build kppdf-web` (production) → **PASS**, только 2 те же pre-existing warnings (studio-table-properties nullish-coalescing, gantt-bars CSS budget)

## Executor report

- **Reused the actual shared component, not a re-implementation.** The TZ named `registry-create-button.component.ts` as gold for the «+» styling; rather than copy its `pi-icon-btn registry-icon-btn-accent` CSS + Lucide `Plus` markup inline (risking exactly the "invent green outside tokens" the constraints warned against), imported `RegistryCreateButtonComponent` (`pi-registry-create-button`) directly. It only accepted a hardcoded `data-test="registry-create"` internally; added an optional `dataTest` input defaulting to `'registry-create'` (zero behavior change for its one other consumer, `registry-detail-panel.component.ts` — verified its own spec still asserts `[data-test="registry-create"]` and passes unchanged) so this dialog could use its own `put-material-create` naming without a second component.
- **Material field rewritten to the `supply-request-form-dialog.component.ts` chip/search pattern**, same constants (`MIN_MATERIAL_QUERY = 2`, `MATERIAL_SEARCH_DEBOUNCE_MS = 300`), same `@if (materialId(); as id) { chip+Очистить } @else { search input + «+» + results list }` shape. Removed the old `loadMaterials()`/`materialOptions` computed/`materialsLoading` entirely — the dialog no longer preloads 100 materials on open; it only fetches on search, and resolves the deep-link prefill straight from `data.materialId`/`data.materialName` (chip shows immediately, no network round-trip needed for the already-known case).
- `pickMaterial` intentionally does **not** touch `quantity`/`minimum`/`zoneName` — those fields are independent of which material is chosen, unlike supply-request's own `pickMaterial` which also patches its form's `title`/`article`/`unit` (that dialog has no separate catalog record to look those up from; this one does, and doesn't need to duplicate catalog fields onto the put-on-stock payload).
- Test debugging note for future specs using both `jest.useFakeTimers()` and this file's `setup()` helper: `setup()` itself calls `await fixture.whenStable()`, which **hangs indefinitely** if fake timers are already active when `setup()` runs (Angular's zone-stability polling depends on real timers). Fixed by calling `jest.useFakeTimers()` **after** `await setup()` resolves, and using `await Promise.resolve()` (real microtask, unaffected by faked macrotask timers) instead of `whenStable()` to flush the debounced search's `.then()` once `advanceTimersByTime` has fired the `setTimeout` — caught by the tests actually timing out at 5s (twice) rather than assumed to work by copying the gold spec's fake-timer test verbatim (that gold test never needed the promise to resolve, only that the call happened; mine needed the resulting list rendered, which is where the same test shape at rest doesn't transfer 1:1).
- Extended `storage-dialogs.spec.ts` (the one existing spec file covering this dialog, alongside `StorageAdjustDialogComponent` in the same file) with 6 tests: no plain select / aria-label; debounce timing+query; pick-and-submit end-to-end; clear-and-re-search; deep-link prefill chip; create-and-auto-select. Net dialog test count went from 1 to 6 on top of the file's untouched adjust-dialog test.
- No live browser click-through performed in this session (no windowed environment); relied on the gate battery (tsc/jest/lint-baseline/build) plus reading the gold components directly rather than guessing their contract. Recommend PO does one visual pass on `/storage-items` → «Поставить на склад» to confirm the search+chip+accent-plus reads right before considering this fully closed visually.

## Closeout (после PASS)

- [x] archive + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-11T12:20:00Z
