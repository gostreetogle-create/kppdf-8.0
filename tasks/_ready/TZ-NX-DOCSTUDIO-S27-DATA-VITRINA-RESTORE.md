# TZ-NX-DOCSTUDIO-S27-DATA-VITRINA-RESTORE: витрина в панели «Данные»

**РОЛЬ АГЕНТА:** Executor (frontend-nx only)  
**LAYER:** 3  
**PAGES:** document-studio  
**PAGE_DOCS:** `docs/pages/document-studio.page.md` §3.3  
**ЗАВИСИМОСТИ:** нет (первая в FINISH)  
**CONFLICT KEYS:** `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-data-panel.component.ts`; `studio-data-panel.component.spec.ts`; `studio-showcase-panel.component.ts`; `studio-editor.page.ts`  
**IMPLICIT CONFLICT:** `nx build kppdf-web`

### Preflight Check Output
- **Context read:** honesty audit; `studio-data-panel` (no vitrina); orphan `studio-showcase-panel`; editor `onCatalogSelectionChange`
- **Key Constraints:** FE only; reuse `onCatalogSelectionChange`; no new BE; A4 overlay law
- **Planned Deliverable:** catalog grid in Data panel + wired selection
- **Validation Path:** `nx build kppdf-web` + studio-data spec; глаз на `:4201`

## Domain preflight

Витрина = Изделия/Модули/Детали/Материалы в Doc Studio «Данные». Не реестры, не MASTER-CORE desk vitrina после ORDERS-302.

## ИСХОДНОЕ

1. `pi-studio-data-panel` — только селекты + chips.  
2. `pi-studio-showcase-panel` — полный picker, **не** в template editor.  
3. Editor: `catalogSelections`, `onCatalogSelectionChange`, `catalogChipLabels`, `removeCatalogChip` живы.  
4. `panelWide` уже при `section==='data'`.

## ЧТО ДЕЛАТЬ

1. Встроить витрину **сверху** data-panel (child ok): сегмент 4 категорий в один ряд, поиск, сетка `app-pi-showcase-card` size=`md` (2 колонки).  
2. Toggle → `catalogChange` output → editor `onCatalogSelectionChange` (без нового write-path).  
3. Загрузка списков: те же API, что showcase (`PiProductsService` / modules / materials с kind filter).  
4. Фото: products/modules передавать реальные `photoIds` (не `photoUrl(undefined)`).  
5. После merge: удалить или опустошить orphan showcase (не два UI).  
6. `data-test="studio-data-vitrina"`. Spec: сегмент + grid рендерятся.

## НЕ ИЗМЕНЯТЬ

- BE `putDataSet` / resolver (S28)  
- Save / Preview  
- Legacy `frontend/**`

## КРИТЕРИИ ПРИЁМКИ

1. Данные → видны карточки категорий; выбор ставит chip «N изделий».  
2. Нет отдельного rail «Витрина».  
3. `cd frontend-nx && pnpm exec nx build kppdf-web` exit 0.  
4. Focused `studio-data` tests PASS.

## Финализация

Claim → code → gates → `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S27-DATA-VITRINA-RESTORE.done.md` → commit/push по GIT-POLICY.
