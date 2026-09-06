# WAVE-NX-SUPPLY-OPS — журнал закупок вместо Google Sheets

**Audit:** `docs/audits/2026-09-06-supply-google-sheets-to-nx-audit.md`  
**Predecessor:** WAVE-NX-SUPPLY S0–S2 DONE (`WAVE-NX-SUPPLY.md`)  
**Статус:** PARK / READY to schedule after Freebuff DocStudio waves  
**PROMPT:** (создать при старте) `tasks/PROMPT-FREEBUFF-NX-SUPPLY-OPS.md`

| # | SIZE | TZ | Path | Status |
|---|------|-----|------|--------|
| 1 | L | S3 Request journal UX | `tasks/_backlog/nx-supply/TZ-NX-SUPPLY-S3-REQUEST-JOURNAL.md` | DRAFT — PO decisions locked 2026-09-06 |
| 2 | S | BE invoice + paid + delivery + createdBy | `tasks/_backlog/nx-supply/TZ-SUPPLY-BE-INVOICE-DELIVERY.md` | DRAFT |
| 3 | L | Received confirm → stock (+ default warehouse) | `tasks/_backlog/nx-supply/TZ-NX-SUPPLY-S4-RECEIVE-TO-STOCK.md` | DRAFT |
| 4 | L | Material upsert + **copy material** | `tasks/_backlog/nx-supply/TZ-NX-SUPPLY-S5-MATERIAL-UPSERT.md` | DRAFT |
| 5a | S | Excel path A: name-resolve supply rows | `tasks/_backlog/nx-supply/TZ-DESKTOP-SUPPLY-EXCEL-SHEETS.md` | DRAFT |
| 5b | L | Excel path B: multi-sheet + data validation | `tasks/_backlog/nx-supply/TZ-DESKTOP-SUPPLY-EXCEL-PACK.md` | DRAFT (after 5a) |
| 6 | S | Chrome / Order↔text заказчик | `tasks/_backlog/nx-supply/TZ-NX-SUPPLY-S6-CHROME.md` | DRAFT |
| 7 | S | Warehouse `isDefault` flag | `tasks/_backlog/nx-supply/TZ-NX-WAREHOUSE-DEFAULT.md` | DRAFT (∥ S4) |

**PO lock:** receive=confirm+warehouse; paid=flag; order=dropdown\|text; material=supply access+copy; createdBy on request.  
**Excel:** сначала A (справочники→заявки с match), потом B (xlsx листы+выпадающие).

**Не в волне:** Purchase*/Tender; wipe Google; Excel во всех registries; второй склад.
