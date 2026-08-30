# TZ-NX-REGISTRIES-SUPPLY-PASSPORT-MATRIX

## Goal

Produce a verified matrix of requested registry tables versus the current NX routes, backend entities/endpoints, and the supplied workbooks `data/Снабжение.xlsx` and `data/Pasports.xlsx`.

## Required output

Classify every requested area as PRESENT, PARTIAL, BLOCKED or MISSING:

- Units;
- Materials;
- Details (Material kinds);
- Modules;
- Products;
- Complex view (derived Product, not a new entity unless explicitly approved);
- Supply requests;
- Suppliers/organizations;
- Stock/warehouse;
- Product passports;
- invoices/delivery only where a real backend contract exists;
- temporary demo Departments.

For each area record: route, registry key, entity/collection, endpoint, filters, pagination mode, actions, known gaps, and next TZ.

## Rules

- Do not invent entities, endpoints, permissions or fields.
- Treat `data/Снабжение.xlsx` and `data/Pasports.xlsx` as read-only evidence.
- Do not import or mutate workbook data.
- Do not change `frontend/**`, `backend/**`, `frontend-nx/**`, package files or configuration.
- A derived Complex view must not be called a separate backend table without reliable classification.
- Explicitly identify backend TZs needed for missing capabilities.

## Artifacts

Create active claim/checklist/archive using the project protocol. The final archive must include the matrix, evidence paths, blockers and ordered implementation plan.
