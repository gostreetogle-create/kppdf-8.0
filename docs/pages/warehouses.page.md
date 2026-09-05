# Страница: Склады — NX Warehouse registry

**NX route:** `/warehouses` — live W1 route inside the operational NX shell.
**Legacy route:** `/warehouses` remains the reference until cutover.
**Scope:** named warehouse sections such as «Металл» and «Метизы», not a warehouse-type or zone editor.

## NX W1 surface

- List and client-side search by name.
- Create/edit: **Название** (required), **Описание** (optional), **Активен**.
- Delete uses Paper & Ink destructive confirmation and the existing soft-delete API.
- API payload fixes `type: 'main'` and `zoneNames: []`; type, zones, address, and role fields are not shown.
- Route capability: `warehouse:read`; write actions follow the existing backend role policy.
- Related routes: `/storage-items` (W2 placeholder) and `/stock-movements` (W3 placeholder).

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

---

_Обновлено: 2026-09-05 (TZ-NX-WAREHOUSE-W1-SHELL). Legacy details retained as cutover reference._
