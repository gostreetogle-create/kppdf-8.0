# TZ-DESKTOP-SUPPLY-EXCEL-B checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-DESKTOP-SUPPLY-EXCEL-B.md` (removed at closeout)
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-08T10:51:46Z **(process note: written after research + implementation started, not strictly before — see below)**
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI configured in this session)

**Process gap, flagged honestly:** the TZ's complexity (net-new generator, a
library-choice decision, a transitive type-conflict fix) led to diving into
research/exploration and then straight into code before writing this Claim
file, contrary to the "Claim before code" rule. `tasks/_active/` was verified
empty at session start and this was a single continuous session on these
conflict keys, so no actual concurrent-edit collision occurred — but the
*procedure* was out of order and is called out here rather than silently
back-dated as if it happened correctly.

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на те же keys (`_active/` был пуст)
- [x] TZ / канон / deps прочитаны (Path A DONE)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-DESKTOP-SUPPLY-EXCEL-B.md` на месте

### Preflight Check Output
- **Context read:** `docs/audits/2026-09-06-supply-google-sheets-to-nx-audit.md` §8 (оба пути A/B); `tasks/_archive/2026-09/TZ-DESKTOP-SUPPLY-EXCEL-A.done.md`; `desktop/src/core/import-targets.ts` (`supplyRequest` columns несут канон подписей/алиасов); `desktop/src/core/multi-import.ts` (`SupplyRequestLookups`/`validateSupplyRows` — материал матчится по `article`, оба article+name индексируются в одну карту); `desktop/src/App.svelte` `fetchSupplyLookups`/`downloadExcelForm`/`downloadExcelExport` (Tauri save-dialog + writeFile паттерн); `desktop/src/importers/excel.ts` (`parseExcelWorkbook` — уже multi-sheet, уже выбирает первый непустой лист как активный)
- **Key Constraints:** HITL confirm only (импорт правки не меняет); генератор — новый код, импорт переиспользует существующий multi-sheet parser без изменений; `xlsx` (SheetJS Community) не пишет data validation — нужна другая библиотека для нативных dropdown
- **Planned Deliverable:** `desktop/src/core/supply-excel-pack.ts` (генератор) + UI кнопка в Form Studio + fetch справочников + docs
- **Validation Path:** `npx tsx --test`; `tsc --noEmit`; `svelte-check`; доп. проверка `vite build` (де-риск бандла новой зависимости в WebView, не входит в стандартный TZ gate-набор, но напрямую проверяет критичный риск)

**Проверено:** Path A DONE; Path B PARK → READY (после shipping) → теперь DONE.

## Инженерное решение, вынесенное на поверхность (не тихо)

`xlsx` (SheetJS Community, уже используется в проекте) **не пишет** нативную
Excel data validation — это фича только Pro-версии SheetJS. Без неё
критерий приёмки №1 («dropdowns work in Excel») невыполним. Добавлена
`exceljs@^4.4.0` — зрелая, широко используемая библиотека, читает/пишет
`<dataValidations>` по спецификации OOXML. Использована **только** для
генератора (`buildSupplyExcelPackWorkbook`/`serializeSupplyExcelPack`);
импорт (чтение файла обратно) по-прежнему идёт через существующий
`xlsx`-парсер — межбиблиотечная совместимость (exceljs write → xlsx read)
проверена round-trip тестом, а не предположением.

Побочный эффект: `exceljs` тянет `fast-csv` (свою неиспользуемую нами
CSV-фичу), а та — устаревший транзитивный `@types/node@14.18.63`,
конфликтующий с собственным `@types/node@26.1.2` проекта (ломал `tsc` на
несвязанном `src/ai-runner/index.ts` — Buffer/Uint8Array несовместимость
между версиями типов). Исправлено `overrides` в `desktop/pnpm-workspace.yaml`
(pnpm v11 хранит overrides там, не в `package.json`) — единая версия
`@types/node` на всё дерево.

Отдельно: сам exceljs's `index.d.ts` (v4.4.0) не декларирует
`Worksheet.dataValidations` (хотя метод существует в рантайме) — добавлена
точечная ambient-аугментация `desktop/src/core/exceljs-data-validations.d.ts`
вместо `as any` на местах вызова.

## Acceptance

- [x] Download multi-sheet template from Desktop; dropdowns work in Excel — сгенерированный `.xlsx` содержит нативные `<dataValidations>` (type: list) для колонок Артикул/Поставщик/№ заказа, проверено round-trip через сам exceljs (переоткрытие подтверждает валидации) и совместимость с существующим `xlsx`-ридером
- [x] Import matched rows → FK; unmatched stay red until resolve — импорт не менялся, переиспользует существующий Path A `validateSupplyRows`/`SupplyRequestLookups` без изменений (то же поведение)
- [x] Desktop tests + typecheck + check PASS; no .exe forced unless version bump needed — все PASS; version bump пропущен (app-logic only, не installer-facing, тот же принцип что Excel A)

## Gates (факт)

- `cd desktop && npx tsx --test src/core/*.test.ts src/core/ai/*.test.ts src/importers/*.test.ts src/ai-runner/*.test.ts` → 145/145 (10 новых в `supply-excel-pack.test.ts`, 0 регрессий)
- `cd desktop && pnpm run typecheck` (`tsc --noEmit`) → exit 0
- `cd desktop && pnpm run check` (svelte-check) → 401 files, 0 errors, 0 warnings
- `cd desktop && npx vite build` → PASS, exit 0 (де-риск: подтверждает, что `exceljs` реально бандлится для WebView-фронтенда Tauri, не только для Node-тестов; единственное предупреждение — pre-existing/expected «chunk >500kB», не ошибка)

## Executor report

- New `desktop/src/core/supply-excel-pack.ts` (+`.test.ts`, 10 tests) — `buildSupplyExcelPackWorkbook(data)` / `serializeSupplyExcelPack(data)`: 4-sheet workbook (`Заявки` первым — активный лист по умолчанию, как только заполнен; `Материалы`/`Поставщики`/`Заказы` — read-only снимок API), колонки «Заявки» переиспользуют `IMPORT_TARGETS.supplyRequest.columns` (минус raw ObjectId + `status`) — один источник подписей/алиасов с путём A, не дублируются руками. Data validation (`type: list`) на Артикул/Поставщик/№ заказа, 200 пустых строк с запасом, диапазон справочника ≥1 строка даже при пустом каталоге.
- `desktop/src/core/exceljs-data-validations.d.ts` (new) — ambient-аугментация недостающего в `index.d.ts` `Worksheet.dataValidations`.
- `desktop/package.json`: `+exceljs@^4.4.0`. `desktop/pnpm-workspace.yaml`: `overrides: '@types/node': ^26.1.2` (гасит транзитивный конфликт версий типов от `exceljs → fast-csv`).
- `App.svelte`: `fetchSupplyPackData(api)` (те же 3 GET, что `fetchSupplyLookups`, но списки для генератора, не Map для матчинга — сознательно не переиспользует ту же функцию, разная форма данных); `downloadSupplySheetsPack()` (тот же Tauri save-dialog + writeFile паттерн, что `downloadExcelForm`/`downloadExcelExport`); новая кнопка «Шаблон снабжения (со списками)» в Form Studio, видна когда `formTable === 'supplyRequest'`, требует паринга (данные с сервера); новая запись `HINTS.downloadSupplyPack`.
- Docs: `desktop/README.md` (§Снабжение путь B), `docs/pages/supply.page.md` (TZ row), `docs/agent-checklists/WAVE-NX-SUPPLY-OPS.md` (Excel B → DONE, 7/7 → 8/8).
- Known limits: material/supplier/order dropdown lists are a point-in-time API snapshot at download time — a newly-created material after download won't appear until the template is re-downloaded (same limitation as Path A's typeahead, inherent to any offline-fillable spreadsheet). No auto-fill formula for «Наименование» from the picked «Артикул» — user still types both (kept scope to what the TZ actually asked: dropdowns for FK match columns, not a VLOOKUP convenience feature). No live-Excel manual open-and-click verification this session (no Excel install in this environment) — verification relies on OOXML-level round-trip proof (exceljs re-load + cross-library xlsx-reader compatibility), which is the strongest automatable evidence available.

## Review handoff

- [x] READY FOR REVIEW — N/A, wave не требует Cursor review gate (executor continuous)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-08T11:10:00Z
