# TZ-UX-FACT-303 checklist

> Status: **READY FOR REVIEW** · Wave: SHOP-NORTH-B
> Source: `tasks/_backlog/shop-north-b/TZ-UX-FACT-303-order-detail-facts.md`
> Conflict keys: `frontend/src/app/pages/orders/**`, `frontend/src/app/shared/ui/fact-card/**`, `docs/pages/ui-fact-card.md`

## Claim slot
- agent_id: Buffy (openai/gpt-5.6-luna)
- claimed_at: 2026-08-08T14:25:00Z
- workspace: D:\\kppdf-8.0 main
- team_room_claim: unavailable (task not synced in CLI)

## Acceptance
- [x] Visible FactStack on order detail with number, customer, object, status, materials source and date.
- [x] Raw dense passport text cluster is replaced by shared FactStack cards.
- [x] Money/quotation prices remain absent from order detail composition.
- [x] `docs/pages/ui-fact-card.md` records order adoption.

## Gates
- [x] `pnpm --dir frontend exec tsc -p tsconfig.app.json --noEmit` — PASS
- [x] `pnpm --dir frontend exec jest src/app/pages/orders/order-detail.page.spec.ts --runInBand --no-coverage` — PASS (4 tests)
- [x] Targeted ESLint — PASS
- [x] Targeted Prettier + `git diff --check` — PASS

## Review handoff
- [x] Review PASS: shared FactStack wiring, actions slot selector, no money restoration, scope guard.

## Closeout
- [ ] Archive + lock + progress/checkpoint
- [ ] Commit and push main
