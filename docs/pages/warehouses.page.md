# Страница: Склады — NX Warehouse registry

**NX route:** `/warehouses` — live W1 route inside the operational NX shell.
**Legacy route:** `/warehouses` remains the reference until cutover.
**Scope:** named warehouse sections such as «Металл» and «Метизы», not a warehouse-type or zone editor.

## TOC chips (2026-09-11, `TZ-NX-WH-GROUP-CHIPS`)

Same shared `WAREHOUSE_TOC_CHIPS` row as `/storage-items` and `/stock-movements`
— see `storage-items.page.md` §«TOC chips» for the full note. Top-menu
**«Склад»** now enters on `/storage-items`, not this registry page.

## NX W1 surface

- List and client-side search by name.
- Create/edit: **Название** (required), **Описание** (optional), **Активен**.
- Delete uses Paper & Ink destructive confirmation and the existing soft-delete API.
- API payload fixes `type: 'main'` and `zoneNames: []`; type, zones, address, and role fields are not shown.
- Route capability: `warehouse:read`; write actions follow the existing backend role policy.
- Related routes: `/storage-items` (W2 live balances) and `/stock-movements` (W3 live журнал + in/out).
- **TZ-NX-HUB-04 (2026-09-10) — hub parity, финал `WAVE-NX-HUB-TABLE-PARITY`:** ▸/▾ single-expand chevron column + denser rows (`py-2`) + expanded accent (`bg-paper-2`/`border-l-gold-deep`, mirrors 01–03). Row actions — icon-only: `app-pi-row-actions` (edit/delete) плюс отдельная `★` `pi-icon-btn` («Сделать складом по умолчанию»), показывается только когда `!row.isDefault`; никаких широких текстовых кнопок. Expand показывает preview остатков склада (`PiStorageItemsService.list({ warehouseId })`, ≤8 строк, честные loading/empty/error) через `storageItemName()` (никогда сырой ObjectId) + chip `.pi-outline-btn` «Все остатки склада» → `/storage-items?warehouseId=<id>` (deep-link уже канон из W2).
- **TZ-NX-HUB-06 (2026-09-10):** expand перестроен под gold card-язык `counterparty-hub-tray` (PO: `/supply`/`/warehouses` expand читались «простынёй», не карточками). Обёртка `bg-paper-2 border-t hairline` → `grid md:grid-cols-2 gap-4 p-4` → 2 карточки `section.hairline.rounded-sm.bg-paper.p-4` + `h3`: **О складе** (название/описание/статус) · **Остатки** (тот же preview/empty/error/chip, что и раньше — только перенесён внутрь карточки). Данные/логика не менялись. Audit: `docs/audits/2026-09-10-nx-hub-expand-cards.md`.

## NX implementation

| Surface | Path |
|---------|------|
| Page | `frontend-nx/apps/kppdf-web/src/app/pages/warehouse/warehouses.page.ts` |
| Dialog | `frontend-nx/apps/kppdf-web/src/app/pages/warehouse/warehouse-form-dialog.component.ts` |
| Client | `frontend-nx/libs/data-access/src/lib/warehouse/pi-warehouses.service.ts` |
| Nav/routes | `frontend-nx/apps/kppdf-web/src/app/layout/nav-categories.ts`; `frontend-nx/apps/kppdf-web/src/app/app.routes.ts` |

## API contract

| Метод | Endpoint | Назначение |
|-------|----------|-----------|
| GET | `/api/warehouses` | Список складов |
| POST | `/api/warehouses` | Создать склад; NX sends `type: main`, `zoneNames: []` |
| PATCH | `/api/warehouses/:id` | Обновить склад |
| DELETE | `/api/warehouses/:id` | Мягко удалить склад |

## Legacy reference

The former legacy screen exposed additional classification fields. Those remain documented by its implementation but are deliberately out of the NX W1 form:

- legacy `type` values: `main`, `production`, `branch`, `transit`, `other`;
- legacy address, zones, and role access fields;
- client-side list and destructive delete confirmation.

Quantity SoT is not part of this page: it remains `StorageItem` / stock movements for W2–W3.

## TZ reference

| TZ | Что сделано |
|----|------------|
| **TZ-NX-WAREHOUSE-W1-SHELL** | **NX route + nav «Склад» (Склады · Остатки · Движения) + thin named-warehouse CRUD** |
| Warehouse pack B | Legacy registry CRUD reference |
| **TZ-WAREHOUSE-UX-301** | Legacy type default/hint; not exposed in NX W1 |
| **TZ-NX-WAREHOUSE-DEFAULT** | `isDefault` flag — exactly one true at a time (`WarehouseService.setDefault`/`findDefault`, atomic unset-others); form checkbox + list badge/quick-action «Сделать по умолчанию»; used by S4 receive→stock to resolve the confirm-dialog warehouse |
| **TZ-NX-UX-08-warehouses-FIX** | `pi-button`/`pi-button-primary`/`pi-button-secondary`/`pi-button-outline` — **не существующие CSS-классы** (нигде не определены, проверено по всем stylesheet + tailwind config + git history) — все кнопки на `warehouses.page.ts` и `warehouse-form-dialog.component.ts` рендерились без стиля Paper & Ink. Заменены на реальный `<app-pi-button variant="...">`. **Та же ошибка в ещё 17 файлах по всему приложению** (включая `/orders`, `/shipping`, `/supply`, `/supply-requests` — уже DONE в этой волне) — вне рамок этого TZ, см. `docs/audits/2026-09-09-nx-ux-warehouses-audit.md` §Cross-cutting finding, требует отдельного решения PO |
| **TZ-NX-HUB-04** | Hub expand (остатки preview + deep-link chip) + icon row actions (`app-pi-row-actions` + отдельная `★` default-toggle). `WAVE-NX-HUB-TABLE-PARITY` #04 — DONE, финал волны |
| **TZ-NX-HUB-06** | Expand → 2 категорийные карточки (gold `counterparty-hub-tray` markup), заменили плоский текст/список. `WAVE-NX-SHELL-HUB-POLISH` #02 — DONE |

---

_Обновлено: 2026-09-07 (TZ-NX-WAREHOUSE-DEFAULT). Legacy details retained as cutover reference._
