# TZ-NX-REG-TEXT-BLOCK-CATEGORIES: категории текстов → реестр «Документы»

**РОЛЬ АГЕНТА:** Executor (frontend-nx) — claude  
**ЗАВИСИМОСТИ:** нет (после DONE PUT-typeahead по слоту)  
**LAYER:** 3 · **SIZE:** L  
**PAGES:** `/registries/text-block-categories`  
**PAGE_DOCS:** `text-block-categories.page.md` ; `registries.page.md`

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/pages/registries/data/text-block-categories.registry.ts` (create) ;  
`frontend-nx/apps/kppdf-web/src/app/pages/registries/data/text-block-categories-http-data-source.ts` (create) ;  
`frontend-nx/apps/kppdf-web/src/app/pages/registries/data/registries.catalog.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/registries/data/registries.catalog.spec.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/registries/data/doc-studio-registry-actions.ts` (wire create/edit if needed) ;  
`frontend-nx/apps/kppdf-web/src/app/app.routes.ts` (redirect dictionaries → registries) ;  
`frontend-nx/apps/kppdf-web/src/app/pages/dictionaries/text-block-categories.page.ts` (delete or thin redirect stub) ;  
`frontend-nx/apps/kppdf-web/src/app/pages/dictionaries/text-block-categories.page.spec.ts` ;  
`docs/pages/text-block-categories.page.md` ;  
`docs/pages/registries.page.md` ;  
`docs/agent-checklists/WAVE-NX-DROP-REFERENCE-NAV.md` ;  
`docs/agent-checklists/_NOW.md`

IMPLICIT CONFLICT: nx build kppdf-web

### Preflight Check Output
- **Context read:** audit DROP-REFERENCE; `text-blocks.registry.ts`; `text-block-category-form-dialog.component.ts`; WAVE TEXT-LIBRARY (depth≤1 leaf)
- **Key Constraints:** reuse `PiTextBlockCategoriesService` + form dialog; **не** путать с catalog `Category`; flat registry OK (путь Root › Sub)
- **Planned Deliverable:** catalog row + dataSource + CRUD; redirect old URL
- **Validation Path:** FIC A; catalog spec keys; nx build

## ЧТО ДЕЛАТЬ

1. Registry key `text-block-categories`, title «Категории текстов», `category: 'Документы'`, `source: 'api'`.
2. DataSource: list categories (roots + children); колонки: имя, путь/родитель, системная, по умолчанию, активна; фильтр search + optional rootsOnly.
3. Create/edit/delete: reuse `TextBlockCategoryFormDialogComponent` (root vs sub via parentId); system rows — no delete (как на page).
4. Wire in `buildRegistriesCatalogDefault` **рядом** с text-blocks.
5. Route: `Redirect` `/dictionaries/text-block-categories` → `/registries/text-block-categories` (или remove dictionaries child + redirect).
6. Удалить standalone page component **или** оставить как unused → предпочтительно удалить + перенести specs на registry/catalog.
7. page.md: SoT = реестры; WAVE row 01.

## НЕ

- Менять BE TextBlockCategory / leaf rules
- Catalog `Category` (детали/изделия)
- Удалять nav `reference` (это TZ-02)

## AC

1. `/registries` → Документы → «Категории текстов» + «Тексты».
2. Create root + subcategory + edit работает; system «Общее» без delete.
3. Старый URL dictionaries открывает реестр (redirect).
4. Studio/text form cascade не сломан.
5. Gates PASS.

---

**ARCHIVE_MARKER:** DONE 2026-09-11T13:05:00Z — see docs/agent-checklists/TZ-NX-REG-TEXT-BLOCK-CATEGORIES.md for SHA
