# Design-system chrome drift audit

**Date:** 2026-08-09
**Scope:** authenticated operational frontend pages; chrome only.
**Method:** grep/inspection of route pages for `app-pi-group-workspace`,
`app-pi-page-chrome`, custom breadcrumb/nav markup, and display-heading drift.

## Canon

- Use `app-pi-group-workspace` for a sibling-route workspace: `pathLabel`, shared
  route chips, `activeId`, and controls projected through `[tools]`.
- Use `app-pi-page-chrome` for a simple list or detail page needing breadcrumbs
  and/or a short title.
- Do not create a second app-layout navigation. Production cockpit is a special
  dense shell and remains outside this audit's implementation scope.

## Route audit

| Route | Page chrome found | Verdict | Evidence / note |
|---|---|---|---|
| `/products`, `/modules`, `/materials` | `PiGroupWorkspace` + catalog chips | PASS | Shared catalog family and active chip |
| `/counterparties`, `/people` | `PiGroupWorkspace` + clients chips | PASS | Shared client family |
| `/work-types`, `/production` | Group chips | PASS | Shared production chip vocabulary; cockpit keeps its dense shell |
| `/proposals`, `/contracts`, `/orders` | `PiGroupWorkspace` + deals chips | PASS | Existing NAV-302 family preserved |
| `/inventory`, `/storage-items`, `/stock-movements`, `/warehouses` | `PiGroupWorkspace` + warehouse chips/selects | PASS | Query filters remain page-owned |
| `/dictionaries/*` | `PiGroupWorkspace` + dictionary TOC/chips | PASS | Group workspace canon |
| `/supply`, `/shipping` | `PiGroupWorkspace` + supply chips | PASS | Unified by TZ-UX-309 |
| `/design` | `PiGroupWorkspace` + design chip | PASS | Unified by TZ-UX-309 |
| `/doc-constructor/documents` | `PiGroupWorkspace` + document chips | PASS | Unified by TZ-UX-309 |
| `/doc-constructor/templates` | `PiPageChrome` / list chrome | FAIL | Document sibling workspace is not yet migrated consistently |
| `/doc-constructor/texts`, `/doc-constructor/tables` | `PiPageChrome` / legacy list chrome | FAIL | Same document family has mixed chrome |
| `/organizations` | `PiPageChrome` | FAIL | Related client/customer route is outside current client chip family |
| `/admin/users`, `/admin/roles` | `PiGroupWorkspace` | PASS | Admin group workspace already adopted |
| `/orders/:id`, `/products/:id`, `/materials/:id`, `/modules/:id` | `PiPageChrome` | PASS | Detail pages appropriately use breadcrumb chrome |

## Display/custom markup scan

| Drift signal | Result | Priority |
|---|---|---|
| `text-5xl` on operational pages | **FAIL (low)** | The only grep hit is the Foundations UI showcase (`/foundations`), not an operational route; exclude it from ERP chrome gates or create a separate showcase audit |
| Custom breadcrumb components | **PASS (scoped)** | The only direct operational-looking breadcrumb markup is the Navigation showcase; builder breadcrumb is an in-page editor control |
| Custom group chip markup | **FAIL (accepted exception)** | Production cockpit intentionally retains a dense special shell; normalize only through a dedicated production TZ |
| Toolbar outside `PiGroupWorkspace [tools]` | **FAIL** | Fixed for generated documents in TZ-UX-309; remaining document pages are successors |

## Prioritized FAIL successors

| Priority | Successor | Scope |
|---:|---|---|
| P1 | `TZ-UX-311` | Migrate the remaining document-constructor list pages to one Documents workspace chrome and shared chips |
| P2 | `TZ-UX-312` | Decide whether Organizations joins the Clients workspace or remains a distinct customer master; add chips only after IA decision |
| P3 | `TZ-UX-313` | Re-scan operational pages for display-heading/custom breadcrumb drift after the next chrome wave |
| P4 | `TZ-PRODUCTION-304` | If PO wants full chrome normalization, explicitly scope the production cockpit exception; do not silently rewrite its dense shell |

These are follow-up proposals only; this docs-only TZ does not implement them.

## Known limitations

- This is a static source audit, not an authenticated browser visual pass.
- The production cockpit is intentionally recorded as an accepted special shell,
  not changed or normalized here.
- Successor IDs are proposed for the next planning wave and do not claim those
  tasks are already authorized.
