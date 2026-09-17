# TZ-NX-AUTH-DEMO-PASSWORD-TITLE checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-AUTH-DEMO-PASSWORD-TITLE.md`

## Claim slot
- agent_id: freebuff
- claimed_at: 2026-09-17T06:30:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI)

## Preflight
- [x] `_NOW.md` and `_active/` checked; no conflicting claim.
- [x] Demo-password TZ, login source, and login docs read.
- [x] Claim created before product edits.

## Acceptance
- [x] Shared `DEMO_PASSWORD` drives title and autofill.
- [x] Backend seed/password unchanged.
- [x] Focused checks and final NX build pass.

## Preflight Check Output
- Context: `frontend-nx/apps/kppdf-web/src/app/pages/login/login.page.ts`, `docs/pages/login.page.md`.
- Constraints: frontend login helper only; no backend credential change.
- Validation: focused ESLint, app typecheck, NX build last.

## Integrity slot
- [x] Type = auth page behavior.
- [x] Login docs already states `admin / admin123`; route/domain/readiness/coupling N/A.
- [x] Foreign WIP excluded.

## Gates
- Focused ESLint: PASS.
- App typecheck: PASS.
- `nx build kppdf-web`: PASS; final gate.
- Backend seed/password files unchanged.
