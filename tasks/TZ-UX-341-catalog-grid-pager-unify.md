# TZ-UX-341: Каталог — единый pager на grid + PAGE_SIZE=10

РОЛЬ АГЕНТА: Frontend

ЗАВИСИМОСТИ: **TZ-UX-340 DONE**; если UX-326 ещё IN WORK на `products.page.ts` — **STOP/DEFER** до её archive

LAYER: 3

CONFLICT KEYS: `frontend/src/app/pages/products/products.page.ts` ; `frontend/src/app/pages/products/products.page.spec.ts` ; `frontend/src/app/pages/modules/modules.page.ts` ; `frontend/src/app/pages/modules/modules.page.spec.ts` ; `frontend/src/app/pages/materials/materials.page.ts` ; `frontend/src/app/pages/materials/materials.page.spec.ts` ; page.md тройки при необходимости

PAGES: `/products` ; `/modules` ; `/materials`  
PAGE_DOCS: products.page.md ; modules.page.md ; materials.page.md

CHECKLIST: `docs/agent-checklists/TZ-UX-341.md`

---

## ЧТО ДЕЛАТЬ

1. Удалить custom `grid-pager` разметку на трёх страницах → `<app-pi-pagination>` (тот же канон, что table).
2. Products: `PAGE_SIZE` **15 → 10**; server `limit` = 10.
3. При `pageSizeChange` (если включено): обновить limit/slice и сбросить page=1.
4. List-mode уже через pi-table — после 340 должен совпасть визуально; проверить.
5. Specs: grid pager tests → новые data-tests канона.

Gates: tsc + focused products/modules/materials page specs.

## НЕ

- Chrome filters-rail (UX-326/327/328)  
- Backend schema  

## AC

- [ ] Grid и table на трёх каталогах — один вид пагинации  
- [ ] Products первой страницей 10, не 15  
- [ ] Gates PASS  
