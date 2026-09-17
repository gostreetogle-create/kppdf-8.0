# QA Coverage Summary (incremental)

**Дата:** 2026-09-17  
**План:** Full QA coverage audit (NX SoT)

## Progress

| Phase | Status |
|-------|--------|
| 0 Inventory | **DONE** — `2026-09-17-qa-coverage-inventory.md` (28 pages / 35 route rows / 93 BE) |
| 1 Auth/Shell/Home | **DONE slice** — entries in checklist 1 & 2 |
| 1 remaining domains | **DONE** — Orders → Shipping → Production → Supply → Warehouse → Studio → Registries → Deals → Admin → Desktop → orphan BE |
| 2 Final checklists freeze | **DONE** — append-only closure matrix and module register |
| 3 Global Self-Check 100% | **DONE** — 0 missing NX rows / 0 missing BE modules |

## Final coverage counts

| Bucket | N |
|---|---:|
| NX inventory route rows classified | **35 / 35** |
| NX rows in Checklist №1 (code-Verified) | **23** |
| NX rows in Checklist №2 (blocked/manual/fixture) | **12** |
| Backend modules classified | **93 / 93** |
| Backend modules with Verified consumer evidence | **30** |
| Backend modules blocked/orphan/manual | **63** |
| Missing NX route rows | **0** |
| Missing backend modules | **0** |
| Product-code files changed by this TZ | **0** |

## Counts (Auth/Shell/Home slice)

| Bucket | N |
|--------|---|
| Checklist №1 Verified (this slice) | 15 |
| Checklist №2 findings (this slice) | 7 + pending placeholders |

## Top follow-up TZ candidates after full audit

1. Redirect post-login and `publicOnlyGuard` to `/home`; remove dead `/legal/privacy` link.
2. Complete `/registries` backend/permission/data chain or explicitly keep it fixture-only.
3. Finish quotation/proposals create/output chain (`quotation`, `generated-document`).
4. Add authenticated runtime smoke for `/orders/:id`, `/shipping`, `/production`, `/studio/:id`.
5. Security decision for `/kit/*` parent outside `authGuard`.
6. Desktop pairing + import/MCP OS round-trip with a real paired device.
7. Catalog/product/module/photo vertical slice for the currently orphaned catalog modules.
8. Production write/assignment acceptance beyond read facades.
9. Document render/table/text-block end-to-end acceptance.
10. Finance/report/invoice/tender surfaces or explicit product-scope decisions.

## Top gaps to TZ (from this slice)

1. Post-login landing `/admin/devices` vs `/home`  
2. Dead `/legal/privacy` link on login  
3. Demo password title mismatch  
4. Confirm whether `/kit` must be behind `authGuard`

## Next UNATTENDED domain

**Orders** (`/orders`, `/orders/:id` workspace, hub tray ship/cancel) — затем Production → Supply/Warehouse → Studio.
