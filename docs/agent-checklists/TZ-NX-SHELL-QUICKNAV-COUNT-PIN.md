# TZ-NX-SHELL-QUICKNAV-COUNT-PIN checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-SHELL-QUICKNAV-COUNT-PIN.md`

## Claim slot
- agent_id: freebuff
- claimed_at: 2026-09-17T07:45:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI)

## Preflight
- [x] Prompt, pack, shell TZ, app-shell spec/source, nav categories, routes, and page doc read.
- [x] `_active/` checked; no conflicting claim.
- [x] Baseline scope is test-only; no nav source edits planned.

## Acceptance
- [x] Focused `app-shell.component.spec.ts` passes.
- [x] Two count expectations/comments pin actual filtered quicknav lists.
- [x] Product nav behavior unchanged.
- [x] Final NX build passes.

## Preflight Check Output
- Context: `frontend-nx/apps/kppdf-web/src/app/layout/app-shell.component.spec.ts`, `frontend-nx/apps/kppdf-web/src/app/layout/nav-categories.ts`, `frontend-nx/apps/kppdf-web/src/app/layout/app-shell.component.ts`.
- Constraints: update assertions only; no new nav sections.
- Validation: focused Jest, then NX build as last gate.

## Integrity slot
- [x] Type = test-only.
- [x] FIC/page/domain/readiness/coupling = N/A.
- [x] Foreign WIP excluded.

## Gates
- Focused `app-shell.component.spec.ts`: PASS — 29/29.
- Focused ESLint: PASS — 0 errors / 19 existing warnings.
- `nx build kppdf-web`: PASS; final gate.
- `NAV_CATEGORIES` and product nav source unchanged.
