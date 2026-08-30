# TZ-NX-COMPOSITION-NX-AUDIT checklist

> Status: **DONE**
> Marker: archived as `tasks/_archive/2026-08/TZ-NX-COMPOSITION-NX-AUDIT.done.md`
> Mode: **analysis-only**

## Claim slot

- agent_id: cursor
- claimed_at: 2026-08-29T20:55:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable

## Preflight

- [x] Source TZ was missing; restored `tasks/TZ-NX-COMPOSITION-NX-AUDIT.md` from PO prompt
- [x] `_NOW.md` empty of conflicting composition/constructor claims
- [x] Claim filled; Status DONE after archive

### Preflight Check Output

- **Context read:** `docs/PO-CANON.md`, `docs/CONTEXT.md`, `docs/TZ-AUTHORING.md`, `docs/FEATURE-INTEGRATION-CHECKLIST.md`, `docs/pages/registries.page.md`, `docs/pages/ui-composition-tree.md`, `docs/pages/product-detail.page.md`, `docs/pages/products.page.md`, `docs/compose/plans/2026-08-04-catalog-composition-vision.md`, `docs/adr/README.md`, `frontend-nx/.../registries/**` (types, page, catalog, units), `nav-categories.ts`, `libs/data-access/src/index.ts`, `libs/features/src/index.ts`, `composition-line.schema.ts`, `composition-line.service.ts`, `catalog-graph.service.ts`, `product.schema.ts`, `product.controller.ts`, `product-module.controller.ts`, `material.controller.ts`, `snapshot.helper.ts`
- **Key Constraints:** Mode A analysis-only; no product code; FIC N/A
- **Planned Deliverable:** inventory + two-section IA + risks + TZ order
- **Validation Path:** FIC N/A docs-only; Integrity slot

## Acceptance

- [x] NX registries / master-table / contracts inventoried
- [x] Legacy composition inventoried (nested, qty, dims, color gap, purchased, cycle, snapshot)
- [x] Architecture: Реестры vs Конструктор
- [x] URL/routes, UI reuse, data-access
- [x] Ordered implementation plan
- [x] No product code changed

## Integrity slot

- [x] docs-only
- [x] FIC §A–E N/A — no route/module/permission/MCP in this TZ
- [x] page.md / PAGE-TZ-INDEX: N/A (no new live route)
- [x] SECTION-READINESS: N/A
- [x] Coupling map: N/A
- [x] ADR index: N/A — IA proposal, not irreversible schema (D1–D4 already in composition vision)

## Gates

N/A — analysis-only

## Executor report

- NX: master table + units HTTP + departments fixture; RegistryDefinition cannot host BOM.
- Legacy: 3 collections; details = materialKind; complex = derived isComplex; no line color; cycles/depth 8; CORE-301 is order-stage snapshot.
- IA: registries = shelf; constructor = only composition write-path; URLs split.
- Blockers: modules list not paginated; isComplex not a list query param.
- MCP claude_code Agent unavailable; analysis in Cursor.

**Outcome: PASS (docs).**
