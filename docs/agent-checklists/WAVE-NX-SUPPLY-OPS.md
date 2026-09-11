# WAVE-NX-SUPPLY-OPS — журнал закупок вместо Google Sheets

**Audit:** `docs/audits/2026-09-06-supply-google-sheets-to-nx-audit.md`  
**Predecessor:** WAVE-NX-SUPPLY S0–S2 DONE  
**Статус:** **DONE** (8/8, вкл. Excel B) — Claude-only (`tasks/_archive/2026-09/prompts-spent/PROMPT-CLAUDE-NX-SUPPLY-OPS.md` + `tasks/_archive/2026-09/prompts-spent/PROMPT-CLAUDE-SUPPLY-EXCEL-B.md`), см. `tasks/_archive/2026-09/TZ-NX-SUPPLY-S6-CHROME.done.md` §итог и `tasks/_archive/2026-09/TZ-DESKTOP-SUPPLY-EXCEL-B.done.md`  
**Исполнитель:** `agent_id: claude` (Freebuff PARK)

| # | SIZE | TZ | Path | Status |
|---|------|-----|------|--------|
| 1 | S | BE invoice + paid + delivery + createdBy | `tasks/_ready/nx-supply/TZ-SUPPLY-BE-INVOICE-DELIVERY.md` | **DONE** — см. `tasks/_archive/2026-09/TZ-SUPPLY-BE-INVOICE-DELIVERY.done.md` |
| 2 | S | Warehouse `isDefault` | `tasks/_ready/nx-supply/TZ-NX-WAREHOUSE-DEFAULT.md` | **DONE** — см. `tasks/_archive/2026-09/TZ-NX-WAREHOUSE-DEFAULT.done.md` |
| 3 | L | S3 Request journal UX | `tasks/_ready/nx-supply/TZ-NX-SUPPLY-S3-REQUEST-JOURNAL.md` | **DONE** — см. `tasks/_archive/2026-09/TZ-NX-SUPPLY-S3-REQUEST-JOURNAL.done.md` |
| 4 | L | S4 Received → stock IN | `tasks/_ready/nx-supply/TZ-NX-SUPPLY-S4-RECEIVE-TO-STOCK.md` | **DONE** — см. `tasks/_archive/2026-09/TZ-NX-SUPPLY-S4-RECEIVE-TO-STOCK.done.md` |
| 5 | L | S5 Material upsert + copy | `tasks/_ready/nx-supply/TZ-NX-SUPPLY-S5-MATERIAL-UPSERT.md` | **DONE** — см. `tasks/_archive/2026-09/TZ-NX-SUPPLY-S5-MATERIAL-UPSERT.done.md` |
| 6 | S | Excel path A | `tasks/_ready/nx-supply/TZ-DESKTOP-SUPPLY-EXCEL-A.md` | **DONE** — см. `tasks/_archive/2026-09/TZ-DESKTOP-SUPPLY-EXCEL-A.done.md` |
| 7 | S | S6 Chrome filters/links | `tasks/_ready/nx-supply/TZ-NX-SUPPLY-S6-CHROME.md` | **DONE** — см. `tasks/_archive/2026-09/TZ-NX-SUPPLY-S6-CHROME.done.md` |
| — | L | Excel path B multi-sheet | `tasks/_ready/nx-supply/TZ-DESKTOP-SUPPLY-EXCEL-B.md` · `tasks/_archive/2026-09/prompts-spent/PROMPT-CLAUDE-SUPPLY-EXCEL-B.md` | **DONE** — см. `tasks/_archive/2026-09/TZ-DESKTOP-SUPPLY-EXCEL-B.done.md` |

**PO lock:** receive=confirm+warehouse(default); paid=flag; order=Order\|orderLabel; material=supply+copy; createdBy.  
**Не в волне:** Purchase*/Tender; wipe Google; Excel B day-1; второй склад-тип.
