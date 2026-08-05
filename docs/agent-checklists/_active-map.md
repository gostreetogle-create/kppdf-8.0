# SESSION QUEUE — Catalog UI workspace + Catalog Wave 2 BE

**Updated:** 2026-08-05 · TZ-CATALOG-313 implementation ready for review; not committed

## Closed earlier

DICT-308…312 · UI-TABLE-301…303,305 · SKIP 304 · TZ-CATALOG-UI-301 · Catalog Wave 1 · **TZ-CATALOG-310**

## Checkpoint 2026-08-05

- DONE: TZ-CATALOG-310 — where-used API (`ee9325c`); warehouse pack B also on main.
- IN PROGRESS: TZ-CATALOG-313 — implementation complete, ready for review; commit/push waits for PO.
- NOT DONE: TZ-CATALOG-313 closeout, 314, 312, 311, 315; deploy out of scope.
- `_active/`: TZ-CATALOG-313.md claimed by Buffy.
- Hygiene: removed DONE root stubs + `_backlog/catalog` leftover 310/317 sources.
- Wave 2 remaining order: **313 → 314 → 312 → 311 → 315**.

## Catalog Wave 2 (strict order)

| # | TZ | Source | Status |
|---|-----|--------|--------|
| 1 | **TZ-CATALOG-310** | archived `tasks/_archive/2026-08/TZ-CATALOG-310.done.md` | **DONE** |
| 2 | **TZ-CATALOG-313** | `tasks/_active/TZ-CATALOG-313.md` | **READY FOR REVIEW** |
| 3 | **TZ-CATALOG-314** | `tasks/_backlog/catalog/TZ-CATALOG-314.md` | PARKED |
| 4 | **TZ-CATALOG-312** | `tasks/_backlog/catalog/TZ-CATALOG-312.md` | PARKED |
| 5 | **TZ-CATALOG-311** | `tasks/_backlog/catalog/TZ-CATALOG-311.md` | PARKED |
| 6 | **TZ-CATALOG-315** | `tasks/_backlog/catalog/TZ-CATALOG-315.md` | PARKED |

## Out of scope

- Deploy / wipe / `deploy.ps1`
- TZ-UI-TABLE-304
- PRODUCTION-* / Z-series / commerce
- `__pycache__/` and `tasks/Данные/`
- desktop/MCP and unrelated dirty frontend/UI-kit changes
