# TZ-NX-DOCSTUDIO-TABLE-LINE-QTY checklist

> Status: **DONE**
> Archive: `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-TABLE-LINE-QTY.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-11T19:40:00Z
- workspace: D:\kppdf-8.0

## Preflight

- [x] `studio-data-resolver.ts`'s catalog branch (`fetchLiveRows`) hardcodes `quantity: 1, total: price` for every catalog-sourced row — confirmed the exact line the audit named.
- [x] Rows editor in `studio-table-properties.component.ts` is gated `@if (rowSource()==='manual')` — for any live source (catalog/quotation/order) it shows ONLY a read-only hint, no per-cell editing at all; this is the real UI gap, not a data-layer bug.
- [x] Traced the FE↔BE data flow for live rows: `block.settings.liveRows` (client cache, written by `applyLiveRowsFromDataSet` after every `putDataSet` response) is the MERGED/resolved view returned by the backend — **not** a sparse override the client could safely re-send. `doc.dataSets[key].rows` as read back into the FE `document` signal is ALSO the merged view after any hydrate call, not the raw stored override. Concluded: the existing `mergeRowOverrides`/dataSets.rows sparse-override trick (used by manual tables) is **not safely reusable from the client** for this feature — the client has no cached copy of "what's actually an override vs what's live".
- [x] Decided design instead: qty override lives on the **block** (`settings.tableQtyOverrides`, keyed by row index) — same storage tier as column structure (`tableTemplateColumns`), not the document's `dataSets`. Mirrors the TZ's own item 3: "Не требовать qty как поле Product в Mongo — это свойство строки таблицы" — а свойство строки живёт на блоке этой таблицы, а не в БД каталога и не в document.dataSets (что тоже не Product, но отдельный ledger).
- [x] Confirmed `patchTableSettingsForBlock`'s existing `if ('tableTemplateColumns' in patch) rehydrateLiveRowsAfterColumnChange(...)` (TZ-NX-DOCSTUDIO-S47) is the exact "force a fresh live fetch" mechanism already needed after a qty-override patch — extended its trigger condition instead of writing a second copy.

## Acceptance

- [x] Добавил изделие → qty=1 видно; меняю на 3 → после save/reload 3 (BE resolver applies `tableQtyOverrides[index]`, defaulting to 1 when absent).
- [x] Итог/цена*qty пересчитывается согласованно — `total = price * quantity` fixed at the source (was `total: price`, a formula that only looked correct by coincidence at qty=1).
- [x] Gates PASS.

## Integrity slot

- [x] Тип изменения: BE — 1 новое optional block-setting field + `fetchLiveRows` qty/total recompute (catalog source only, quotation/order untouched — see rationale below); FE — новая ветка UI (editable qty cell only, для live источников) + 1 новый orchestration handler переиспользующий существующий rehydrate-механизм. Не redesign строк/dataSets/putDataSet contract.
- [x] FIC: N/A
- [x] page.md: `document-studio.page.md` §3.6
- [x] Чужой WIP не в коммите; conflict keys соблюдены (`studio-table-properties.component.ts`, `studio-data-resolver.ts` — плюс намеренное расширение на `studio-editor.page.ts`/`studio-properties-panel.component.ts` для orchestration/pass-through, того же типа расширение, что уже было в TZ-01 этой волны, задокументировано там же как безопасное для сольной сессии)
- [x] Канон: qty override НЕ на Product/Material/Module; quotation-items/order-items источники НЕ тронуты (у них уже настоящие исторические quantity, оверрайд по индексу там семантически шаткий и не был запрошен)

## Gates (факт)

- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` → PASS
- `cd backend && pnpm exec jest --silent studio-data-resolver` → PASS 20/20 (+3 новых: default qty=1/total=price with sum column, override applied + total recomputed, invalid/negative override ignored)
- `cd backend && pnpm exec jest --silent` (full) → PASS 132/132 test suites, 1304 tests
- `cd backend && pnpm lint` → 202 warnings / 0 errors (unchanged baseline; 0 findings in `studio-data-resolver.ts`/.spec.ts)
- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → PASS
- `cd frontend-nx && pnpm exec jest studio-table-properties studio-table-defaults studio-editor-column-rehydrate studio-editor-live-rows studio-editor-catalog-queue studio-editor-live-qty --silent` → PASS 5 files/34 → затем 6 files/37 после добавления нового файла (см. полный прогон ниже)
- `cd frontend-nx && pnpm test` (full) → PASS 115 suites (+1 новый файл) / 802 passed + 7 pre-existing skipped (809 total)
- `cd frontend-nx && pnpm exec nx lint kppdf-web` → 282/38 (baseline перед этой TZ: 278/38) — **0 новых errors**; +4 warnings, все `@typescript-eslint/no-non-null-assertion` в новых строках (spec-конвенция + 1 в `studio-table-defaults.ts` на нестроковом non-null assert объекта константы, тот же стиль что уже в файле), подтверждено `git stash`/`git stash pop`
- `cd frontend-nx && pnpm exec nx build kppdf-web` → PASS (те же 2 pre-existing warnings, один — та же строка ngModel-паттерна, что и раньше, просто сдвинулась)
- `pnpm architecture:check` (repo root) → PASS

