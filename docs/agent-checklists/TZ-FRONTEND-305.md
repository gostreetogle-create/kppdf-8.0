# TZ-FRONTEND-305 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-FRONTEND-305.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: Buffy (freebuff)
- claimed_at: 2026-08-16T01:24:42+03:00
- workspace: D:\\kppdf-8.0
- team_room_claim: unavailable — Team Room недоступен

## Preflight

- [x] `main == origin/main` до claim; чужой WIP перечислен и не трогается
- [x] `_NOW.md` + `tasks/_active/` прочитаны; exact keys свободны
- [x] Architecture check failure reproduced: dashboard page imports order/product page dialogs
- [x] Scope ограничен dashboard dialog boundary; AUTH-307/deploy не входят

## Acceptance

- [x] No page-to-page component imports in `dashboard.page.ts`
- [x] Existing Order/Product dialog lazy loading preserves data payloads and reload-after-close
- [x] Kanban status PATCH/ship/cancel/item status/readiness behavior unchanged
- [x] Dashboard + coordinator Jest 2 suites / 7 tests; FE tsc/lint/Prettier PASS
- [x] `pnpm architecture:check` PASS with no new violations (948 files; baseline 6)
- [x] No backend/API/permission/route/data changes

## Rationale

Выбран разрез A по аналогии с TZ-FRONTEND-304: новый shared coordinator owns only existing
page-dialog lazy imports/open/close callback; DashboardPage retains orders state and all Kanban
write-path logic. No UX or payload rewrite.

## Integrity slot

- [x] Type: other — architecture frontend refactor, no route/API/permission
- [x] FIC §A–E: N/A — no API, route, permission or MCP change
- [x] page.md / PAGE-TZ-INDEX: N/A — no visible contract change
- [x] SECTION-READINESS: N/A
- [x] Foreign WIP excluded; exact keys respected
- [x] Canon: `docs/DOCS-INTEGRITY.md`

## Gates (fact)

- baseline architecture: FAIL — 2 existing dashboard cross-page imports
- final architecture: PASS — 948 files; baseline 6
- dashboard + coordinator Jest: 2 suites / 7 tests PASS
- frontend tsc, changed ESLint and Prettier: PASS
- `git diff --check`: PASS after staging

## Executor report

- Scope delivered: dashboard retains all Kanban state and write-paths; `DashboardDialogService` owns only existing lazy Order/Product page-dialog imports and close reload callbacks.
- Review verdict: self-review PASS; no UX/API change, no deploy.
- Foreign WIP disclosure: `docs/PO-DIARY.md`, `data/*`, architect-owned docs and PARK files excluded.

## Closeout

- [x] archive + lock + progress + delete `_active`
- [x] status DONE; closed_at 2026-08-16T01:32:00+03:00
- implementation commit: `2f8d291d`
