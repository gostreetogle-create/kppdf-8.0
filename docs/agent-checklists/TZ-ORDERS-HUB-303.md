# TZ-ORDERS-HUB-303 checklist

> Status: **READY FOR REVIEW**
> Marker: `tasks/_active/TZ-ORDERS-HUB-303.md` (keep until Cursor PASS)
> Deploy: NO

## Claim slot

- agent_id: Buffy (Cursor Product Executor)
- claimed_at: 2026-08-15T11:26:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable

## Prep done (docs-only; orders.page was HUB-302)

- [x] `docs/pages/supply.page.md` — query `orderId` contract
- [x] `docs/pages/production-cockpit.page.md` — `orderId` route contract
- [x] TZ file `tasks/TZ-ORDERS-HUB-303-supply-production-docs.md`
- [x] `PAGE-TZ-INDEX` — production + supply hub refs
- [x] HUB-302 archive DONE on main — FE may CLAIM

## Acceptance (FE)

- [x] Expand блок Снабжение: lazy `GET /supply-tasks?orderId=<Order._id>`, счётчики, error isolation
- [x] `/supply?orderId=` фильтрует страницу
- [x] `/production?orderId=` выбирает заказ; unknown id safe
- [x] Документы → `/doc-constructor/templates?source=order&sourceId=`
- [x] ≤4 HTTP / expand (supply = 1 lazy GET)
- [x] Gates: tsc + jest orders|supply|production-cockpit
- [x] Quality score ≥97

## Integrity

- [x] page docs prep; PAGE-TZ-INDEX hub refs
- [x] foreign WIP excluded (layout/products/AUTH not staged)

## Gates

- [x] `pnpm exec tsc -p tsconfig.app.json --noEmit` — PASS
- [x] `pnpm exec jest --testPathPattern='orders.page|supply.page|production-cockpit'` — 17/17 PASS

## Quality score

- self_score: **98**
- reviewer_score: _(ожидает Cursor PASS)_

## Review handoff

- [x] CLAIM FE — Buffy 2026-08-15T11:26:00Z
- [x] **READY FOR REVIEW**
- [ ] **Не** archive до Cursor Verdict PASS

## Executor report (auto)

- status: READY FOR REVIEW
- feat_sha: 9eed2860ddadbc4b1daf8d8176dd7345784f3faf
- gates: tsc PASS; jest orders 13/13 + supply 2/2 + production-cockpit 2/2 = 17/17 PASS
- scope: orders expand supply/production/docs blocks; supply `?orderId=` filter chip; production `?orderId=` deep-link + unknown hint; focused specs
- excluded: HUB-304 reservations/shipping; BE; deploy; foreign layout/CATALOG WIP
- ask: Cursor architect verdict → archive + lock

## Closeout (после PASS)

- [ ] archive + lock + remove `_active`
- closed_at: _
