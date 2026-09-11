# NOW

updated_at: 2026-09-11T09:05:00Z

## ACTIVE / LIVE

- **Freebuff:** PARK
- **Claude:** IN PROGRESS — `tasks/PROMPT-CLAUDE-WAREHOUSE-INVENTORY-IMPORT.md` — 01/3, 02/3 DONE, continuing 03/3 (Desktop Excel).
- **Deploy stamp:** READY

## NEXT

1) Warehouse inventory import — 03 Desktop Excel pack, then WAVE COMPLETE
2) After: `TZ-OPS-CLAUDE-UNATTENDED-HIDDEN-TASK` (flashing console)

## DONE

- Warehouse inventory import 02/3 (`TZ-NX-WH-INV-BE-BATCH`): `POST /api/stock-movements/batch-in` — resolves article/sku → Material|Product + warehouseId/Name/default, writes each row through the existing `create({type:'in'})` (one Z-001 transaction per row, partial success + errors[] by design). First test coverage ever for `StockMovementService` (14 new tests).
- Warehouse inventory import 01/3 (`TZ-NX-WH-INV-DOCS`): entity matrix (метиз/деталь/сырьё→Material, ГП→Product, модуль не складируется) + opening balance = `StockMovement in`/`adjust` canon in `CONTEXT.md`/`storage-items.page.md`/`stock-movements.page.md`
- WAVE-NX-TEXT-LIBRARY-HIERARCHY COMPLETE — `3d595949` / `09ce562a` / `8cfbf69a`
- Studio console hygiene 01–04 earlier

## PARK

- Deploy · G12 · desk · wipe · `/production` SKIP · live TextBlock BlockSource · weight→qty (отклонено PO)
