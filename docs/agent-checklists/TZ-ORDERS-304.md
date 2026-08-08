# TZ-ORDERS-304 checklist

> Status: **CLAIMED / IN PROGRESS** · Wave: SHOP-NORTH-B
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
- [ ] readyForWork/readyAt/readyByUserId persisted on order lines.
- [ ] PATCH line readiness independently of whole order.
- [ ] `/orders/:id` shows and toggles line readiness; reload preserves it.
- [ ] BE+FE tsc and targeted tests PASS.
- [ ] Archive + lock + commit/push → next in WAVE.
