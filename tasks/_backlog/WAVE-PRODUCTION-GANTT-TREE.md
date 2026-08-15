# WAVE-PRODUCTION-GANTT-TREE

**PO:** 2026-08-15 — сводная полоса заказа → expand состава (как таблица изделий); параллельный сдвиг видов; карточка снизу.

| # | TZ | Status | Notes |
|---|-----|--------|-------|
| 1 | `TZ-PRODUCTION-314-gantt-order-expand` | DONE | collapsed = 1 summary bar / order; expand = work-type rows |
| 2 | `TZ-PRODUCTION-315-card-bottom-sheet` | DONE | Карточка dock снизу, не справа |
| 3 | `TZ-PRODUCTION-316-gantt-bar-start-offset` | DONE | per-bar move / parallel via start offsets |
| 4 | `TZ-PRODUCTION-317-gantt-expand-keep-orders` | DONE | select ≠ filter; expand in-place; deep-link/reload keep multi-order |
| 5 | `TZ-PRODUCTION-318-card-sheet-viewport` | DONE | full-width sheet; composition expands up (fixed popover) |

**Wave status:** DONE 2026-08-15 (314–318).

**SoT intent:** summary span = min(start)…max(end) children; detail resize = days override (309/311); summary body-drag = plannedDate (312); detail body-drag = start offset (316).

**Out:** fact production, left-edge resize, MS-Project links, 304–307.
