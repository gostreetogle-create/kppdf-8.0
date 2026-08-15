# TZ-PRODUCTION-STUDIO-B checklist

> Status: **DONE**  
> Archive: `tasks/_archive/2026-08/TZ-PRODUCTION-STUDIO-B.done.md`

## Claim

- agent_id: Buffy / Freebuff continuation
- claimed_at: 2026-08-15
- workspace: current shared checkout
- scope: frontend shell only

## Preflight

- [x] Wave A archived.
- [x] SoT and B TZ read.
- [x] Conflict keys claimed.
- [x] Product ban read: no facade/context/estimate/backend changes.

## Acceptance

- [x] Wrap `/production` in `PiGroupWorkspace`, `flushBody=true`.
- [x] Use `PRODUCTION_SECTION_CHIPS`; no duplicate local section chips/path label.
- [x] Add local `leftTool` / `rightTool` state and one-flyout invariant.
- [x] Do not pass rails/Gantt/inspector/context/facade into `PiGroupWorkspace`.
- [x] Keep docked rail/toolbar behavior 1:1 until C.
- [x] Preserve `?orderId=`, unknown hint, filters, zoom, refresh, inspector read-only.
- [x] Unit test local state invariant.
- [x] Update page doc and master resume slot.

## Gates

- [x] `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` — PASS.
- [x] `cd frontend && pnpm exec jest src/app/pages/production --runInBand --no-coverage` — 21/21 PASS.
- [x] Prettier PASS; ESLint 0 errors, one pre-existing OnInit architecture warning.
- [x] `git diff --check` — PASS.
- [x] No backend or estimate-model diff.

## Closeout

Wave B behavior-preserving shell is DONE. Visual migration was completed by C.

- [x] READY FOR REVIEW.
- [x] Archive + active marker removed.
