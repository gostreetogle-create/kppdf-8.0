# TZ-SUPPLY-304 checklist

> Status: **DONE**
> Archive: `tasks/_archive/2026-08/TZ-SUPPLY-304.done.md`
> Design canon PASS: `docs/audits/2026-08-19-supply-quick-order-design-canon.md`

## Claim slot

- agent_id: cursor-orchestrator → executor subagent
- claimed_at: 2026-08-19T15:45:00+03:00
- closed_at: 2026-08-19T18:50:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable

## Preflight

- [x] Get-Location + git rev-parse → D:\kppdf-8.0
- [x] Design canon PASS PO
- [x] TZ read: `tasks/TZ-SUPPLY-304-quick-order-workspace-ui.md`
- [x] Claim slot filled

## Acceptance

- [x] `/supply` default → quick order view
- [x] Row A chips unchanged; Row B «Быстрый заказ | Реестр» + toolbar
- [x] `orderId` preserved quick ↔ registry
- [x] Mock tiles expand-in-row (canon §3–4)
- [x] Desk chip + onOpenSupply navigate
- [x] Registry view = existing table 1:1
- [x] data-test hooks + spec (2 tests min)
- [x] supply.page.md updated

## Gates

```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit  — PASS
cd frontend && pnpm test -- supply --passWithNoTests         — PASS
```

## Review handoff

- [x] READY FOR REVIEW after gates green
- Lock: `.mimocode/locks/TZ-SUPPLY-304-quick-order-workspace-ui.lock`
