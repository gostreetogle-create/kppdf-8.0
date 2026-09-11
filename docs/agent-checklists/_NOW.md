# NOW

updated_at: 2026-09-11T09:35:00Z

## ACTIVE / LIVE

- **Freebuff:** PARK
- **Claude:** IDLE — `WAVE-NX-WAREHOUSE-INVENTORY-IMPORT` 01/02/03 ALL DONE, `_active` пуст. `TZ-OPS-CLAUDE-UNATTENDED-HIDDEN-TASK` (flashing console) в очереди — не в текущем PROMPT, не трогал.
- **Deploy stamp:** READY

## NEXT

Свободный слот. Кандидат в очереди: `TZ-OPS-CLAUDE-UNATTENDED-HIDDEN-TASK` (flashing console).

## DONE

- Warehouse inventory import WAVE COMPLETE (2026-09-11): 01 docs canon, 02 BE batch-in endpoint, 03 Desktop Excel target (`inventory`) + Form Studio template + one-batch `sendBlocks()` wiring. Audit closeout: `docs/audits/2026-09-11-warehouse-inventory-import-readiness.md` §9
- Warehouse inventory import 02/3 (`TZ-NX-WH-INV-BE-BATCH`): `POST /api/stock-movements/batch-in` — resolves article/sku → Material|Product + warehouseId/Name/default, writes each row through the existing `create({type:'in'})` (one Z-001 transaction per row, partial success + errors[] by design). First test coverage ever for `StockMovementService` (14 new tests).
- Warehouse inventory import 01/3 (`TZ-NX-WH-INV-DOCS`): entity matrix (метиз/деталь/сырьё→Material, ГП→Product, модуль не складируется) + opening balance = `StockMovement in`/`adjust` canon in `CONTEXT.md`/`storage-items.page.md`/`stock-movements.page.md`
- WAVE-NX-TEXT-LIBRARY-HIERARCHY COMPLETE — `3d595949` / `09ce562a` / `8cfbf69a`
- Studio console hygiene 01–04 earlier

## PARK

- Deploy · G12 · desk · wipe · `/production` SKIP · live TextBlock BlockSource · weight→qty (отклонено PO)
