# SESSION QUEUE — Catalog UI workspace + Catalog Wave 2 BE

**Updated:** 2026-08-06 · TZ-CATALOG-314 ready for review; no commit/push

## Closed earlier

DICT-308…312 · UI-TABLE-301…303,305 · SKIP 304 · TZ-CATALOG-UI-301 · Catalog Wave 1 · **TZ-CATALOG-310** · **TZ-CATALOG-313**

## Checkpoint 2026-08-06

- DONE: TZ-CATALOG-310 — where-used API (`ee9325c`); warehouse pack B also on main.
- DONE: TZ-CATALOG-313 — typed attachment and module photo references (`cde79fc`); PO accepted and closeout committed.
- READY FOR REVIEW: TZ-CATALOG-314 — archive/soft-delete/auth consistency; gates green, commit/push pending PO.
- PARKED FE composition: **320 → 311 → 315** (specs ready in backlog).
- `_active/`: TZ-CATALOG-314.md ready for review.
- Wave 2 remaining order: **314 close → 320 → 311 → 315** (312 per map / DONE).

## Catalog Wave 2 (strict order)

| # | TZ | Source | Status |
|---|-----|--------|--------|
| 1 | **TZ-CATALOG-310** | archived `tasks/_archive/2026-08/TZ-CATALOG-310.done.md` | **DONE** |
| 2 | **TZ-CATALOG-313** | archived `tasks/_archive/2026-08/TZ-CATALOG-313.done.md` | **DONE** |
| 3 | **TZ-CATALOG-314** | `tasks/_active/TZ-CATALOG-314.md` | **READY FOR REVIEW** |
| 4 | **TZ-CATALOG-320** | `tasks/_backlog/catalog/TZ-CATALOG-320.md` | **NEXT FE** (каскад + детали в диалогах) |
| 5 | **TZ-CATALOG-311** | `tasks/_backlog/catalog/TZ-CATALOG-311.md` | PARKED до 320 DONE (CompositionTree) |
| 6 | **TZ-CATALOG-315** | `tasks/_backlog/catalog/TZ-CATALOG-315.md` | PARKED |

## Out of scope

- Deploy / wipe / `deploy.ps1`
- TZ-UI-TABLE-304
- PRODUCTION-* / Z-series / commerce
- `__pycache__/` and `tasks/Данные/`
- desktop/MCP and unrelated dirty frontend/UI-kit changes
