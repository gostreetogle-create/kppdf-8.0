# TZ-PRODUCTION-345 checklist

> Status: **DONE**
> Marker: archived `tasks/_archive/2026-08/TZ-PRODUCTION-345.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: local-executor-composer
- claimed_at: 2026-08-16T21:24:18+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Unknown task; sync tasks first)
- closed_at: 2026-08-16T21:26:35+03:00

## Preflight

- [x] Claim + `_active` before code
- [x] Conflict keys free (342–344 archived)

## Acceptance

- [x] Empty modules → ineligible / skip intact (336)
- [x] Whole-product pseudo-module → one module row «… · целиком»
- [x] Order/worker trees 342–344 not broken
- [x] FE tsc + jest model|bars PASS (80); cockpit 23
- [x] WAVE DoD checkbox for 345; archive + commit/push; deploy NOT run

## Integrity slot

- [x] Тип: page (`/production`)
- [x] FIC: N/A — Gantt tree label for whole-product pseudo-module
- [x] page.md / PAGE-TZ-INDEX updated
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите
- [x] Coupling map: N/A

## Gates (факт)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS
- `pnpm exec jest --testPathPattern="gantt-bar.model.spec|gantt-bars.component.spec"` → PASS 2/80
- cockpit regression → PASS 23/23

## Executor report

- Whole-product path: `moduleId=productId` labeled `«product · целиком»`; empty modules stay skip.
- Catalog has no product-level WTs — live no-module orders remain ineligible until composition/modules exist.
- Deploy not run.

## Closeout

- [x] archive + lock + progress + `_active` removed
- Status = DONE
- closed_at: 2026-08-16T21:26:35+03:00
