# WAVE-PRODUCTION-GANTT-RESIZE

**PO:** 2026-08-15 — привычный Гант с resize handles.  
**SoT audit:** `docs/audits/2026-08-15-gantt-bar-resize-drag-audit.md`

| # | TZ | Status | Notes |
|---|-----|--------|-------|
| 1 | `TZ-PRODUCTION-309-safe-estimate-order-days` | **DONE** 2026-08-15 | SHA `9b24c0f1498c12daa996500ccfd760cfca1a0bd6` · order overrides + production:write |
| 2 | `TZ-PRODUCTION-311-gantt-estimate-resize` | **DONE** 2026-08-15 | right-edge only → order estimate-days |
| 3 | `TZ-PRODUCTION-313-card-flyout-compact` | **DONE** 2026-08-15 | card flyout min(22rem) + inspector w-full |
| 4 | `TZ-PRODUCTION-312-gantt-body-drag-planned-date` | READY after 313 | body-drag → plannedDate |

**Out:** left resize, per-bar lag, fact production, 304–307.

**Parallelism:** sequential only (same FE production keys).
