# TZ-ORDERS-HUB-303 checklist

> Status: **READY** (unblocked by HUB-302 DONE 2026-08-15)
> Prep: page contracts for `/supply?orderId=` + `/production?orderId=` written 2026-08-15
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (заполнить при старте FE)

- agent_id: _
- claimed_at: _
- workspace: D:\kppdf-8.0
- team_room_claim: _

## Prep done (docs-only; orders.page was HUB-302)

- [x] `docs/pages/supply.page.md` — query `orderId` contract
- [x] `docs/pages/production-cockpit.page.md` — `orderId` route contract
- [x] TZ file `tasks/TZ-ORDERS-HUB-303-supply-production-docs.md`
- [x] `PAGE-TZ-INDEX` — production + supply hub refs
- [x] HUB-302 archive DONE on main — FE may CLAIM

## Acceptance (FE)

- [ ] Expand блок Снабжение: lazy `GET /supply-tasks?orderId=<Order._id>`, счётчики, error isolation
- [ ] `/supply?orderId=` фильтрует страницу
- [ ] `/production?orderId=` выбирает заказ; unknown id safe
- [ ] Документы → `/doc-constructor/templates?source=order&sourceId=`
- [ ] ≤4 HTTP / expand
- [ ] Gates: tsc + jest orders|supply|production-cockpit
- [ ] Quality score ≥97

## Review handoff

- [ ] CLAIM FE when executor ready
- [ ] **Не** archive до Cursor Verdict PASS
