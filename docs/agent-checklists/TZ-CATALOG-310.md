# TZ-CATALOG-310 checklist

> Status: **CLAIMED / IN PROGRESS**
> Marker: `tasks/_active/TZ-CATALOG-310.md`
> Source: `tasks/_backlog/catalog/TZ-CATALOG-310.md`
> Commit/push: authorized by PO for this queue.

## Claim slot

- agent_id: Buffy / openai-gpt-5.6-luna
- claimed_at: 2026-08-05T18:06:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable — Team Room CLI is not available in this session

## Preflight

- [x] Canonical worktree is `D:\kppdf-8.0`; not the Freebuff worktree.
- [x] `git pull --ff-only`; current HEAD is `0af28c4a60e635d1e794b5b017913e7bbaf0baeb`.
- [x] Read `GEMINI.md`, catalog master, backlog README, catalog audits, and `_active-map.md`.
- [x] Confirmed `tasks/_active/` was empty before this claim; no competing catalog claim.
- [x] Confirmed previous Catalog Wave 1 archives are present and are not being redone.
- [x] Claim slot filled before product-code edits.

## Acceptance

- [ ] Read-only where-used endpoints for Product, Module, Material, and WorkType.
- [ ] Paginated response with stable `page` / `limit` / `total` / `items` shape.
- [ ] Organization-scoped for organization-owned records; system/unscoped records are handled without cross-org leakage.
- [ ] Orphan-tolerant: missing referenced children do not make the endpoint fail.
- [ ] Composition and legacy links are both covered where the canonical read contract requires fallback.
- [ ] Authenticated read access and API documentation are wired consistently.
- [ ] Focused unit tests cover all entity kinds, pagination, org scope, and orphan behavior.

## Gates (fact)

- [ ] `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit`
- [ ] focused Jest suites for catalog graph/where-used and affected controllers
- [ ] `cd backend && pnpm lint` (or scoped lint if repository script is too broad)
- [ ] `git diff --check` on conflict keys

## Executor report

- In progress. Implementation and exact API response details will be recorded after gates.
- Conflict disclosure: only TZ-CATALOG-310 backend read paths plus this task's claim/checkpoint files; no frontend, deploy, parked backlog, UI-TABLE-304, production, Z-series, commerce, `__pycache__`, or `tasks/Данные`.
- Known limit: WorkType has no `organizationId` field in the current schema, so WorkType backlinks remain shared/read-only; the endpoint does not invent an org filter for an entity that cannot express one.

## Review handoff

- [ ] READY FOR REVIEW in catalog review inbox
- [ ] Cursor/PO PASS before archive if required by the task contract

## Closeout

- [ ] archive + lock + progress + remove active marker
- [ ] Status = DONE
- closed_at: pending
