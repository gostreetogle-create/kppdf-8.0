# TZ-NX-CONSTRUCTOR-PLACEHOLDER-FIX checklist

> Status: **DONE**
> Marker: archived as `tasks/_archive/2026-08/TZ-NX-CONSTRUCTOR-PLACEHOLDER-FIX.done.md`

## Claim slot

- agent_id: cursor
- claimed_at: 2026-08-29T21:25:00+03:00
- workspace: D:\kppdf-8.0

## Acceptance

- [x] Back button navigates to `/constructor` (no `<a><app-pi-button>` nesting)
- [x] Unknown-kind section has valid `aria-labelledby`
- [x] Click → navigation unit test
- [x] `constructor-create-placeholder-a11y.spec.ts` (known + unknown kind)
- [x] Gates PASS
- [x] Archive + Integrity slot

## Integrity slot

- [x] `constructor.page.md` test list updated

## Gates

- [x] `pnpm exec nx build kppdf-web` — PASS
- [x] `pnpm exec nx test kppdf-web` — PASS
- [x] `pnpm exec nx run-many -t lint --all` — PASS (0 errors)
- [x] `pnpm run architecture:check:nx` — PASS
- [x] `pnpm run ui:tokens:nx` — PASS

## Closeout

- [x] archive `tasks/_archive/2026-08/TZ-NX-CONSTRUCTOR-PLACEHOLDER-FIX.done.md`
- [x] remove `tasks/_active/TZ-NX-CONSTRUCTOR-PLACEHOLDER-FIX.md`
- closed_at: 2026-08-29T21:27:00+03:00

**Outcome: PASS.**
