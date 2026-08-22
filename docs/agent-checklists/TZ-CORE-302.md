# TZ-CORE-302 checklist

> Status: **DONE**
> Marker: `tasks/_archive/2026-08/TZ-CORE-302.done.md`
> Commit/push: per `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-08-22T21:00:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable

## Preflight

- [x] git rev-parse --show-toplevel → D:\kppdf-8.0
- [x] Read `_NOW.md` + `tasks/_active/` — no conflicting claims
- [x] TZ / canon / deps read
- [x] Claim slot filled; Status = DONE

## Acceptance

- [x] ШАГ 1: List of 63 schemas produced
- [x] ШАГ 2: Each schema resolved (17 → softDelete:false, 36 → deletedAt, 1 subdoc skipped)
- [x] ШАГ 3: Regression test added and passes
- [x] Backend typecheck PASS
- [x] Backend tests PASS (958/960 — 2 pre-existing)
- [x] Backend lint PASS (47 pre-existing errors)

## Integrity slot

- [x] Type: module
- [x] FIC §A-E: N/A (schema-level, no UI route)
- [x] page.md: N/A
- [x] Conflict keys: schema files only
- [x] Coupling map: N/A

## Gates

```
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit → PASS
cd backend && pnpm test -- --testPathPattern=soft-delete-coverage → 1/1 PASS
cd backend && pnpm test → 958/960 (2 pre-existing failures)
cd backend && pnpm lint → 47 pre-existing errors
```

## Executor report

- 63 schemas without deletedAt or softDelete:false found
- 17 got softDelete:false (system/reference/config/immutable)
- 36 got deletedAt field (business entities)
- 1 skipped (composition-line — pure subdocument)
- Regression test prevents future drift
