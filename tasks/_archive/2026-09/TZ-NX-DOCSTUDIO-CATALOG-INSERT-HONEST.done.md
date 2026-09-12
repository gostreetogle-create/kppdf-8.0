# TZ-NX-DOCSTUDIO-CATALOG-INSERT-HONEST: один kind → одна таблица; Insert = focus + toast + heal

**РОЛЬ АГЕНТА:** Executor (frontend-nx) — claude  
**ЗАВИСИМОСТИ:** PO 2026-09-12 lock: один kind → одна таблица; без дублей; без per-table subsets  
**LAYER:** 3 · **SIZE:** S  
**PAGES:** `/studio/:id` «Выбрано»  

### Preflight Check Output
- **Context read:** `studio-editor.page.ts` `insertCatalogTable` L1067–1079 (early-return focus only, **no toast**, **no re-put**); `setBlockCatalogSource` L1115–1140; page.md §D52
- **Key Constraints:** Mode A → executor; reuse toast; НЕ always-create
- **Planned Deliverable:** toast + rehydrate existing wired table on Insert
- **Validation Path:** unit spec insert; FIC N/A (no new route); `nx build kppdf-web`

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts` (`insertCatalogTable` + helper refresh kind) ;  
specs рядом; `docs/pages/document-studio.page.md` §D52

IMPLICIT CONFLICT: nx build kppdf-web

## ПРОДУКТОВЫЙ КОНТРАКТ (закрыть навсегда)

- Kind (изделия / модули / детали / материалы) → **максимум одна** живая таблица с `catalog-{kind}`.
- Повторный «Вставить таблицу …» **не** создаёт вторую.
- Оператор должен **понять**, что таблица уже есть, и увидеть на ней **актуальные** строки (не «тихий focus на пустую»).

## ЧТО ДЕЛАТЬ

1. `insertCatalogTable`: если `existing` с `dataSource.type === catalog-{kind}`:
   - `activateLayer(existing._id)`
   - toast RU: «Таблица «{label}» уже на листе» (изделия/модули/детали/материалы)
   - **обязательно** вызвать shared helper `refreshCatalogTablesOfKind(kind)` (из TZ HYDRATE-ALL) — re-putDataSet этой/этих matching tables с актуальной revision (heal пустых liveRows после failed parallel hydrate)
2. Если нет existing → `createTableBlock` + `setBlockCatalogSource` как сейчас.
3. Spec: existing → 0 create calls + toast spy + putDataSet вызван; no-existing → create+wire.
4. page.md §D52: явно «одна таблица на kind; повтор = focus + toast + обновление строк».

## НЕ
Always-create дубль; auto-delete лишних таблиц на листе (оператор сам удалит слой); per-table selections.

## AC
1. Второй Insert того же kind → нет нового table block.  
2. Toast виден.  
3. Если Выбрано непустое и таблица была «пустой» после reopen — после Insert строки появляются.  
4. Specs + nx build green.

---

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-12
closed_by: Claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS (nx test kppdf-web — 120 suites / 838 tests)
  - lint: PASS for touched files (38 pre-existing repo-wide errors unrelated, out of scope)
  - checklist: ADDED (docs/agent-checklists/TZ-NX-DOCSTUDIO-CATALOG-INSERT-HONEST.md)
  - progress.md: N/A (wave closeout will do one combined progress entry at WAVE COMPLETE)
  - status synchronization: PASS
