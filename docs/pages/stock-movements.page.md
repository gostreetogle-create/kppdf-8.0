# Страница: Движения на складе (StockMovement)

**Legacy route:** `/stock-movements` remains the reference until cutover.
**NX route:** `/stock-movements` is the live W3 movement journal inside the operational shell.
**SoT:** stock movements are the atomic ledger write path; balances remain `StorageItem.quantity`.

## NX W3 implementation

| Surface | Path |
|---------|------|
| Journal page | `frontend-nx/apps/kppdf-web/src/app/pages/warehouse/stock-movements.page.ts` |
| In/out dialog | `frontend-nx/apps/kppdf-web/src/app/pages/warehouse/stock-movement-form-dialog.component.ts` |
| Client | `frontend-nx/libs/data-access/src/lib/warehouse/pi-stock-movements.service.ts` |
| Types/helpers | `frontend-nx/libs/data-access/src/lib/warehouse/stock-movement.types.ts` |
| Route/nav | W1-owned `/stock-movements` route and **Склад → Движения** entry |

## Routes and filters

```text
/stock-movements
/stock-movements?type=in&warehouseId=<id>
```

- **Тип** — read-only filter for `in`, `out`, `adjust`, and `transfer`; the page reflects it in `type` query state and passes it to `GET /api/stock-movements`.
- **Склад** — native select from `GET /api/warehouses`; changing it preserves the active type and reloads the journal with `warehouseId`.
- Transfer records can be inspected through the type filter, but the W3 UI has no transfer-create action.

## Journal table

The NX table renders:

1. **Дата** — `date`, formatted as `DD.MM.YYYY` for Russian locale.
2. **Тип** — `Приход`, `Расход`, `Корректировка`, or `Перемещение`.
3. **Материал / продукт** — populated material/product reference.
4. **Склад** — populated warehouse reference.
5. **Количество** — positive `qty`.
6. **Документ / заказ** — `documentRef`, falling back to `orderId`.

The list consumes the canonical envelope `{ items, total }` and preserves loading, empty, and retryable error states.

## Create actions

The page exposes only **+ Приход** and **+ Расход**. Both open the same focused dialog and use the existing atomic endpoint:

```text
POST /api/stock-movements
{
  type: "in" | "out",
  warehouseId,
  qty,
  materialId XOR productId,
  zoneName?,
  documentRef?,
  orderId?
}
```

- The dialog provides active warehouse, material/product target kind, positive quantity, warehouse zone when configured, a **Примечание** field mapped to backend `documentRef`, and a separate optional `ID заказа` field.
- Exactly one of `materialId` or `productId` is sent. Zero/negative quantity and missing target are rejected locally.
- On success the dialog closes and the journal reloads. On API failure it remains open and shows the normalized error.
- No transfer creation, supply receive auto-wire, reservation write, or ledger implementation is added.

## API client

`PiStockMovementsService` is a thin `SilentResult` client for:

| Method | Endpoint |
|--------|----------|
| `list` | `GET /api/stock-movements` with `type`, `warehouseId`, `materialId`, `productId`, `from`, `to` |
| `create` | `POST /api/stock-movements` for `in` / `out` payloads |

## Verification

Focused NX W3 coverage:

- `frontend-nx/libs/data-access/src/lib/warehouse/pi-stock-movements.service.spec.ts`
- `frontend-nx/apps/kppdf-web/src/app/pages/warehouse/stock-movements.page.spec.ts`
- `frontend-nx/apps/kppdf-web/src/app/pages/warehouse/stock-movement-form-dialog.component.spec.ts`

The tests cover envelope/query parameters, material and product XOR POST bodies, note-to-`documentRef` mapping, separate `orderId`, journal columns, query navigation, in/out-only actions, local validation, and API error retention.

## Legacy reference

The legacy inventory page remains the cutover reference. NX W3 deliberately does not expose transfer creation or modify backend ledger logic; the backend Z-001 transaction remains the source of atomic stock updates.

## TZ reference

| TZ | What remains true |
|----|-------------------|
| TZ-115 / TZ-117 | Legacy silent HTTP and `httpResource` migrations |
| **TZ-NX-WAREHOUSE-W1-SHELL** | NX warehouse route/nav shell |
| **TZ-NX-WAREHOUSE-W2-BALANCES** | NX StorageItem balances page and quantity adjustment |
| **TZ-NX-WAREHOUSE-W3-MOVEMENTS** | **NX movement journal plus in/out creation** |

---

_Обновлено: 2026-09-05 (NX W3)._