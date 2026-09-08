# Audit: NX Shipping / Отгрузка port (2026-09-08)

### Preflight Check Output
- **Context read:** `docs/pages/shipping.page.md`; NX `order-hub-tray.component.ts`; legacy `shipping.page.ts` + `shipments.service.ts`; `shipment.controller.ts`; `DOMAIN-MAP.md`; `WAVE-NX-WAREHOUSE.md` DONE; `WAVE-NX-SUPPLY.md` DONE
- **Key Constraints:** BE live; NX 0% page; hub dead link `/shipping`; ship-without-doc = PO canon; no `/desk` this wave
- **Planned Deliverable:** WAVE-NX-SHIPPING S0–S3 + Claude PROMPT
- **Validation Path:** FIC §A; `nx build kppdf-web`; focused Jest

## Facts
| Layer | Status |
|-------|--------|
| BE `Shipment` + `POST /orders/:id/ship` + dispatch/cancel | **live** |
| Legacy `/shipping` registry | **READY** (~920 LOC) |
| NX route `/shipping` | **absent** |
| NX hub Отгрузка | stub + **dead** `routerLink="/shipping"` |
| NX `PiShipmentsService` / `Orders.ship()` | **absent** |

## Necessity (§2)
Operator on NX closes ERP loop Orders→Supply→Production→Warehouse→**Shipping**. Dead link = тупик. Catalog polish / desk — later.

## WAVE split
S0 data-access → S1 registry+route → S2 hub READ → S3 hub ship-without-doc.  
Defer: `/desk`, cancel from hub (S1 has cancel on registry), Excel, legacy delete.
