# TZ-NX-REG-CATEGORY-WIRE-PRODUCTS: изделия — обязательная категория

**РОЛЬ АГЕНТА:** Executor (frontend-nx) — claude  
**ЗАВИСИМОСТИ:** `TZ-NX-REG-CATEGORIES-CRUD` DONE  
**LAYER:** 3 · **SIZE:** L  
**PAGES:** `/registries/products`  
**PAGE_DOCS:** `registries.page.md`

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/pages/registries/dialogs/product-form-dialog.component.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/registries/data/products.registry.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/registries/data/products-http-data-source.ts` (если колонка) ;  
`docs/pages/registries.page.md` ;  
`docs/agent-checklists/WAVE-NX-REGISTRY-CATEGORIES.md` ;  
`docs/agent-checklists/_NOW.md`

IMPLICIT CONFLICT: nx build kppdf-web

## ЧТО ДЕЛАТЬ

1. Product form: ObjectId → select Category `type=product`, **required** on create.
2. Registry column/filter: имя категории.
3. Legacy `subcategory` string — не раздувать; если мешает UX, hide или leave optional (не второй SoT).
4. WAVE row 04.

## НЕ

- Module schema; Category CRUD redesign

## AC

1. Create product without category blocked.
2. Select = product categories from registry.
3. nx build PASS.

---

**ARCHIVE_MARKER:** DONE 2026-09-11T15:10:00Z — see docs/agent-checklists/TZ-NX-REG-CATEGORY-WIRE-PRODUCTS.md for SHA
