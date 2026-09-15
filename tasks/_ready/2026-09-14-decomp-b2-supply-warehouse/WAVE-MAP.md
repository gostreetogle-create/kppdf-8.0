# WAVE — Block 2: Supply cluster + Warehouse

> Pack: `tasks/_ready/2026-09-14-decomp-b2-supply-warehouse/`  
> Priority elevated to High (active BE warehouse/stock integration)  
> Эталон: DocStudio Editor Decomp

## Goal

Идеальный фундамент для снабжения и склада: Facade + Signals + thin pages в app + dumb UI в `@kppdf/features/supply` и `@kppdf/features/warehouse`. **Без смены** статусов/движений/API контрактов.

## Chain

### Stream S — Supply

| # | SIZE | TZ id | Depends |
|---|------|-------|---------|
| S1 | L | `TZ-NX-SUPPLY-PAGE-FACADE` | B1 pack DONE (or _active empty + PO start) |
| S2 | L | `TZ-NX-SUPPLY-REQUESTS-FACADE` | S1 |
| S3 | S | `TZ-NX-SUPPLY-TO-FEATURES` | S2 |

### Stream W — Warehouse (after Stream S)

| # | SIZE | TZ id | Depends |
|---|------|-------|---------|
| W1 | L | `TZ-NX-WAREHOUSE-PAGES-FACADE` | S3 |
| W2 | S | `TZ-NX-WAREHOUSE-TO-FEATURES` | W1 |

## Target layout

```
apps/.../pages/supply/supply.page.ts                    # thin
apps/.../pages/supply-requests/supply-requests.page.ts  # thin
apps/.../pages/warehouse/{warehouses,storage-items,stock-movements}.page.ts  # thin

libs/features/src/lib/supply/
  supply.facade.ts
  supply-requests.facade.ts
  ui/... (filters, rows, create form extract, dialogs stay or move)

libs/features/src/lib/warehouse/
  warehouses.facade.ts
  storage-items.facade.ts
  stock-movements.facade.ts
  ui/... + dialogs
```

Paths: `@kppdf/features/supply`, `@kppdf/features/warehouse`

## Hard rules

- Preserve SupplyTask / SupplyRequest status transitions and warehouse movement semantics.
- Inline create form on `/supply` → extract to dumb UI or dialog **without** changing fields/validation behavior.
- Existing dialogs (receive, put-on-stock, adjust, movement form, warehouse form) — move with UI or keep openers on page.
- Specs listed in each TZ; nx build last.

## Prompt

[PROMPT-CLAUDE-B2-CONTINUOUS.md](./PROMPT-CLAUDE-B2-CONTINUOUS.md)

## Status

| Stream | Status |
|--------|--------|
| S1–S3, W1–W2 | **DONE** — see `docs/agent-checklists/WAVE-DECOMP-B2-SUPPLY-WAREHOUSE.md` for commits |
