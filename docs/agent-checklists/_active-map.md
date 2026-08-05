# SESSION QUEUE — Catalog UI workspace + Catalog Wave 2 BE

**Updated:** 2026-08-06 night · Buffy session dead; 314 uncommitted READY FOR REVIEW; tomorrow = DAY-07

## Closed earlier

DICT-308…312 · UI-TABLE-301…303,305 · SKIP 304 · TZ-CATALOG-UI-301 · Catalog Wave 1 · **TZ-CATALOG-310** · **TZ-CATALOG-313**

## Checkpoint 2026-08-06 night

- Buffy/Freebuff: сессия оборвалась (no free session / Calpost). **Стоп на сегодня.**
- **TZ-CATALOG-314:** код в WT, gates PASS по checklist, **не** commit/archive/push. Active marker остаётся.
- **Завтра:** `tasks/_backlog/catalog/TZ-DAY-2026-08-07-catalog-314-closeout-then-320.md`
  → closeout 314 → затем TZ-CATALOG-320 (не 311).
- Склад / MCP / UI-kit dirty — пауза.

## Catalog Wave 2 (strict order)

| # | TZ | Source | Status |
|---|-----|--------|--------|
| 1 | **TZ-CATALOG-310** | archived | **DONE** |
| 2 | **TZ-CATALOG-313** | archived | **DONE** |
| 3 | **TZ-CATALOG-314** | `_active` + uncommitted WT | **READY FOR REVIEW — closeout завтра** |
| — | **DAY-07** | `_backlog/catalog/TZ-DAY-2026-08-07-catalog-314-closeout-then-320.md` | **TOMORROW SCRIPT** |
| 4 | **TZ-CATALOG-320** | `_backlog/catalog/TZ-CATALOG-320.md` | после 314 on origin |
| 5 | **TZ-CATALOG-311** | `_backlog/catalog/TZ-CATALOG-311.md` | PARKED до 320 |
| 6 | **TZ-CATALOG-315** | `_backlog/catalog/TZ-CATALOG-315.md` | PARKED |

## Out of scope

- Deploy / wipe / `deploy.ps1`
- TZ-UI-TABLE-304
- PRODUCTION-* / Z-series / commerce
- `__pycache__/` and `tasks/Данные/`
- desktop/MCP and unrelated dirty frontend/UI-kit changes
