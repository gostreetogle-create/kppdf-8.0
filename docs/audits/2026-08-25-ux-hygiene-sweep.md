# UX hygiene sweep — 2026-08-25

> Cursor Mode A audit (agents + MCP Claude + code verify). **Не** «всё ок».
> Исполнение: волна `TZ-DESK-440` · `TZ-SHIP-440` · `TZ-UX-440` (Freebuff).

### Preflight Check Output
- **Context read:** `docs/PO-CANON.md`, `docs/UX-FORM-CANON.md`, `docs/CONTEXT.md`, `docs/COUPLING-MAP.md`, `docs/TZ-AUTHORING.md`, `docs/FEATURE-INTEGRATION-CHECKLIST.md`, `docs/agent-checklists/_NOW.md`, `tasks/QUEUE-LIVE.md`
- **Key Constraints:** Mode A (no product patches) | UX-FORM / Paper & Ink | COUPLING-MAP ship semantics
- **Planned Deliverable:** 3 LIVE TZ + backlog defer list + QUEUE-LIVE
- **Validation Path:** FIC N/A (no new page) · executor gates в TZ

## P0 — demo-shame (verified file:line)

| # | Evidence | Smell |
|---|----------|--------|
| 1 | `order-hub-tray.component.ts` `PRIMARY_CTA_LABELS` + `primaryCtaDisabledReason` ~831–838 | CTA «В производство» / «К отгрузке» / «Отгрузить» → hint «подключится позже»; работает только draft→confirmed |
| 2 | same · ready + `desk-ship-button` «Отгружено» | Два «отгрузить»-смысла: мёртвый gold CTA + живой «Отгружено» |
| 3 | `shipping.page.ts` ~157–164, ~319 | Склад = free-text «ID склада для dispatch» (ObjectId paste) |
| 4 | `people.page.ts:218`, `users-admin.page.ts:187`, `user-form-dialog:88`, `supply-quick-order:550` | EN «Email» / «Email org» в RU UI |
| 5 | `proposal-workspace.page.ts:661` | Dirty fields: `catalogDirtyFields.join` → `productName, unit` вместо RU |

## P1 — operator friction (verified / agent)

| # | Evidence | Smell |
|---|----------|--------|
| 6 | `form-field.component.ts:51–55` | Error mounts under control → layout thrash (UX-FORM-CANON) — **defer** shared risk |
| 7 | `pairing-dialog.component.ts:96` | Placeholder `Office PC` |
| 8 | tray copy `siteId` in user-facing hints | API field name на экране |
| 9 | tray / desk chrome buttons | часть CTA без `pi-focus-ring` |
| 10 | `canMarkShipped`: любой non-terminal | Спека DESK-430 намеренно широкая — **не ломать** в 440 без PO |

## BE structural (defer → Z / backlog, не эта волна)

- `Order.status` drift vs Combine `boardLane` rollup
- `Material.stockQty` / `Product.stockQty` fake SoT vs `StorageItem`
- `Reservation.orderId` = `Order.number`, не ObjectId
- Invalid filter ids → silent `[]`
- Shipment create DTO allows terminal statuses

## Wave (disjoint CONFLICT KEYS)

1. **TZ-DESK-440** — honest tray CTA  
2. **TZ-SHIP-440** — warehouse `<select>` via `WarehousesService`  
3. **TZ-UX-440** — RU labels + KP dirty RU chips  

Defer files: `tasks/_backlog/ux-hygiene/`
