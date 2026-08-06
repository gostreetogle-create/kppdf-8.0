# TZ-CATALOG-320 — FE composition gap

> Active execution marker. Source of truth: `tasks/_backlog/catalog/TZ-CATALOG-320.md`.
> Canon: `tasks/TZ-CATALOG-300.md` §1–§3 (D1–D4).

## Status
CLAIMED / IN PROGRESS

## Scope
Frontend-only composition UI for `/products`, `/products/:id`, `/modules`, and `/modules/:id`.

## Acceptance criteria
- Composition types and DTOs support `lineType: module | material | product` and optional non-negative `unitPriceOverride`, product-only.
- Module composition adds child modules and materials, excluding the parent module from its picker.
- Product composition adds modules, non-raw materials, and products, excluding the current product; raw materials are rejected clearly.
- Product composition derives and displays the Russian badge `Комплекс` when a product line exists.
- Composition rows/pickers show Russian `materialKind` labels.
- Module dimensions controls resolve through `formGroupName="dimensions"`.
- Focused Jest tests cover service payloads and module/product composition flows.
- Four catalog page docs describe the available composition types, complex products, materialKind semantics, and successor TZ-CATALOG-311.

## Gates
- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`
- `cd frontend && pnpm test -- --testPathPattern="pi-product-modules|product-form|module-materials|module-form|product-detail"`

## Closeout
Archive: `tasks/_archive/2026-08/TZ-CATALOG-320.done.md` with `ARCHIVE_MARKER`; create scoped lock; update checklist, map, progress; remove this active marker only after PASS.
