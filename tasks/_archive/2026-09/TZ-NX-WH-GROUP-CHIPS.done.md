# TZ-NX-WH-GROUP-CHIPS: TOC чипы Склад (Остатки · Склады · Движения)

**РОЛЬ АГЕНТА:** Executor (frontend-nx) — claude  
**ЗАВИСИМОСТИ:** нет  
**LAYER:** 3 · **SIZE:** S–M  
**PAGES:** `/storage-items` ; `/warehouses` ; `/stock-movements`  
**PAGE_DOCS:** `storage-items.page.md` ; `warehouses.page.md` ; `stock-movements.page.md` ; `page-chrome.md`

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/pages/warehouse-group-chips.ts` (create) ;  
`frontend-nx/apps/kppdf-web/src/app/pages/warehouse/warehouses.page.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/warehouse/storage-items.page.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/warehouse/stock-movements.page.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/layout/nav-categories.ts` ;  
`docs/pages/page-chrome.md` ;  
`docs/pages/storage-items.page.md` ;  
`docs/pages/warehouses.page.md` ;  
`docs/pages/stock-movements.page.md` ;  
`docs/agent-checklists/_NOW.md`

IMPLICIT CONFLICT: nx build kppdf-web

### Preflight Check Output
- **Context read:** скрин/слова PO; `page-chrome.md` («Склад → inventory group-workspace»); `warehouses.page.ts` / `storage-items.page.ts` — только `eyebrow «Склад»` + H1, **нет** `app-pi-group-workspace`; gold `deals-group-chips.ts` + `admin-roles.page.ts`; `nav-categories.ts` entryPath `/warehouses`
- **Key Constraints:** чипы как у Сделок/Админ; порядок PO: **Остатки → Склады → Движения**; фильтр склада на `/storage-items` оставить; не ломать hub expand / batch inventory
- **Planned Deliverable:** shared `WAREHOUSE_TOC_CHIPS` + wrap 3 pages; entryPath → `/storage-items`
- **Validation Path:** FIC A (nav entry) + nx build last; visual parity chips

**Проверено:** топ-меню «Склад» уже ведёт на склады первыми — PO хочет сразу рабочий контур остатков + переключение чипами.

---

## ИСХОДНОЕ

1. Клик «Склад» → `/warehouses` → expand → chip «Все остатки» → `/storage-items?warehouseId=`.
2. На остатках уже есть `<select>` складов — ок, оставить.
3. `page-chrome.md` обещает group-workspace для склада — **не реализовано**.

## ЧТО ДЕЛАТЬ

1. Создать `frontend-nx/.../pages/warehouse-group-chips.ts`:
   ```ts
   // Порядок PO: сначала Остатки
   { id: 'storage-items', label: 'Остатки', route: '/storage-items', pageKey: 'storage-items' },
   { id: 'warehouses', label: 'Склады', route: '/warehouses', pageKey: 'inventory' },
   { id: 'stock-movements', label: 'Движения', route: '/stock-movements', pageKey: 'stock-movements' },
   ```
2. Обернуть три страницы в `<app-pi-group-workspace [toc]="WAREHOUSE_TOC_CHIPS" tocActiveId="…" [chips]="[]" activeId="">` (как admin-roles / deals). Убрать дублирующий plain `eyebrow «Склад»`, если workspace уже показывает раздел (сверить с gold — не плодить «Склад / Склад»).
3. H1 страницы оставить смысловой («Остатки» / «Склады» / «Движения») **или** sr-only если gold chips-only — следовать эталону deals/orders на NX (у admin H1 внутри tools/content). Цель: чипы sticky сверху, контент без второго «хлебного» самопала.
4. `nav-categories.ts`: `entryPath: '/storage-items'` (клик «Склад» → сразу остатки). Пункты children labels уже есть — согласовать порядок с чипами если UI их показывает.
5. Deep-link `/storage-items?warehouseId=` с warehouses expand — **не ломать**.
6. page.md + page-chrome note: NX склад = group chips. Focused specs если есть chrome assertions.
7. `nx build kppdf-web` last.

## НЕ

- Менять ledger / batch-in / Desktop inventory
- Склеивать три route в один
- Убирать warehouse `<select>` на остатках
- Redesign tables / hub expand cards

## AC

1. На `/storage-items`, `/warehouses`, `/stock-movements` видна одна sticky chip-row: **Остатки | Склады | Движения**; активный chip = текущий route.
2. Клик чипа переключает страницу без «сначала склады → кнопка остатки».
3. Топ-меню «Склад» открывает `/storage-items`.
4. Фильтр склада на остатках работает; `?warehouseId=` deep-link жив.
5. Визуально как deals/admin TOC chips (Paper & Ink), не самодельные underline-кнопки.
6. Gates: tsc/test/lint + **nx build kppdf-web** PASS.

## BUILD INTEGRITY

`docs/TZ-NX-BUILD-INTEGRITY.md` §5.

---

**ARCHIVE_MARKER:** DONE 2026-09-11T12:05:00Z — see docs/agent-checklists/TZ-NX-WH-GROUP-CHIPS.md for SHA
