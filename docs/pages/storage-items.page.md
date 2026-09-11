# Страница: Остатки на складе (StorageItem)

**Legacy route:** `/storage-items` remains the reference until cutover.
**NX route:** `/storage-items` is the live W2 balances page inside the operational shell.
**SoT:** `StorageItem.quantity` / `reservedQty`; stock movements remain the ledger source for balance writes.

## TOC chips (2026-09-11, `TZ-NX-WH-GROUP-CHIPS`)

`/storage-items`, `/warehouses`, and `/stock-movements` share one sticky
`app-pi-group-workspace` chip row — **Остатки | Склады | Движения**
(`WAREHOUSE_TOC_CHIPS`, `frontend-nx/apps/kppdf-web/src/app/pages/warehouse-group-chips.ts`),
same pattern as `/orders`/`/contracts`/`/proposals` (`DEALS_TOC_CHIPS`). PO
order: the balances screen operators actually work from day to day comes
first, not the warehouse registry. Top-menu **«Склад»** now opens
`/storage-items` directly (`nav-categories.ts` `entryPath`); the warehouse
`<select>` filter and `?warehouseId=`/`?materialId=` deep-links are unchanged.

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

1. **Продукт / Материал** — populated `productId` or `materialId`, via `storageItemName()`. Populate uses `includeSoftDeleted: true` so archived catalog rows still name the physical balance.
2. **Склад** — populated `warehouseId` / `warehouse`, via `storageItemWarehouseName()` (same soft-delete escape hatch).
3. **Количество** — `quantity`.
4. **Резерв** — `reservedQty`.
5. **Минимум** — `minQuantity`.
6. **Зона** — read-only `zoneName` when present.

### NX UX sweep note (2026-09-09, `TZ-NX-UX-09-storage-items-FIX`)

Rows expand-in-row on click/Enter/Space (same pattern as `/orders`, `/shipping`, `/supply`,
`/supply-requests`), revealing **Единица** (`storageItemUnit()`), **Артикул**
(`storageItemSku()`), and **Статус** (`isActive`) — none of which were visible anywhere before
this fix. The `materialId` deep-link filter now renders as a dismissible chip
(`material-filter-chip` / `material-filter-clear`), matching `/shipping`'s
`clearOrderFilter`. See `docs/audits/2026-09-09-nx-ux-storage-items-audit.md`.

## Write actions

### Поставить на склад

The page action opens a material picker, warehouse selector (native `<select>` — short list), quantity, minimum, and optional zone. It uses the existing material endpoint:

```text
POST /api/materials/:materialId/storage-items
{ warehouseId, quantity, minQuantity, zoneName? }
```

The deep-linked material (`materialId`/`materialName`) is preselected as a chip on open.

**Material typeahead + create (2026-09-11, `TZ-NX-WH-PUT-MATERIAL-TYPEAHEAD`):** the material field
is no longer a full-catalog `<select>` (previously a flat list of every material, no search). It is
now the same gold pattern as `supply-request-form-dialog.component.ts`'s material picker: a search
input (`PiMaterialsService.list({ search, limit: 10 })`, debounced 300ms, min 2 chars) returning
name/article matches to pick from, plus an accent-styled Lucide `Plus` icon button
(`pi-registry-create-button`, `dataTest="put-material-create"`, same component the registries
toolbar uses for its own create action — no new colors outside the Paper & Ink accent tokens)
that opens the shared `MaterialFormDialogComponent` in `create` mode; the newly-created material is
auto-selected on close. Once a material is chosen (found or newly created) it renders as a chip
with a **Очистить** button to search again — never both a search box and a stale selection at once.

Files: `storage-put-on-stock-dialog.component.ts`; icon button reused from
`../registries/registry-create-button.component.ts` (gained an optional `dataTest` input so this
dialog's own `data-test` naming doesn't collide with the registries toolbar's `registry-create`).

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

## Inventory count → opening balance (2026-09-11, `TZ-NX-WH-INV-DOCS`)

PO decision: qty only — no kg→pcs conversion anywhere on the write path (catalog
`weightKg` stays a passport field, never a stock-input mode). Entity routing for
a physical count line:

| Физика | Складская сущность | Каталог |
|--------|--------------------|---------|
| Метиз (болт, гайка…) | `StorageItem.materialId` | `Material` с `materialKind: 'fastener'` |
| Деталь / покупное / сырьё | `StorageItem.materialId` | `Material` (`part` / `purchased` / `raw`) |
| Готовое изделие (ГП) | `StorageItem.productId` | `Product` |
| Модуль сборки | **не складируется** | `ProductModule` — только BOM, никогда `StorageItem` |

An opening/inventory balance is **always** a `StockMovement` write (`type: 'in'`,
or `adjust` for a correction) — never a bare `StorageItem` quantity write and
never `Material.stockQty` / `Product.stockQty` (deprecated, unread by any live
write path). Bulk Excel import of a physical count (`WAVE-NX-WAREHOUSE-INVENTORY-IMPORT`)
batches the same atomic `in` write per row server-side — it is not a second
write-path, just many calls to the one that already exists.

**Desktop Excel (2026-09-11, `TZ-NX-WH-INV-DESKTOP-EXCEL`):** operator flow —
Desktop app → Формы → «Склад» → «Инвентаризация (остатки)» → скачать шаблон
(артикул/SKU, кол-во, склад, документ) → заполнить → загрузить обратно →
подтвердить. Отправка — **один batch-запрос** на весь блок
(`POST /api/stock-movements/batch-in`, `TZ-NX-WH-INV-BE-BATCH`), не построчно;
известные строки уходят в приход, неизвестные — в отчёт отклонений с текстом
ошибки от сервера. `desktop/src/core/import-targets.ts` (`inventory` target),
`multi-import.ts` (`validateInventoryRows` — qty only, no weight, no catalog
dedupe: repeat counts are legitimate additional IN movements), `excel-form-template.ts`
(Form Studio allowlist entry, category «Склад»).

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
