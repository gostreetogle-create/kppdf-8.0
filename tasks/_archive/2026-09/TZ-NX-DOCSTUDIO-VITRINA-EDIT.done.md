# TZ-NX-DOCSTUDIO-VITRINA-EDIT: «Изменить» в витрине + refresh таблицы на листе

**РОЛЬ АГЕНТА:** Executor (frontend-nx) — claude  
**ЗАВИСИМОСТИ:** HYDRATE-ALL helper `refreshCatalogTablesOfKind` DONE (стадия 2 этой волны); form dialogs живые  
**LAYER:** 3 · **SIZE:** M  
**PAGES:** `/studio/:id` панель «Данные» → Товары  
**PAGE_DOCS:** `docs/pages/document-studio.page.md`  

### Preflight Check Output
- **Context read:** `studio-data-vitrina` — Add/Remove only; registries `openProductEdit` / module / material hosts; audit R4 — Save фото без putDataSet → таблица stale
- **Key Constraints:** reuse dialogs; после Save — **и** витрина, **и** A4 table
- **Planned Deliverable:** Изменить + dialog + refresh list + refreshCatalogTablesOfKind
- **Validation Path:** specs; nx build

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-data-vitrina.component.ts` (+ specs) ;  
`studio-editor.page.ts` (wiring edit event → dialog + refresh kind) ;  
reuse product/module/material form dialogs / catalog-registry-dialog-host ;  
page.md

IMPLICIT CONFLICT: nx build kppdf-web

## РЕШЕНИЕ (PO)

Кнопка **«Изменить»** на карточке витрины → тот же edit dialog, что в реестре. Без ухода из студии.  
После Save: свежие имя/SKU/thumb **в витрине** и **строки/фото в таблице kind на листе** (без F5).

## ЧТО ДЕЛАТЬ

1. UI: `Изменить` (`data-test="studio-data-vitrina-edit"`) на 4 вкладках.
2. Open edit dialog по kind (product/module/part/material) — reuse registry hosts.
3. После close с сохранённой entity:
   - reload vitrina list / mediaUrl
   - **обязательно** `refreshCatalogTablesOfKind(activeKind)` (helper из HYDRATE-ALL)
4. Dirty document не silently discard.
5. Specs: кнопка; open; после save → refresh kind called (mock).
6. page.md: Изменить + обновление листа.

## НЕ
BE rewrite; navigate `/registries`; orphan wipe; deploy; новый putDataSet write-path в обход helper.

## AC
1. «Изменить» на 4 kinds.  
2. Save фото в dialog → на A4 в wired catalog table ячейка фото обновляется **без reopen** (если файл на диске; orphan → «Нет фото» честно).  
3. Specs + nx build green.

---

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-12
closed_by: Claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS (nx test kppdf-web — 122 suites / 850 tests)
  - lint: PASS for touched files (only pre-existing-style warnings, 0 new errors)
  - checklist: ADDED (docs/agent-checklists/TZ-NX-DOCSTUDIO-VITRINA-EDIT.md)
  - progress.md: pending (WAVE COMPLETE combined entry)
  - status synchronization: PASS
