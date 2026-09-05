# Страница: Остатки на складе (StorageItem)

**Legacy route:** `/storage-items` remains the reference until cutover.
**NX route:** `/storage-items` is the live W2 balances page inside the operational shell.
**SoT:** `StorageItem.quantity` / `reservedQty`; stock movements remain the ledger source for balance writes.

## NX W2 implementation

| Surface | Path |
|---------|------|
| Page | `frontend-nx/apps/kppdf-web/src/app/pages/warehouse/storage-items.page.ts` |
| Put dialog | `frontend-nx/apps/kppdf-web/src/app/pages/warehouse/storage-put-on-stock-dialog.component.ts` |
| Adjust dialog | `frontend-nx/apps/kppdf-web/src/app/pages/warehouse/storage-adjust-dialog.component.ts` |
| Client | `frontend-nx/libs/data-access/src/lib/warehouse/pi-storage-items.service.ts` |
| Types/helpers | `frontend-nx/libs/data-access/src/lib/warehouse/storage-item.types.ts` |
| Route/nav | W1-owned `/storage-items` route and **Склад → Остатки** entry |

## Routes and filters

```text
/storage-items
/storage-items?materialId=<id>
/storage-items?warehouseId=<id>&materialId=<id>
```

- **Склад** — native select populated by `GET /api/warehouses`; changing it reloads `GET /api/storage-items?warehouseId=…`.
- **Материал** — `materialId` is passed to the server as a read-only deep-link prefilter. The page resolves the label through `GET /api/materials/:id`.
- **Мало остатков** — client-side filter `quantity <= minQuantity`, including equality. The page intentionally requests the unfiltered list because the current backend `lowStock` expression is strict `<`.
- The page keeps loading, retryable error, honest empty, and success states. The table has a stable wide layout with horizontal scrolling on narrow viewports.

## Table

The balances table renders these fields for every row:

1. **Продукт / Материал** — populated `productId` or `materialId`, via `storageItemName()`.
2. **Склад** — populated `warehouseId` / `warehouse`, via `storageItemWarehouseName()`.
3. **Количество** — `quantity`.
4. **Резерв** — `reservedQty`.
5. **Минимум** — `minQuantity`.
6. **Зона** — read-only `zoneName` when present.

## Write actions

### Поставить на склад

The page action opens a material selector, warehouse selector, quantity, minimum, and optional zone. It uses the existing material endpoint:

```text
POST /api/materials/:materialId/storage-items
{ warehouseId, quantity, minQuantity, zoneName? }
```

The deep-linked material is preselected; if it is outside the first catalog response, the dialog keeps a visible fallback option for that ID.

### Корректировать

Each row opens a focused adjustment dialog with a signed `delta` and required reason:

```text
POST /api/storage-items/:id/adjust
{ delta, reason }
```

The UI rejects zero changes, blank reasons, and a negative resulting quantity. On success it merges the returned `StorageItem` into the current list, so a negative adjustment immediately reduces the displayed quantity while preserving populated labels when the API response is sparse.

## API client

`PiStorageItemsService` is a thin `SilentResult` client for:

| Method | Endpoint |
|--------|----------|
| `list` | `GET /api/storage-items` with `warehouseId`, `materialId`, `productId`, optional `lowStock` |
| `createForMaterial` | `POST /api/materials/:materialId/storage-items` |
| `adjust` | `POST /api/storage-items/:id/adjust` |

The client does not add `organizationId`; scope comes from the authenticated API context.

## Verification

Focused NX W2 coverage:

- `frontend-nx/libs/data-access/src/lib/warehouse/pi-storage-items.service.spec.ts`
- `frontend-nx/apps/kppdf-web/src/app/pages/warehouse/storage-items.page.spec.ts`
- `frontend-nx/apps/kppdf-web/src/app/pages/warehouse/storage-dialogs.spec.ts`

Covered behavior includes API query/body contracts, `materialId` deep-link loading, warehouse reload, inclusive low-stock filtering, all balance columns, negative adjustment preview/API result, and put-on-stock selection.

## Legacy reference

The legacy page still documents the older `PiGroupWorkspace`/`pi-table` implementation and remains the cutover reference. NX W2 deliberately does not add an inventory dashboard, reservation writes, transfer creation, warehouse types, or zone management. Quantity is never read from `Material.stockQty` as a source of truth.

## TZ reference

| TZ | Что сделано |
|----|------------|
| TZ-115 / TZ-117 | Legacy silent HTTP and `httpResource` migrations |
| TZ-MATERIALS-308 | Material storage positions, `materialId` deep-link, envelope contract |
| **TZ-NX-WAREHOUSE-W1-SHELL** | NX warehouse route/nav shell |
| **TZ-NX-WAREHOUSE-W2-BALANCES** | **NX StorageItem balances list, filters, put-on-stock, adjust** |

---

_Обновлено: 2026-09-05 (NX W2)._
