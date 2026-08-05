# TZ-CATALOG-310 checklist

> Status: **DONE**
> Source: `tasks/_backlog/catalog/TZ-CATALOG-310.md`
> Commit/push: authorized by PO for this queue.

## Claim slot

- agent_id: Buffy / openai-gpt-5.6-luna
- claimed_at: 2026-08-05T18:06:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable — Team Room CLI is not available in this session

## Preflight

- [x] Canonical worktree is `D:\kppdf-8.0`; not the Freebuff worktree.
- [x] Current branch is `main`; unrelated dirty work was preserved and not staged.
- [x] Claim slot filled before product-code edits.
- [x] No competing active claim for TZ-CATALOG-310.

## Acceptance

- [x] Read-only where-used endpoints for Product, Module, Material, and WorkType.
- [x] Paginated response with stable `page` / `limit` / `total` / `items` shape.
- [x] Organization scope is applied to Product and Material parent records. ProductModule and WorkType have no `organizationId` field in the current schema and remain explicitly shared/global rather than receiving a misleading filter.
- [x] Orphan-tolerant: missing referenced children do not make the endpoint fail because backlinks read parent edges without dereferencing targets.
- [x] Composition and legacy links are covered; legacy module/material links are used when canonical composition has no matching target.
- [x] Authenticated read access and API documentation are wired consistently: role guards, current-user organization context, Swagger tags/operations/queries/responses.
- [x] Focused unit tests cover all entity kinds, pagination, invalid organization scope, shared-vs-owned query behavior, legacy fallback, and orphan behavior.

## Gates (fact)

- [x] `cd D:\kppdf-8.0\backend && pnpm exec tsc -p tsconfig.build.json --noEmit` — PASS (exit 0).
- [x] `cd D:\kppdf-8.0\backend && pnpm exec jest --runInBand src/modules/catalog-graph/catalog-graph.service.spec.ts src/modules/material/material.service.spec.ts src/modules/material/material.catalog-301.spec.ts src/modules/order/order.service.spec.ts` — PASS, 4 suites / 46 tests.
- [x] Scoped ESLint on catalog graph, where-used controllers, material service/tests, and affected order test — PASS with 6 pre-existing `no-explicit-any` warnings in test mocks; 0 errors.
- [x] `git diff --check` on conflict keys — PASS (only Git LF→CRLF normalization warnings).

## Executor report

- Added read-only `GET :id/where-used` routes for Product, Module, Material, and WorkType, delegating to a shared paginated `CatalogGraphService`.
- Added stable sorting, legacy `productModuleIds` / `materials` fallback, orphan-tolerant direct-edge reads, ObjectId validation, and organization predicates for organization-owned parent collections.
- Added CatalogGraphModule wiring to Material and WorkType modules; updated affected test constructors for the new required dependencies.
- Added Swagger documentation for all four where-used endpoints and tags for Module/WorkType controllers.
- Review finding resolved: shared ProductModule/WorkType schemas have no organization ownership, so their queries remain intentionally global and this limitation is documented instead of pretending to isolate them.
- Conflict disclosure: only TZ-CATALOG-310 backend graph/controllers/module wiring and directly affected tests were changed for this task. Unrelated frontend, docs, startup, deployment, `__pycache__`, and `tasks/Данные` changes were not staged.
- Known limit: cross-organization isolation cannot be provided for ProductModule/WorkType until those schemas gain `organizationId`; adding ownership is outside TZ-CATALOG-310.

## Review handoff

- [x] Code review completed; critical scope/fallback/API documentation findings addressed.
- [x] Ready to archive after green gates.

## Closeout

- [x] archive + lock + progress + remove active marker
- [x] Status = DONE
- closed_at: 2026-08-05
- closed_by: Buffy / openai-gpt-5.6-luna
