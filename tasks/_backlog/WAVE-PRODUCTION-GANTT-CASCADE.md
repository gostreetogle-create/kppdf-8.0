# WAVE-PRODUCTION-GANTT-CASCADE

**PO:** 2026-08-15 — каскад на Ганте вместо нижней Карточки.  
**Audit:** `docs/audits/2026-08-15-gantt-cascade-no-bottom-card.md`

| # | TZ | Status | Notes |
|---|-----|--------|-------|
| 1 | `TZ-PRODUCTION-321-gantt-work-detail-cascade` | DONE | клик вида работ → inline detail (дни/люди/каталог) |
| 2 | `TZ-PRODUCTION-322-gantt-order-meta-kill-card` | DONE | meta под summary; убрать sheet + chrome «Карточка» |

**SoT:** 3 уровня на левой колонке; timeline drag/resize без регрессии; без новых estimate API.

**Out:** fact production; product→module дерево на Ганте; MS-Project links.
