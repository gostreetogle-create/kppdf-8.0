# TZ-NX-F3-data-access — stale claim, moved out of _active

> Original claim (agent_id: freebuff-nx-f3, claimed_at: 2026-08-29T10:09:01+03:00)
> left `Status: CLAIMED / IN PROGRESS` with no `.done.md` closeout.

## Why this file exists

PO confirmed (2026-08-29, ~10:38) that the Freebuff session for F3 finished
its work. File-write activity in F3's conflict keys
(`frontend-nx/libs/data-access/**`, `frontend-nx/apps/kppdf-web/**`) stopped
~8 minutes before this check (last write: `apps/kppdf-web/eslint.config.mjs`).
The Freebuff session evidently ended before running its own closeout
(archive + integrity + executor report per its own acceptance criteria).

**This is NOT a verified DONE closeout of F3.** I (claude, working on the
unrelated `TZ-NX-KIT-AUDIT-2-kit-demos` task) did not run F3's own gates
(backend auth: jwt.strategy / permissions.guard / auth.service; `libs/data-access`
tsc/lint/test; `nx build kppdf-web`). I only removed the stale active-marker
so it stops blocking conflict checks for unrelated work in
`frontend-nx/apps/kppdf-web/**`. If F3's actual acceptance criteria need
verification, that's a separate task.

## Files F3 appears to have delivered (from mtime, not verified)

`apps/kppdf-web/src/app/pages/{login,enroll,forbidden,admin-devices,
admin-roles,device-invite-dialog,device-role-dialog,
owner-device-invite-dialog,role-form-dialog}*`, `permission-labels.ru.ts`,
`app.routes.ts`, `libs/data-access/src/lib/admin/*`,
`libs/data-access/tsconfig.lib.json`, `apps/kppdf-web/eslint.config.mjs`.

Original claim file moved here verbatim below for record.

---

# TZ-NX-F3-data-access

> Status: **CLAIMED / IN PROGRESS**
> Conflict keys: `frontend-nx/libs/data-access/**`; `frontend-nx/apps/kppdf-web/**`; backend auth jwt.strategy + permissions.guard + auth.service

## Claim slot

- agent_id: freebuff-nx-f3
- claimed_at: 2026-08-29T10:09:01+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (team-room command not exposed)

## Preflight

- Get-Location: `/d/kppdf-8.0` (Windows path `D:\kppdf-8.0`)
- git rev-parse --show-toplevel: `D:/kppdf-8.0`
- `_NOW.md` and `tasks/_active/` checked; no active conflicting task.
- `_active-map.md` checked; historical only, no live conflicting claim.
- TZ, F3 prompt, auth platform, RBAC contract, guide and checklist template read.

## Acceptance

Execute F3-BE through F3-doc without modifying legacy `frontend/**`; pass all TZ gates; archive with integrity and executor report.

## Integrity slot

- Pending until implementation and gates.
