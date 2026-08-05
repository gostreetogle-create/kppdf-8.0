# Design: Warehouse UI (usable workshop pack)

> **Status:** IMPLEMENTED 2026-08-05 — pack B live UI (material-first).  
> **Canon companion:** `2026-08-05-warehouse-workshop-vision.md`  
> **Readiness:** see `docs/SECTION-READINESS.md` §2

## Scope (this wave)

| Screen | Route | Capability |
|--------|-------|------------|
| Дашборд | `/inventory` | KPI + low-stock + jump cards |
| Остатки | `/storage-items` | table, warehouse chips, put-on-stock + adjust |
| Движения | `/stock-movements` | type chips, +Приход/+Расход/+Корр. dialogs |
| Склады | `/warehouses` | CRUD name/type/zones/active |

Out of scope now: owner ACL enforcement, worker-only scoped login, barcode scan, transfer UI polish (API supports transfer — can add later).

## UX principles (workshop)

1. One sticky Group Chip TOC — never bury actions under H1 prose.
2. Every stock change is a **movement** (or adjust that creates adjust movement) — never silent qty overwrite in UI.
3. Prefer material-first flows (цех); product optional in same dialog.
4. Empty states tell the next click («+ Склад», «Поставить на склад»).
5. Paper & Ink: `PiGroupWorkspace`, `pi-table-surface`, dialogs like color-reference.

## Data

- Warehouse CRUD → existing `/api/warehouses`
- Movements → `POST /api/stock-movements` (`in`/`out`/`adjust`)
- Put on stock → `POST /api/materials/:id/storage-items` (or products)
- Adjust → `POST /api/storage-items/:id/adjust` (не `POST /stock-movements` type=adjust — тот путь не меняет qty)

## Implemented (2026-08-05)

- `/warehouses` CRUD UI + TOC chip + nav + dense chrome
- Остатки: `+ Поставить на склад`, row ✎ → adjust
- Движения: `+ Приход` / `+ Расход` / `+ Корр.`
- Дашборд: KPI jump-links
- `GET /stock-movements` → envelope `{ items, total }`
