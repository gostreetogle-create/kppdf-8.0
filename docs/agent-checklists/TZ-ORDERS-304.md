# TZ-ORDERS-304 checklist

> Status: **DONE** · Wave: SHOP-NORTH-B
> Source: `tasks/_backlog/shop-north-b/`

## Claim slot
- agent_id: Buffy / agent-3e757640b7
- claimed_at: 2026-08-08T11:05:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable — Team Room task registry has no TZ-ORDERS-304 entry

## Conflict check
- [x] Canonical workspace is `D:\kppdf-8.0` on `main`.
- [x] `tasks/_active/` checked; no peer conflict on order/** or orders/**.
- [x] Desktop/TZD, Gantt, production-cockpit, and composition-tree implementation excluded.

## Acceptance
- [x] readyForWork/readyAt/readyByUserId persisted on order lines.
- [x] PATCH line readiness independently of whole order.
- [x] `/orders/:id` shows and toggles line readiness; reload preserves it.
- [x] BE+FE tsc, targeted tests, and ESLint PASS.
- [x] Archive + lock + commit/push → next in WAVE.

## Gates (fact)
- PASS `pnpm --dir backend exec tsc -p tsconfig.build.json --noEmit`
- PASS `pnpm --dir backend exec jest src/modules/order/order.service.spec.ts --runInBand --no-coverage` — 14/14
- PASS `pnpm --dir backend exec eslint 'src/modules/order/**/*.ts'`
- PASS `pnpm --dir frontend exec tsc -p tsconfig.app.json --noEmit`
- PASS `pnpm --dir frontend exec jest src/app/pages/orders/order-detail.page.spec.ts src/app/pages/orders/orders.service.spec.ts --runInBand --no-coverage` — 9/9
- PASS targeted frontend ESLint
- PASS `git diff --check`

## Closeout
- archive: `tasks/_archive/2026-08/TZ-ORDERS-304.done.md`
- lock: `.mimocode/locks/TZ-ORDERS-304-line-ready.lock`
- progress: updated
- active marker: removed after archive
