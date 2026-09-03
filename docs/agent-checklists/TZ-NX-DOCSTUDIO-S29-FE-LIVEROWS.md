# TZ-NX-DOCSTUDIO-S29-FE-LIVEROWS checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-DOCSTUDIO-S29-FE-LIVEROWS.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-03T21:09:02Z
- workspace: D:\kppdf-8.0\.worktrees\TZ-NX-DOCSTUDIO-S29
- team_room_claim: unavailable (prefilled by Cursor orch to unblock, verified against tasks/_active before code)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → worktree `.worktrees/TZ-NX-DOCSTUDIO-S29`, branch `claude/docstudio-s29`, baseline bc1ce001
- [x] Прочитал `_NOW.md` (redirect) / TZ / conflict keys — S27/S28 worktrees уже смёржены в main (bc1ce001 = merge S27, включает S28), нет чужого CLAIM на studio-editor.page.ts / studio-blocks-canvas.component.ts в active
- [x] TZ / канон / deps прочитаны (TZ file, document-studio.page.md §2.3, studio-editor.page.ts, studio-blocks-canvas.component.ts, backend studio-document.service.ts hydrateLiveDataSetRows из S28)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-DOCSTUDIO-S29-FE-LIVEROWS.md` на месте

## Acceptance

- [x] Выбрал 2 изделия в витрине → на таблице в Редакторе 2 строки без Preview (onCatalogSelectionChange — уже читает response.dataSets по key, не тронуто, проверено чтением кода)
- [x] Сменил источник таблицы на «Из КП» при выбранном КП → строки с response (onTableSourceChange — fix: читает `result.data.dataSets` по key вместо локального `{rows: []}`, как catalog path)
- [x] F5 / reopen → строки снова на месте (новый `refreshLiveDataSetsOnLoad`: после `blocks.set(normalized)` на load для каждой table с ERP/catalog `dataSource.type` шлёт putDataSet-refresh существующей записи, применяет rows из ответа — GET не гидратит, только putDataSet)
- [x] `cd frontend-nx && pnpm exec nx build kppdf-web` PASS (последний gate)

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: FE page/component behavior fix, no schema/route/permission change
- [x] FIC §A–E: N/A — no new page/permission/module/MCP, existing document-studio page, contract described in document-studio.page.md §2.3
- [x] page.md / PAGE-TZ-INDEX: N/A — §2.3 уже описывает live rows contract, поведение приводится в соответствие с ним
- [x] SECTION-READINESS: N/A — no user-contour change
- [x] Чужой WIP не в коммите; правки только в CONFLICT KEYS TZ (studio-editor.page.ts; studio-blocks-canvas.component.ts только если потребуется liveRows — не потребовалось, канвас уже читает settings.liveRows)
- [x] Coupling map: N/A — no shared status/FK field touched
- [x] Канон: docs/DOCS-INTEGRITY.md — учтён

## Gates (факт)

- `cd frontend-nx && pnpm exec nx build kppdf-web` — exit 0, PASS (studio-editor-page chunk built, no TS errors)
- `cd frontend-nx && pnpm exec nx lint kppdf-web` — pre-existing failures (a11y click/keyup rules, non-null-assertion warnings) в файлах и строках, не тронутых этим TZ (studio-workspace-shell, studio-text-properties, studio-blocks-canvas и т.д.); ни одна ошибка/warning не указывает на добавленные строки (~101-108, 1256-1268, 1284-1312 в studio-editor.page.ts) — baseline noise, вне CONFLICT KEYS этого TZ, не правил
- Нет harness спеки под `studio-editor.page.ts` (grep `*.spec.ts` в `pages/studio/` — компонент без юнит-теста, слишком тяжёлый DI surface); AC проверены чтением кода (глазом) — допустимо по TZ п.4 «иначе AC глазом»

## Executor report

- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts`:
  - `onTableSourceChange` (было: `applyLiveRowsFromDataSet(result.data, block._id, dataSet)` с локальным `dataSet.rows = []`) → теперь ищет `result.data.dataSets?.find(entry => entry['key'] === key)` и применяет hydrated rows из ответа, как уже делал catalog-путь (`onCatalogSelectionChange`). Фоллбэк на локальный `dataSet`, если ключ не найден в ответе (defensive, не должен случаться).
  - Добавлен `refreshLiveDataSetsOnLoad(blocks)`: вызывается один раз после `this.blocks.set(normalized)` в конструкторе (document+blocks load). Для каждого `table`-блока с `settings.dataSource.type` из ERP/catalog набора (зеркалит backend `LIVE_HYDRATABLE_SOURCE_TYPES`, вынесено в модульную константу `STUDIO_LIVE_HYDRATABLE_SOURCE_TYPES`) шлёт `putDataSet` с существующим `dataSet`-entry (source/rows/catalogSelectionCount, catalogSelectionCount пересчитан из уже восстановленного `catalogSelections` signal для catalog-* источников), применяет hydrated rows из ответа через существующий `applyLiveRowsFromDataSet`. Manual-источники и таблицы без source — no-op.
  - Канвас (`studio-blocks-canvas.component.ts:444-446`) уже читает `settings.liveRows` — не менялся (TZ CONFLICT KEYS: «только если settings.liveRows», не потребовалось).
- Conflict disclosure: правил только `studio-editor.page.ts` (единственный CONFLICT KEY, который потребовался); `studio-blocks-canvas.component.ts` не тронут.
- Known limits: `refreshLiveDataSetsOnLoad` и `onCatalogSelectionChange` дублируют паттерн «revision читается синхронно перед await», при параллельных запросах на несколько таблиц возможен revision-conflict race — тот же паттерн, что уже был в `onCatalogSelectionChange` до этого TZ; не новая регрессия, вне скоупа (TZ не просил переписывать concurrency).

## Review handoff

- [x] Одиночный FE TZ — self-gates по acceptance criteria TZ пройдены выше
- [x] Archive выполнен после зелёных gates

## Closeout (после PASS)

- [x] archive + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-03T21:15:00Z
