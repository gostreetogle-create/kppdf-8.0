# TZ-UX-305 — Nav equal width full labels

**TZ:** `tasks/_archive/2026-08/TZ-UX-305-nav-equal-width.done.md`  
**Status:** DONE

## Claim slot

- agent_id: agent-3e757640b7 (cursor-composer)
- claimed_at: 2026-08-08T08:30:27Z
- closed_at: 2026-08-08T08:35:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Unknown task; announce sent)

## Preflight

- [x] Conflict: ADMIN-302 = admin/** only — layout free
- [x] Claim before code
- [x] NOT touching admin/**

## Acceptance

- [x] Full RU labels; equal button widths
- [x] tsc + nav-order; archive; push

## Gates (факт)

- `pnpm exec jest src/app/layout/app-layout.nav-order.spec.ts` → PASS 2/2
- `pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS (peer admin WIP isolated for gate)

## Executor report

- Grid equal columns from longest label; dropped shortLabel primary; dropdown host contents.
- Deploy: NO

## Closeout

- [x] archive + lock + progress + remove `_active`
- Status: DONE
