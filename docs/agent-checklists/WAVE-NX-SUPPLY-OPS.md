# WAVE-NX-SUPPLY-OPS — журнал закупок вместо Google Sheets

**Audit:** `docs/audits/2026-09-06-supply-google-sheets-to-nx-audit.md`  
**Predecessor:** WAVE-NX-SUPPLY S0–S2 DONE  
**Статус:** READY — Claude-only (`tasks/PROMPT-CLAUDE-NX-SUPPLY-OPS.md`) после Photos P3  
**Исполнитель:** `agent_id: claude` (Freebuff PARK)

| # | SIZE | TZ | Path | Status |
|---|------|-----|------|--------|
| 1 | S | BE invoice + paid + delivery + createdBy | `tasks/_ready/nx-supply/TZ-SUPPLY-BE-INVOICE-DELIVERY.md` | **DONE** — см. `tasks/_archive/2026-09/TZ-SUPPLY-BE-INVOICE-DELIVERY.done.md` |
| 2 | S | Warehouse `isDefault` | `tasks/_ready/nx-supply/TZ-NX-WAREHOUSE-DEFAULT.md` | **DONE** — см. `tasks/_archive/2026-09/TZ-NX-WAREHOUSE-DEFAULT.done.md` |
| 3 | L | S3 Request journal UX | `tasks/_ready/nx-supply/TZ-NX-SUPPLY-S3-REQUEST-JOURNAL.md` | READY |
| 4 | L | S4 Received → stock IN | `tasks/_ready/nx-supply/TZ-NX-SUPPLY-S4-RECEIVE-TO-STOCK.md` | READY |
| 5 | L | S5 Material upsert + copy | `tasks/_ready/nx-supply/TZ-NX-SUPPLY-S5-MATERIAL-UPSERT.md` | READY |
| 6 | S | Excel path A | `tasks/_ready/nx-supply/TZ-DESKTOP-SUPPLY-EXCEL-A.md` | READY |
| 7 | S | S6 Chrome filters/links | `tasks/_ready/nx-supply/TZ-NX-SUPPLY-S6-CHROME.md` | READY |
| — | L | Excel path B multi-sheet | backlog later | PARK |

**PO lock:** receive=confirm+warehouse(default); paid=flag; order=Order\|orderLabel; material=supply+copy; createdBy.  
**Не в волне:** Purchase*/Tender; wipe Google; Excel B day-1; второй склад-тип.
