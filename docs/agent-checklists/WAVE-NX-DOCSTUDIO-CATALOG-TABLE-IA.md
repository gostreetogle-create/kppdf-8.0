# WAVE-NX-DOCSTUDIO-CATALOG-TABLE-IA — последняя волна по таблицам каталога

updated_at: 2026-09-12T20:35:00Z  
status: **WAVE COMPLETE** — all 4 TZ archived, nx build kppdf-web green  
prompt: `tasks/_archive/2026-09/prompts-spent/PROMPT-CLAUDE-DOCSTUDIO-CATALOG-TABLE-IA.md`  
checklist: `docs/agent-checklists/DOCSTUDIO-CATALOG-TABLE-IA-CHECKLIST.md`

| # | TZ | SIZE | Status | SHA |
|---|-----|------|--------|-----|
| 1 | `TZ-NX-DOCSTUDIO-CATALOG-INSERT-HONEST.md` | S | DONE | `3fd93047` |
| 2 | `TZ-NX-DOCSTUDIO-CATALOG-HYDRATE-ALL.md` | M | DONE — **serial putDataSet = корень бага, исправлен** | `bd7ed96f` |
| 3 | `TZ-NX-DOCSTUDIO-TABLE-UNWIRED-EMPTY-STATE.md` | S | DONE | `b0258eee` |
| 4 | `TZ-NX-DOCSTUDIO-VITRINA-EDIT.md` | M | DONE | `d235f4f1` |

## PO lock
Один kind → одна таблица; общий «Выбрано»; per-table subset **отменён**.

## Re-verify 2026-09-12 (код, не догадка)
1. `insertCatalogTable` — focus без toast/heal → оператор «Вставить снова» на пустой таблице.  
2. `refreshLiveDataSetsOnLoad` — **parallel** putDataSet + silent fail → при 2+ tables данные часто только у одной.  
3. Canvas empty — один текст для manual и live → врёт.  
4. Vitrina без edit + Save фото без re-put → фото на листе stale.

## Definition of Done (волна закрыта = к теме таблиц каталога **не возвращаемся**)
- [x] Open doc: все **wired** catalog/quotation/order tables наполнены (serial hydrate доказан spec — `studio-editor-hydrate-serial.spec.ts`, 4 tables, expectedRevision `[1,2,3,4]`, one-failure-doesn't-abort-rest).
- [x] Повторный Insert kind → toast, нет дубля, строки на существующей таблице (`studio-editor-catalog-insert.spec.ts`).
- [x] «+ Таблица» без source → честный empty, не «сломалась витрина» (`studioTableEmptyStateLabel`, two distinct RU texts, specs in `studio-table-defaults.spec.ts` + `studio-blocks-canvas.component.spec.ts`).
- [x] «Изменить» в витрине → Save → карточка + лист обновлены без F5 (`studio-data-vitrina-edit.spec.ts`, `refreshCatalogTablesOfKind` wired to `catalogEntitySaved`).
- [x] page.md §D52/§3.3/S45/S46 обновлены; WAVE COMPLETE + Executor report SHA (below).
- [x] Не заведено follow-up TZ на «ещё раз фото»/«ещё раз пустые таблицы» — DoD закрывает тему.

## Вне DoD (не эта волна, не рецидив IA)
- Orphan media на диске (нет файла) → «Нет фото» — честно; wipe только по DANGEROUS-OPS.  
- Ручное удаление старых дублей таблиц на уже сохранённых документах — действие оператора.  
- Deploy / VPN.

## НЕ
Expand S15 all unwired; bake GET; per-table selections; wipe; deploy.
