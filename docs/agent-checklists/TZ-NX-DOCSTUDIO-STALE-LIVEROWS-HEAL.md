# TZ-NX-DOCSTUDIO-STALE-LIVEROWS-HEAL checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-DOCSTUDIO-STALE-LIVEROWS-HEAL.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-12T01:50:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — `_NOW.md` уже ISSUED на эту задачу, нет чужого CLAIM на те же keys
- [x] TZ прочитан целиком; зависимость (S47 rehydrate path) — DONE, в коде
- [x] Заново проверил реальный документ («КП 11.09.2026 (2)», `_id 6aa3ef71dd7c00449cb07749`) через `GET /api/studio-documents/:id/blocks` (login `admin`/`admin123`) — блок «Продукты» имеет `dataSource: undefined`, `tableTemplateColumns.length: 6`, `liveRows` = 8 строк по 3 ячейки
- [x] Claim slot заполнен **до** правки кода этой задачи

### Preflight Check Output
- **Context read:** TZ text; pre-UAT audit `af78049d`'s «Побочная находка»; S47 rehydrate path (`rehydrateLiveRowsAfterColumnChange`, `patchTableSettingsForBlock`); `refreshLiveDataSetsOnLoad`; canvas `tableRows()` (unconditional `liveRows` read, no `dataSource` gate)
- **Key Constraints:** не wipe / deploy / bulk Mongo migration / orphan photo cleanup; heal — единичный per-load, не массовый скрипт; не трогать manual tables без live source, у которых нет рассинхрона; после rehydrate backend должен переприменить `tableQtyOverrides`
- **Deviation from TZ's literal wording (flagged, not silent):** TZ's «ЧТО ДЕЛАТЬ» описывает heal только для таблиц «с live source». Прямая проверка реального документа показала `dataSource: undefined` на самом мотивирующем блоке — фикс, гейтированный только на валидный `dataSource`, НЕ вылечил бы документ, который и есть повод задачи. Реализован wider two-branch fix: valid live `dataSource` + mismatch → S47 nuclear rehydrate (как просит TZ); no/invalid `dataSource` + mismatch → просто чистит осиротевший `liveRows` (`liveRows: null`), холст падает на `tableTemplateSampleRows`. Обе ветки — детект и хил один раз на load, без bulk-миграции.
- **Planned Deliverable:** `studioLiveRowsMismatchColumns()` (`studio-table-defaults.ts`) + `healStaleLiveRowsOnLoad()` (`studio-editor.page.ts`), вызывается один раз в document-load callback рядом с существующим `refreshLiveDataSetsOnLoad`
- **Validation Path:** новый spec-файл (4 сценария) + regression across all studio spec files + full `nx test` + `nx build`

## Acceptance (из TZ)

- [x] Открыть doc с stale `liveRows` → canvas колонки и ячейки выровнены без ручного edit — `healStaleLiveRowsOnLoad()` запускается на каждом load (не только по факту edit колонок), детект через `studioLiveRowsMismatchColumns()`
- [x] Spec PASS; nx build / focused tests PASS — см. Gates
- [x] Audit note: PO больше не обязан трогать «КП 11.09.2026 (2)» ради этого — closeout добавлен в `docs/audits/2026-09-12-pre-uat-smoke.md`

## Gates (факт)

- `cd frontend-nx && pnpm exec jest studio-editor-column-rehydrate studio-editor-live-qty studio-editor-live-rows studio-editor-catalog-queue studio-table-defaults studio-blocks-canvas studio-editor-stale-liverows` → 7 suites / 39 tests passed (включая новый `studio-editor-stale-liverows.spec.ts`, 4/4)
- `cd frontend-nx && pnpm exec nx run kppdf-web:test --skip-nx-cache` (full suite) → 116 suites passed, 809 passed / 7 skipped, 0 failed
- `cd frontend-nx && pnpm exec nx build kppdf-web` → exit 0; только пре-существующие unrelated warnings (`studio-table-properties.component.ts` `??` hint, `gantt-bars.component.ts` budget) — не в файлах этой задачи

## Executor report

**Root cause:** canvas (`studio-blocks-canvas.component.ts` `tableRows()`) рендерит `block.settings['liveRows']`, если это непустой массив, **без проверки `dataSource`** — осиротевший снимок съезжает на холсте независимо от того, живая таблица или ручная. S47's `rehydrateLiveRowsAfterColumnChange` чинил рассинхрон только в момент редактирования структуры колонок оператором; `refreshLiveDataSetsOnLoad` (существующий, срабатывает на каждом load) чинит только таблицы с валидным live `dataSource` — реальный мотивирующий документ не подходит под этот гейт (`dataSource: undefined`), поэтому оставался кривым до ручного «тронь колонки».

**Fix:** новый `studioLiveRowsMismatchColumns(block)` (`studio-table-defaults.ts`) сравнивает длину каждой `liveRows`-строки с RAW `settings.tableTemplateColumns.length` (не с `studioTableColumns()`'s 3-column default-fallback — иначе ложный мисматч на блоках без явного списка колонок, как в S46-фикстуре без `tableTemplateColumns`). Новый `healStaleLiveRowsOnLoad()` (`studio-editor.page.ts`) вызывается один раз в document-load callback, для каждого table-блока с обнаруженным мисматчем: live `dataSource` → тот же nuclear rehydrate, что и S47 (`rows: []`, backend переприменяет `tableQtyOverrides` как обычно); no/invalid `dataSource` → `patchTableSettingsForBlock(id, { liveRows: null })`, без сетевого re-fetch.

**Tests:** новый `studio-editor-stale-liverows.spec.ts` — 4 сценария (live+mismatch → nuclear heal fires с `rows: []`; manual+mismatch → `liveRows: null`, no `putDataSet` call; manual+no-liveRows → чистый no-op; live+no-mismatch → ordinary refresh срабатывает один раз, heal не добавляет второй вызов). Фикстура `DOC.dataSets[0].rows` — тот же 3-ячеечный стейл-shape, что у реального бага, чтобы отличить «сработал heal» от «сработал только существующий ordinary refresh».

**Self-caught regression (fixed inline):** первая версия `studioLiveRowsMismatchColumns` использовала `studioTableColumns()` (fallback на 3-column default при отсутствии `tableTemplateColumns`) — ложно детектила мисматч на S46-тестовой фикстуре (2-cell `liveRows`, без явного списка колонок) и ломала её `putDataSet` call count assertion. Исправлено сравнением с RAW `settings.tableTemplateColumns` (нет ключа → нечего сравнивать, не «мисматч»). Regression re-run: 7/7 suites, 39/39 tests green.

**Не сделано (по TZ «НЕ»):** без bulk Mongo migration скрипта по всем studio docs (только per-load heal); без wipe/deploy/смены шаблонов реестра; без чистки orphan photo files на диске.

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: NX code (editor page + table-defaults helper + new spec) + docs
- [x] FIC §A–E: N/A — no new page/permission/module/MCP
- [x] page.md обновлён: `docs/pages/document-studio.page.md` (новый параграф про авто-heal)
- [x] DOMAIN-MAP: N/A — no route/module/page contour change
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Coupling map: N/A
- [x] Канон: docs/DOCS-INTEGRITY.md

## Closeout (после PASS)

- [x] archive + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-12T01:58:00Z
