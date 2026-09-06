# TZ-NX-WAREHOUSE-W1-SHELL: nav «Склад» + routes + thin warehouses

**РОЛЬ АГЕНТА:** Executor (frontend-nx) — Freebuff  
**ЗАВИСИМОСТИ:** нет (открывает волну)  
**LAYER:** 3 · **SIZE:** L  
**PAGES:** `/warehouses` (+ stubs routes for balances/movements)  
**PAGE_DOCS:** `docs/pages/warehouses.page.md`

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/app.routes.ts` ;  
chrome/nav layout files that add «Склад» group ;  
`frontend-nx/apps/kppdf-web/src/app/pages/warehouse/**` (create) ;  
`frontend-nx/libs/data-access` warehouse client if missing ;  
`docs/pages/warehouses.page.md`

IMPLICIT CONFLICT: nx build kppdf-web

---

### Preflight Check Output
- **Context read:** `docs/audits/2026-09-05-warehouse-nx-port-audit.md`; legacy `WarehousesPage`; `warehouse.schema.ts`; WAVE-NX-WAREHOUSE
- **Key Constraints:** sections = Warehouse by name; hide type/zones; stub `/storage-items` `/stock-movements` for W2/W3
- **Planned Deliverable:** nav + 3 routes + warehouses CRUD thin
- **Validation Path:** FIC A; jest; nx build

**Проверено:** NX gap; BE `GET/POST/PATCH/DELETE /warehouses` exists.

---

## ЧТО ДЕЛАТЬ

### ШАГ 1 — Routes + nav
- Routes: `/warehouses`, `/storage-items`, `/stock-movements` (последние два — placeholder page «скоро» или empty shell с data-test, чтобы W2/W3 не дрались за routes).
- Nav group **Склад** (RU): Склады · Остатки · Движения. **Без** пункта «Dashboard».
- Permissions: reuse existing warehouse/inventory caps from BE seed; mirror legacy PAGE_KEYS if present.

### ШАГ 2 — data-access
- Thin `PiWarehousesService` (list/create/update/remove) если ещё нет в NX libs.

### ШАГ 3 — Warehouses page
- Список + поиск по имени; create/edit dialog: **name** (req), **isActive**, optional description.
- **Не** показывать type select / zones / address / roleIds (API: `type: 'main'`, `zoneNames: []`).
- Delete = soft confirm (как registries).
- Paper & Ink / UX-FORM; русский UI.

### ШАГ 4 — Tests + page.md
- Spec: create payload без type UI sends `type: 'main'`.
- `warehouses.page.md`: секция **NX** — route live; legacy = эталон.

## НЕ ИЗМЕНЯТЬ
Backend warehouse schema; supply; shipping; Gantt; dual-site legacy FE sync.

## КРИТЕРИИ ПРИЁМКИ
1. Nav «Склад» ведёт на три URL; `/warehouses` CRUD имя+активен.
2. Нет UI типов склада и зон.
3. `nx build kppdf-web` PASS; focused tests PASS.
4. FIC: route + PAGE_KEYS/nav updated in same PR.

### Build-integrity
Baseline build до claim; build последним перед archive.
