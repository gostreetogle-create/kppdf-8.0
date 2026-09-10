# TZ-NX-HUB-04-warehouses: expand contents + icon actions — `/warehouses`

**РОЛЬ АГЕНТА:** Executor (frontend-nx) — claude  
**ЗАВИСИМОСТИ:** `TZ-NX-HUB-03-supply` DONE  
**LAYER:** 3 · **SIZE:** L  
**PAGES:** `/warehouses`  
**PAGE_DOCS:** `warehouses.page.md` ; `storage-items.page.md` (deep-link only)  

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/pages/warehouse/warehouses.page.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/warehouse/warehouses.page.spec.ts` ;  
`docs/pages/warehouses.page.md` ;  
`docs/agent-checklists/WAVE-NX-HUB-TABLE-PARITY.md` ;  
`docs/agent-checklists/HUB-TABLE-CONTINUOUS-CHECKLIST.md`

IMPLICIT CONFLICT: frontend-nx/apps/kppdf-web — nx build kppdf-web

### Preflight Check Output
- **Context read:** hub-table canon; `warehouses.page.ts` (CRUD, no expand); `PiStorageItemsService.list({ warehouseId })`; `storage-items.page.md` query `?warehouseId=`
- **Key Constraints:** Остатки **не** редактировать здесь — сводка + переход. Icon actions вместо широких secondary.
- **Planned Deliverable:** expand inventory preview + crumbs/chip + `app-pi-row-actions`
- **Validation Path:** warehouses specs + nx build

---

## ИСХОДНОЕ СОСТОЯНИЕ

1. Flat CRUD; actions «Сделать по умолчанию» / «Изменить» / «Удалить» — широкие кнопки.
2. Нет пути «что лежит на складе» без ухода в меню вручную.
3. `/storage-items?warehouseId=` уже канон deep-link.

## ЧТО ДЕЛАТЬ

1. ▸ expand single-row; hover/density как в волне.
2. **Expand:**
   - «Хлебные» крошки текста: `Склад / {name} / Остатки` (не ломая app chrome crumbs).
   - `PiStorageItemsService.list({ warehouseId: row._id })` — до **8** строк (название/материал + qty); loading/error/empty честно.
   - Chip/кнопка `.pi-outline-btn`: «Все остатки склада» → `routerLink="/storage-items"` + `queryParams: { warehouseId: row._id }`.
3. **Actions:** `app-pi-row-actions` edit+delete; default — отдельный `pi-icon-btn` (★ / aria-label «Сделать по умолчанию») только если `!isDefault`. `stopPropagation`. Delete confirm сохранить.
4. Specs: expand loads items; link has warehouseId; icons; actions не тоглают expand.
5. page.md; WAVE 04 DONE; continuous checklist **COMPLETE**; `_NOW` Claude IDLE.

## НЕ ИЗМЕНЯТЬ

- BE warehouse type/zones invent
- `/storage-items` page layout (только consume deep-link)
- `/production`, wipe

## КРИТЕРИИ ПРИЁМКИ

1. Icon actions; нет широких «Изменить»/«Удалить»/длинного «Сделать по умолчанию» text-btn.
2. Expand показывает preview остатков или честный empty.
3. Chip ведёт на `/storage-items?warehouseId=<id>`.
4. Gates:

```text
cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern=warehouses.page
cd frontend-nx && pnpm exec nx build kppdf-web
```

## BUILD INTEGRITY

Sequential · build last. Финал волны.

## Archive

`tasks/_archive/2026-09/` + Executor report со всеми SHA волны в continuous checklist.
