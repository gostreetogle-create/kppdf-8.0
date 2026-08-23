# TZ-UI-PLUS-604 checklist

> Status: **DONE**
> Marker: archived
> Commit/push: commit only (no push per PO)

## Claim slot

- agent_id: cursor-executor
- claimed_at: 2026-08-23T18:58:55Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable
- closed_at: 2026-08-23T19:04:06Z

## Acceptance

- [x] proposal-form-dialog: + on org + counterparty → FullEditor create → select
- [x] proposal-create-inspector: + on org (keep Открыть) → FullEditor create → select
- [x] Visual: .pi-select-add-btn
- [x] tsc + jest + lint PASS
- [x] Commit message as specified

## Integrity slot

- Type: page (KP form UI)
- FIC: N/A — no new route/permission/module field
- page.md: N/A
- SECTION-READINESS: N/A
- Conflict keys only
- COUPLING-MAP: N/A

## Gates (факт)

- `pnpm exec tsc -p tsconfig.app.json --noEmit` PASS
- `pnpm test -- --testPathPattern=proposal-form-dialog|proposal-create-inspector` PASS 9/9
- scoped eslint PASS

## Executor report

PLUS-604: green + next to blocking party/org selects in form dialog and create inspector; FullEditor reuse; no gold CTA duplicate.
