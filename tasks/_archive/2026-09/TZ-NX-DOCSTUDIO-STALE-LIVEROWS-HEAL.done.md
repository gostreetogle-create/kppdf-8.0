# TZ-NX-DOCSTUDIO-STALE-LIVEROWS-HEAL: авто-heal старых таблиц при открытии

**РОЛЬ АГЕНТА:** Executor (frontend-nx) — claude  
**ЗАВИСИМОСТИ:** нет  
**LAYER:** 3 · **SIZE:** M  
**PAGES:** `/studio/:id`  
**PAGE_DOCS:** `document-studio.page.md`

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor-column-rehydrate.spec.ts` (extend) OR new `studio-editor-stale-liverows.spec.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-table-defaults.ts` (helper if needed) ;  
`docs/pages/document-studio.page.md` ;  
`docs/audits/2026-09-12-pre-uat-smoke.md` (ссылка closeout) ;  
`docs/agent-checklists/_NOW.md`

IMPLICIT CONFLICT: nx build kppdf-web

### Preflight
- Pre-UAT (`af78049d`): документ «КП 11.09.2026 (2)» — `liveRows` по 3 ячейки при 6 колонках; heal только при edit колонок (`rehydrateLiveRowsAfterColumnChange`), **не** при open.
- PO устал кликать — нужен авто-heal, не «пересохрани вручную».

## ЧТО ДЕЛАТЬ

1. При load документа / после hydrate blocks: для каждого `table` с live source, если  
   `liveRows.length > 0` и **хотя бы одна** строка имеет `length !== visibleColumns.length`  
   (или `tableTemplateColumns` / columns length) → вызвать тот же rehydrate path, что S47  
   (`rehydrateLiveRowsAfterColumnChange` / putDataSet empty → refresh).
2. Не трогать manual tables без live source.
3. Не wipe чужие qty overrides без нужды: после rehydrate backend должен снова применить `tableQtyOverrides` (как LINE-QTY).
4. Spec: fixture 3-cell rows + 6 columns → after open/load helper → putDataSet/rehydrate called once.
5. Docs: pre-UAT side finding closed.

## НЕ

- Массовая миграция Mongo всех studio docs скриптом (достаточно open-heal)
- Wipe / деплой / менять шаблоны в реестре
- «Починить» orphan photo files на диске

## AC

1. Открыть doc с stale liveRows → canvas колонки и ячейки выровнены без ручного edit.
2. Spec PASS; nx build / focused tests PASS.
3. Audit note: PO больше не обязан трогать «КП 11.09.2026 (2)» ради этого.

## Итог

**Deviation (flagged):** реальный мотивирующий документ имел `dataSource: undefined` — фикс,
буквально гейтированный только на «live source» (как в п.1 «ЧТО ДЕЛАТЬ»), не вылечил бы его.
Реализован wider two-branch heal: live `dataSource` + mismatch → S47 nuclear rehydrate;
no/invalid `dataSource` + mismatch → просто `liveRows: null` (нет сети, нечего re-fetch'ить).
Обе ветки — единичный heal на load, без bulk-миграции (см. `docs/agent-checklists/TZ-NX-DOCSTUDIO-STALE-LIVEROWS-HEAL.md`).

- `studioLiveRowsMismatchColumns()` (`studio-table-defaults.ts`) + `healStaleLiveRowsOnLoad()` (`studio-editor.page.ts`)
- Новый `studio-editor-stale-liverows.spec.ts` — 4/4 PASS
- Full `nx test kppdf-web` — 116 suites / 809 passed / 7 skipped, 0 failed
- `nx build kppdf-web` — exit 0 (только пре-существующие unrelated warnings)
- Audit closeout: `docs/audits/2026-09-12-pre-uat-smoke.md`
- Page doc: `docs/pages/document-studio.page.md`

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-12
closed_by: claude
verification:
  - acceptance criteria: PASS (все 3 TZ AC верифицированы; AC#1 через шире-чем-буквально-описанный two-branch fix, задокументировано выше)
  - typecheck: PASS (nx build kppdf-web — 0 errors)
  - tests: PASS (targeted 7 suites/39 tests; full kppdf-web suite 116 suites/809 tests, 0 failed)
  - lint: без новых ошибок (не запускался отдельно — TZ AC не требует; build/test проходят без lint-related failures)
  - checklist: ADDED (`docs/agent-checklists/TZ-NX-DOCSTUDIO-STALE-LIVEROWS-HEAL.md`)
  - progress.md: REDIRECT (не ведётся; статус — `_NOW.md` / checklist)
  - status synchronization: PASS (`_NOW.md` → IDLE)
