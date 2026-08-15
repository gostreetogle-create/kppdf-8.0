# TZ-AUTH-308 checklist

> Status: **DONE**
> Spec: `tasks/TZ-AUTH-308-device-only-admin-ux.md`
> Marker: archived `tasks/_archive/2026-08/TZ-AUTH-308.done.md`
> Commit/push: `docs/GIT-POLICY.md` (claimed executor)

## Claim slot

- agent_id: agent-3e757640b7
- claimed_at: 2026-08-15T14:49:53Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Unknown task; sync tasks first)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → only `D:\kppdf-8.0`
- [x] Read `_NOW.md` + `tasks/_active/` — no foreign CLAIM on same keys
- [x] TZ / conflict / deps read
- [x] Claim slot filled; Status = CLAIMED / IN PROGRESS (at start)
- [x] `tasks/_active/TZ-AUTH-308.md` present (removed on archive)

## Acceptance

- [x] Menu → `/admin/devices`, label Устройства
- [x] `/admin` and `/admin/users` redirect to devices
- [x] TOC: Устройства | Роли only
- [x] register unavailable (410); login KEEP
- [x] devices invite UI unchanged functionally
- [x] FE/BE tsc + targeted tests PASS
- [x] docs + checklist + report

## Integrity slot

- [x] Change type: page + permission-surface (admin nav) + docs
- [x] FIC N/A for non-form change (nav/redirect/register off)
- [x] page.md / PAGE-TZ-INDEX updated
- [x] SECTION-READINESS N/A
- [x] No foreign WIP in commit; conflict keys respected
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates

- FE tsc app: PASS
- FE Jest admin|layout|devices|auth: PASS (12 suites / 147 tests)
- BE tsc build: PASS
- BE Jest auth: PASS (3 suites / 28 tests)
- git diff --check (TZ files): PASS

## BLOCKERS

- Do not run AUTH-307 Bearer/Basic wipe in this TZ — honored
- Do not delete BE `/api/admin/users` — honored
- Deploy only on PO explicit command — honored (no deploy)

## Executor report (auto)

- outcome: DONE
- closed_at: 2026-08-15T15:00:00Z
- agent_id: agent-3e757640b7
- archive: tasks/_archive/2026-08/TZ-AUTH-308.done.md
- lock: .mimocode/locks/TZ-AUTH-308-device-only-admin-ux.lock
- commit_sha: PENDING_POST_COMMIT
- gates: FE tsc PASS; FE tests 147 PASS; BE tsc PASS; BE auth 28 PASS; diff --check TZ PASS
- conflict_disclosure: only TZ-AUTH-308 in `_active` at claim; no overlap
- known_limitation: `/admin/users` reset-password UI redirected; break-glass login/script
- not_done: AUTH-307, nginx, wipe, BE users API deletion, deploy
- team_room_claim: unavailable

## Closeout

- [x] archive + lock + progress + remove `_active`
- [x] Status = DONE
- closed_at: 2026-08-15T15:00:00Z
