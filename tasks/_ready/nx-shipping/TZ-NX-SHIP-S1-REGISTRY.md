# TZ-NX-SHIP-S1-REGISTRY: NX `/shipping` реестр

**РОЛЬ АГЕНТА:** Executor (frontend-nx) — claude  
**ЗАВИСИМОСТИ:** TZ-NX-SHIP-S0-DATA-ACCESS DONE  
**LAYER:** 3 · **SIZE:** L  
**PAGES:** `/shipping`  
**PAGE_DOCS:** `docs/pages/shipping.page.md`

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/app.routes.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/layout/nav-categories.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/shipping/**` (create) ;  
`docs/pages/shipping.page.md` ; `docs/DOMAIN-MAP.md` ; `docs/pages/PAGE-TZ-INDEX.md`

IMPLICIT CONFLICT: nx build kppdf-web

### Preflight Check Output
- **Context read:** legacy shipping.page + page.md; NX supply/storage-items page patterns; nav warehouse/supply groups; FIC §A
- **Key Constraints:** warehouse picker from `PiWarehousesService` (not ObjectId); pageKey `shipping` (seed exists); RU UI
- **Planned Deliverable:** live registry route + nav + NX notes in page.md
- **Validation Path:** FIC A; jest; nx build

---

## ЧТО ДЕЛАТЬ

### ШАГ 1 — Route + nav
- Route `/shipping`, `pageKey: 'shipping'`, capabilityGuard mirroring legacy (PAGE_KEYS already seeded).
- Nav: group **Логистика** or пункт «Отгрузка» рядом со Склад/Снабжение — reuse existing IA; label RU «Отгрузка». Fix dead wildcard: route must exist before S2.

### ШАГ 2 — Page (port essential, NX density)
Port from legacy (not pixel-clone):
- List `GET /shipments` + filters status / order; `?orderId=` deep-link chip + clear.
- Create: order → warehouse select (`GET /warehouses`) → whole/partial qty → `PiOrdersService.ship`.
- Row: dispatch (`draft`/`scheduled`); cancel-shipment confirm (TZ-SHIP-433); edit meta; add-doc; delivered (`in_transit`).
- Empty/error/loading states; Paper & Ink / UX-FORM.

### ШАГ 3 — Docs + FIC
- `shipping.page.md` § NX live; DOMAIN-MAP Sales NX + `/shipping`; PAGE-TZ-INDEX; WAVE status S1.

## НЕ ИЗМЕНЯТЬ
Backend; hub tray (S2/S3); `/desk`; legacy frontend sync; Gantt.

## КРИТЕРИИ ПРИЁМКИ
1. `/shipping` loads list from API; create+dispatch+cancel work via HTTP.
2. Warehouse = registry select only (TZ-SHIP-440).
3. Nav opens page; no 404 from `/shipping`.
4. Focused page specs + `nx build kppdf-web` PASS.
