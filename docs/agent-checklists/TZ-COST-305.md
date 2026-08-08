# TZ-COST-305 — Product-line in CostCalculation + picker

**TZ:** `tasks/_backlog/cost/TZ-COST-305-product-line-in-cost.md`  
**Status:** RESERVED (не CLAIM — ждать слот после 336/335 или PO)  
**Canon:** `docs/audits/2026-08-09-product-line-cost-vs-override.md`

## Claim slot

- agent_id: _(empty until claim)_
- claimed_at: —
- workspace: D:\kppdf-8.0
- team_room_claim: —

## Preflight

- [ ] Get-Location + git rev-parse → `D:\kppdf-8.0`
- [ ] `_active-map` + `_active/` — нет конфликта с cost-calculation / picker
- [ ] Audit 2026-08-09 D1–D5 прочитаны
- [ ] Claim slot заполнен; Status = CLAIMED
- [ ] `tasks/_active/TZ-COST-305.md` на месте

## Acceptance

- [ ] product-line+override входит в totalCost
- [ ] fallback child.costPrice; none → 0+info
- [ ] overhead без product-line base
- [ ] Picker RU + prefill; tests + tsc PASS
- [ ] Docs + archive

## Gates (факт)

_(fill)_

## Executor report (auto)

_(fill on DONE)_
