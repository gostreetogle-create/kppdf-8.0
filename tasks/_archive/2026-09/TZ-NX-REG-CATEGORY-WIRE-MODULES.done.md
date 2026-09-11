# TZ-NX-REG-CATEGORY-WIRE-MODULES: модули — categoryId + обязательный select

**РОЛЬ АГЕНТА:** Executor (backend + frontend-nx) — claude  
**ЗАВИСИМОСТИ:** `TZ-NX-REG-CATEGORIES-CRUD` DONE  
**LAYER:** 2–3 · **SIZE:** L  
**PAGES:** `/registries/modules`  
**PAGE_DOCS:** `registries.page.md` ; modules page.md if any

**CONFLICT KEYS:**  
`backend/src/modules/product-module/**` (schema/DTO/service) ;  
`frontend-nx/libs/data-access/**/module*` types ;  
`frontend-nx/apps/kppdf-web/src/app/pages/registries/dialogs/module-form-dialog.component.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/registries/data/modules.registry.ts` ;  
`docs/pages/registries.page.md` ;  
`docs/agent-checklists/WAVE-NX-REGISTRY-CATEGORIES.md` ;  
`docs/agent-checklists/_NOW.md`

IMPLICIT CONFLICT: nx build kppdf-web

## ЧТО ДЕЛАТЬ

1. BE: `categoryId?: ObjectId` ref Category на ProductModule; create/update DTO; validate category.type === `module` when set; **require** on create (400 RU если нет).
2. NX types + form: select categories type=module, required.
3. Registry column: имя категории.
4. WAVE row 05 COMPLETE.

## НЕ

- Composition tree rewrite; photos

## AC

1. POST module without categoryId → 400.
2. Form cannot save without category.
3. Categories type=module from registry appear in select.
4. Gates BE + nx build PASS.

---

**ARCHIVE_MARKER:** DONE 2026-09-11T15:45:00Z — see docs/agent-checklists/TZ-NX-REG-CATEGORY-WIRE-MODULES.md for SHA
