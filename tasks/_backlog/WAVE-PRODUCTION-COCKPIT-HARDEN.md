# WAVE-PRODUCTION-COCKPIT-HARDEN

**PO:** 2026-08-15 — после CASCADE довести Цех/Гант до 98–99.  
**Audit:** `docs/audits/2026-08-15-production-cockpit-harden-audit.md`  
**Prompt:** `tasks/_backlog/PROMPT-PRODUCTION-COCKPIT-HARDEN.md`  
**Master checklist:** `docs/agent-checklists/WAVE-PRODUCTION-COCKPIT-HARDEN.md`

| # | TZ | Status | Notes |
|---|-----|--------|-------|
| 0 | Docs freeze in master checklist | READY | score baseline |
| 1 | `TZ-PRODUCTION-324-gantt-zoom-fit` | DONE | fit-width week; rename horizon; scroll today |
| 2 | `TZ-PRODUCTION-325-orders-rail-counterparties` | DONE | kill pips; заказчики filter |
| 3 | `TZ-PRODUCTION-326-gantt-write-sync` | DONE | plannedDate/roles/reload integrity |
| 4 | `TZ-PRODUCTION-327-cockpit-smart-dumb` | DONE | inventory + one dumb scale-controls extract; 70 production tests PASS |
| 5 | `TZ-PRODUCTION-328-cockpit-docs-closeout` | DONE | page/spec SoT synced; final estimate-studio score 98/100; no deploy |

**Order:** strict serial 324→328. No deploy/wipe.

**Out:** fact production; new BE endpoints unless 326 proves a real API bug (then STOP + ask PO).
