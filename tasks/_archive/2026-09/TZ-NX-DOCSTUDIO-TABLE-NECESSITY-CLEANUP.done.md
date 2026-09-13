# TZ-NX-DOCSTUDIO-TABLE-NECESSITY-CLEANUP: порядок в Свойствах таблицы (нужное оставить, дубли/хардкод убрать)

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-13
closed_by: claude
verification:
  - acceptance criteria: PASS (5/5, все три этапа A/B/C)
  - typecheck: PASS (BE + FE, каждый этап)
  - tests: PASS (BE 135 suites/1336 tests; FE 125 suites, 875→881→885 tests по этапам)
  - lint: PASS (0 errors, scoped files, каждый этап)
  - architecture:check: PASS (каждый этап)
  - nx build kppdf-web: PASS (last gate, каждый этап)
  - live browser/Mongo evidence: PASS (каждый этап; этап B live-check поймал реальный
    dataSource-формат несовпадение до коммита)
  - checklist: `docs/agent-checklists/TZ-NX-DOCSTUDIO-TABLE-NECESSITY-CLEANUP.md` + evidence/
  - status synchronization: PASS (WAVE-2026-09-13-STUDIO-OPS.md обновлён по каждому этапу)

## Absorbs / supersedes

TABLE-KIND-IA, TABLE-SOURCE-FIX, INSERT-APPLY-KIND (не отдельные TZ, поглощены
этапами A/A+B/B) и TZ-NX-DOCSTUDIO-TABLE-COL-WIDTH-APPLY (поглощён этапом C
целиком — не запускать отдельно).

## Этап A — IA (commit `726641e3`)

«Вид таблицы» → «Макет колонок» + CTA при пустом виде. «Источник строк» для
catalog-таблицы → статус + [Обновить строки] + [Сменить…] вместо голого
дублирующего enum.

## Этап B — SoT + round-trip (commit `2dfc367b`)

Insert применяет реестровый `TableTemplate` по `dataSource` вместо хардкода
3 колонок (нормализованное сравнение — живая проверка поймала реальный формат
`dataSource: "product"`, не `"catalog-products"`). Слиты `onTableSourceChange`/
`setBlockCatalogSource` в один `applyTableSource`, в общей write-очереди.
Фиксы B1 (liveRows: null на manual) / B2 (dataSource персистится на блок) /
B3 (честный toast при пустом Выбрано).

## Этап C — dead controls / col-width (commit — см. WAVE checklist)

`columnWidthPercents()` (BE+FE, единый контракт) реально применяется к
`th`/`td` на холсте и в PDF/preview вместо равного деления. UI-хинт «Ширина, %
— сумма ≈ 100%». ≤1 активный вид на канон. имя/dataSource — подтверждено живой
проверкой Mongo (0 дублей).

## Files changed (сводно по всем этапам)

- `backend/src/modules/studio-document/studio-data-resolver.ts` (+ `.spec.ts`)
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts`
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-table-properties.component.ts` (+ `.spec.ts`)
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-table-defaults.ts`
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-blocks-canvas.component.ts` (+ `.spec.ts`)
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-properties-panel.component.ts` (декларированная девиация, этап A)
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor-catalog-insert.spec.ts`
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor-finalize.spec.ts` (fixture fix)
- `docs/pages/document-studio.page.md`
- `docs/agent-checklists/TZ-NX-DOCSTUDIO-TABLE-NECESSITY-CLEANUP.md` + `evidence/TZ-NX-DOCSTUDIO-TABLE-NECESSITY-CLEANUP.txt`

## Wave 2 — complete

Все 3 этапа DONE. Волна 3 (CATEGORY-INLINE-CREATE, OPS-DOCS-HOST-52-SYNC,
VITRINA-PHOTO-BROKEN-IMG) не начиналась — по инструкции промпта, ждёт
отдельного GO.
