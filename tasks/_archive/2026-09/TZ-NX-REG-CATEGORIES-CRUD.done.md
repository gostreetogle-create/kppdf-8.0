# TZ-NX-REG-CATEGORIES-CRUD: реестр «Категории» + type module

**РОЛЬ АГЕНТА:** Executor (backend + frontend-nx) — claude  
**ЗАВИСИМОСТИ:** `TZ-NX-REG-UNITS-TO-REFERENCES` DONE  
**LAYER:** 2–3 · **SIZE:** L  
**PAGES:** `/registries/categories` (или master row)  
**PAGE_DOCS:** `registries.page.md`

**CONFLICT KEYS:**  
`backend/src/modules/category/**` ;  
`frontend-nx/libs/data-access/**/categor*` (create PiCategoriesService if missing) ;  
`frontend-nx/apps/kppdf-web/src/app/pages/registries/data/categories.registry.ts` (create) ;  
`frontend-nx/apps/kppdf-web/src/app/pages/registries/data/registries.catalog.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/registries/dialogs/category-form-dialog.component.ts` (create) ;  
`docs/pages/registries.page.md` ;  
`docs/CONTEXT.md` (строка Category) ;  
`docs/agent-checklists/WAVE-NX-REGISTRY-CATEGORIES.md` ;  
`docs/agent-checklists/_NOW.md`

IMPLICIT CONFLICT: nx build kppdf-web

### Preflight Check Output
- **Context read:** `category.schema.ts` type enum; controller `/categories`; no NX registry; WAVE
- **Key Constraints:** reuse Category; extend type `module`; skuPrefix required (auto from name OK); section `Справочники`
- **Planned Deliverable:** CRUD registry + BE enum; RU labels «Детали»/«Изделия»/«Модули» для type
- **Validation Path:** BE test + nx build; FIC A registry key

## ЧТО ДЕЛАТЬ

1. BE: `type` enum += `'module'`; DTO/swagger/tests; filter list `?type=`.
2. NX `PiCategoriesService` (list/create/update/remove) если нет.
3. Registry `categories`: title «Категории», category «Справочники»; columns name, type (RU), skuPrefix, parent, active; filters type+search; create/edit dialog (name, type select, optional parent same-type, skuPrefix auto/manual).
4. Wire into `buildRegistriesCatalogDefault`.
5. Docs + WAVE row 02.

## НЕ

- Wire forms details/products/modules (03–05)
- TextBlockCategory; wipe; change unique skuPrefix global rules beyond existing

## AC

1. `/registries` → Справочники → Категории: CRUD type material/product/module.
2. POST category type=module → 201.
3. Gates BE + nx build PASS.

---

**ARCHIVE_MARKER:** DONE 2026-09-11T14:10:00Z — see docs/agent-checklists/TZ-NX-REG-CATEGORIES-CRUD.md for SHA
