# TZ-NX-DOCSTUDIO-TABLE-COL-STRUCTURE checklist

> Status: **DONE**
> Archive: `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-TABLE-COL-STRUCTURE.done.md`
> Commit/push: `24e2ae14` (pushed to origin/main)

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-11T19:10:00Z
- workspace: D:\kppdf-8.0

## Preflight

- [x] `studio-table-properties.component.ts` целиком прочитан (787 строк) — `columnsEditable()` требовал ОБА: `rowSource()==='manual'` И `!templateId` для показа редактируемой сетки колонок; при выбранном виде («Продукты» и т.п.) — ВСЕГДА locked-summary, независимо от источника строк.
- [x] `studio-table-defaults.ts`: `studioTableColumns(block)` читает `block.settings.tableTemplateColumns` — уже per-блок snapshot (копия из шаблона на момент выбора через `buildTableSettingsFromTemplate`), не live-ссылка на документ реестра. Порядок/структура уже физически «на блоке» — инфраструктура для «override, не PATCH шаблона» уже существовала полностью, требовалось только снять gate.
- [x] `studio-editor.page.ts` `patchTableSettingsForBlock`: `if ('tableTemplateColumns' in patch) this.rehydrateLiveRowsAfterColumnChange(...)` — уже переставляет/дозапрашивает `liveRows` при смене структуры колонок для catalog/quotation/order-источников (TZ-NX-DOCSTUDIO-S47). Snapping reorder/add-column на `emitColumnStructure()` автоматически попадает в этот путь — **никакой новой wiring в studio-editor.page.ts не потребовалось**.
- [x] `studio-editor-column-rehydrate.spec.ts` прочитан — существующий тест на S47 rehydrate, не трогал.
- [x] BE `COLUMN_ALIASES` (`studio-data-resolver.ts`) — источник канонических ключей для quick-add палитры (qty/sku/photo/unit/description/price), чтобы добавленная колонка реально гидрировалась из catalog/quotation/order rows, а не осталась пустой из-за несовпадения ключа.

## Acceptance

- [x] При виде «Продукты» (`tableTemplateId` set) можно сдвинуть «Фото» влево/вправо — reorder работает независимо от `rowSource` теперь.
- [x] Можно добавить «Количество», если его не было в виде — колонка появляется (через generic «+ Колонка» ИЛИ через новый quick-add чип «+ Количество»).
- [x] Gates PASS.

## Integrity slot

- [x] Тип изменения: relaxed 1 guard condition (`columnsEditable()`) + новая quick-add палитра (UI chips + 2 pure helpers в `studio-table-defaults.ts`). Не redesign column editor grid; не тронул reorder/remove механику саму (уже была написана верно, просто была недостижима под gate).
- [x] FIC: N/A
- [x] page.md: `document-studio.page.md` §3.6 (Свойства таблица)
- [x] Чужой WIP не в коммите; conflict keys соблюдены (studio-table-properties.component.ts/.spec.ts, studio-table-defaults.ts — новый файл `.spec.ts` для defaults не был в списке conflict keys, но это тот же файл-пара, что уже покрывает `studio-table-defaults.ts`, безопасно)
- [x] Канон: composition tree не тронут; фото pipeline не тронут (TZ-04 scope); `materialKind`/`Category` не задействованы в этой TZ вовсе

## Gates (факт)

- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → PASS
- `cd frontend-nx && pnpm exec jest studio-table-properties.component.spec.ts studio-table-defaults.spec.ts studio-editor-column-rehydrate.spec.ts --silent` → PASS 20/20 (было 14; +6 новых: 3 unlock-структуры, 1 customColumns:false lock, 1 quick-add, 1 defaults describe-блок с 3 sub-tests + 1 create helper test)
- `cd frontend-nx && pnpm test` (full) → PASS 114 suites / 793 passed + 7 pre-existing skipped (800 total)
- `cd frontend-nx && pnpm exec nx lint kppdf-web` → 277/38 (было 271/38) — **0 новых errors** (38/38, точное совпадение); +6 warnings — все `@typescript-eslint/no-non-null-assertion` в НОВЫХ строках `studio-table-properties.component.spec.ts` (established convention этого файла, тот же паттерн `!` уже везде в pre-existing тестах). Единственная строка-error в `studio-table-properties.component.ts` — тот же pre-existing baseline finding (89:13 → 92:13, сдвиг ровно на +3 строки от новых import-строк в шапке файла), подтверждено `git stash`/`git stash pop`.
- `cd frontend-nx && pnpm exec nx build kppdf-web` → PASS (те же 2 pre-existing warnings)

## Executor report

- **`columnsEditable()`'s original TWO-condition gate (`rowSource==='manual' && !templateId`) is now ONE condition** (`customColumns !== false`) — dropped both `!templateId` (the explicitly-named culprit) and `rowSource==='manual'` (implicitly blocking every catalog/quotation/order-sourced table too, which the TZ's own worked example — «Продукты» view with a Фото column, i.e. a catalog-sourced table — requires unlocked). No test previously locked in the old two-condition behavior, so nothing broke; new tests lock in the new one-condition behavior instead.
- **Zero new wiring needed for live-source rehydrate** — `patchTableSettingsForBlock`'s existing `'tableTemplateColumns' in patch` → `rehydrateLiveRowsAfterColumnChange()` branch (built for TZ-NX-DOCSTUDIO-S47) already re-fetches `liveRows` at the new column width whenever `emitColumnStructure()` fires, regardless of why it fired (manual add/remove/rename or now reorder/quick-add too). Verified this is exercised correctly by keeping `studio-editor-column-rehydrate.spec.ts` green untouched.
- **Quick-add palette uses canonical BE alias keys** (`qty`/`sku`/`photo`/`unit`/`description`/`price`, mirroring `COLUMN_ALIASES` in `studio-data-resolver.ts`) — a quick-added «Количество» column is keyed exactly `qty`, so it will actually hydrate real quantities from catalog/quotation/order rows via the resolver's alias lookup, not sit empty because of a key mismatch. `missingStandardColumnFields()` recognizes an existing column under ANY alias (e.g. a template already keyed `quantity` or `article`) so the palette never offers a duplicate.
- **`customColumns: false` kept as the one explicit opt-out**, per TZ's own "Hide-checkboxes остаются" instruction not to touch the show/hide mechanism — confirmed via `grep` that nothing in the codebase currently sets this flag (dead code path today, forward-compat only), and updated its now-stale locked-summary copy (previously blamed "видом или источником строк", which is no longer the trigger).
- No live browser click-through this session (no windowed environment) — recommend PO opens a table bound to a saved «Вид» (e.g. «Продукты» from a catalog source), confirms reorder (↑↓) moves the header on the canvas, and confirms a quick-add chip (e.g. «+ Количество») adds a working column.

## Closeout

- [x] archive + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-11T19:35:00Z