## Executor report

- **Real architectural finding, not just the ask**: traced why the obvious "reuse `mergeRowOverrides`/`dataSets.rows` sparse override, same as manual tables" approach (my first plan) **doesn't actually work from the client** — the FE never retains a sparse override matrix; `block.settings.liveRows` and the `document.dataSets[key].rows` the FE reads back are BOTH the fully-merged/resolved view, so re-sending them as a "manual override" would freeze every cell (name/price/photo included) forever, not just qty. Pivoted to a **block-level qty-override map** (`tableQtyOverrides`, keyed by row index) instead — same storage tier as column structure, and the backend resolver applies it fresh on every live fetch, so name/price/photo stay always-live while only qty (and the recomputed total) sticks.
- **Found and fixed a pre-existing formula bug as a natural side-effect**: `fetchLiveRows`'s catalog branch always set `total: price` (not `price * quantity`) — silently "correct-looking" only because `quantity` was hardcoded to `1`. Now `total = price * quantity`, which is what AC#2 asked for ("обновить согласованно").
- **Zero new BE persistence/endpoint surface** — `tableQtyOverrides` rides the exact same block-PATCH path (`PATCH /blocks/:id`) column structure already uses; no new route, no `dataSets`/`putDataSet` schema change beyond reusing the existing force-refetch call.
- **Scoped to catalog-* sources only** — quotation-items/order-items rows already carry real historical `quantity` from the quotation/order document itself; an index-keyed override on TOP of that would be semantically shaky (their line order isn't guaranteed as index-stable the way a fixed catalog selection is) and the TZ's own wording named "Catalog pick" specifically. Not extended there.
- Test fallout/pitfall documented inline: a standalone `[ngModel]` on a freshly-inserted `@for` row defers its initial `writeValue()` to a microtask (avoids `ExpressionChangedAfterItHasBeenCheckedError`) — a test asserting the bound `.value` right after one synchronous `detectChanges()` sees `''`, not the real value; fixed by `await fixture.whenStable()` before the second `detectChanges()`. Also: `type="number"` + `NumberValueAccessor` emits a `number` (or `null`), not a `string`, through `(ngModelChange)` — the handler now normalizes via `String(value)` before emitting `liveQtyChange`.
- No live browser click-through this session (no windowed environment). Recommend PO: insert a «Продукты» catalog table, pick 1-2 items (qty defaults to 1), edit qty to e.g. 3, confirm the row updates and (if a Сумма/Итого column exists) the total recomputes, then reload the document and confirm 3 survives.

## Closeout

- [x] archive + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-11T20:20:00Z
