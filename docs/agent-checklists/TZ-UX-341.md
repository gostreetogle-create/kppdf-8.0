# TZ-UX-341 checklist

> Status: **DONE**
> Marker: archived → `tasks/_archive/2026-08/TZ-UX-341.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: cursor-composer (TZ-UX-341 frontend executor)
- claimed_at: 2026-08-16T09:26:00Z
- closed_at: 2026-08-16T09:50:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable

## Preflight

- [x] Workspace `D:\kppdf-8.0`
- [x] UX-340 on main; CATALOG-374 READY→DONE (no modules code WIP); UX-326 DONE
- [x] Claimed

## Acceptance

- [x] Grid и table — `app-pi-pagination`
- [x] Products PAGE_SIZE 15 → 10
- [x] `pageSizeChange` → size + page 1
- [x] Specs + page.md
- [x] Gates PASS

## Integrity slot

- [x] Тип: page
- [x] page.md + PAGE-TZ-INDEX
- [x] SECTION-READINESS: N/A
- [x] Conflict keys only

## Gates (факт)

- `tsc -p tsconfig.app.json --noEmit` PASS
- `pnpm test -- --testPathPattern="products.page.spec|modules.page.spec|materials.page"` PASS (69)

## Executor report

Replaced custom grid-pager on products/modules/materials with `app-pi-pagination`; products limit 10; pageSize signal + reset; modules grid uses paginatedRows. No chrome/backend/UX-342/deploy.

## Closeout

- [x] archive + lock + progress + remove `_active`
- [x] Status = DONE
