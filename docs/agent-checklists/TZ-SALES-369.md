# TZ-SALES-369 checklist

> Status: **DONE**
> Marker: archived `tasks/_archive/2026-08/TZ-SALES-369.done.md`

## Claim slot

- agent_id: composer-executor-369
- claimed_at: 2026-08-17T00:10:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable

## Acceptance

- [x] Нет download КП с `download.pdf` / blob / без номера
- [x] FE tsc + jest PASS
- [x] page.md one-liner

## Gates (факт)

- `pnpm exec tsc -p tsconfig.app.json --noEmit` — PASS
- `pnpm exec jest kp-pdf-filename.spec.ts proposals.page.spec.ts -t TZ-SALES-369` — PASS (5 tests)
- `pnpm exec jest kp-pdf-filename.spec.ts` (backend) — PASS (4 tests)

## Executor report

Shared helpers; create page draft naming fixed; BE Content-Disposition unified. No other PDF download paths.

## Closeout

- closed_at: 2026-08-17T00:15:00+03:00
