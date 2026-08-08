# TZ-COST-302 checklist

> Status: **DONE**
> Marker: archived — `tasks/_archive/2026-08/TZ-COST-302.done.md`
> TZ: `tasks/_backlog/cost/TZ-COST-302-recursive-cost-rollup.md`
> Commit/push: YES (PO 2026-08-08 Cursor PASS → archive)
> Аудит: `docs/audits/2026-08-08-catalog-cost-pricing-hierarchy.md`
> READY FOR REVIEW: 2026-08-07T23:58:00Z
> closed_at: 2026-08-08T00:15:00Z

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: cursor-composer-cost302
- claimed_at: 2026-08-07T23:52:48Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Unknown task: TZ-COST-302; sync tasks first)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_active-map.md` + `tasks/_active/` — пуст до CLAIM; нет чужого CLAIM на cost-calculation
- [x] TZ / аудит / deps (301 DONE) прочитаны
- [x] Claim slot заполнен; Status = CLAIMED → READY FOR REVIEW → DONE
- [x] `tasks/_active/TZ-COST-302.md` (removed at archive)

## Acceptance

- [x] Рекурсия nested `lineType=module` × qty; цикл → skip + warn в `infos` (не 500)
- [x] `activate` пишет `Product.costPrice = doc.totalCost`
- [x] Overhead канон A (только от materials) в коде + ARCHITECTURE
- [x] `GET /api/modules/:id/cost-preview` read-only тем же walk
- [x] FE module-detail: блок «Себестоимость (расчёт)» read-only
- [x] unit tests nested module×qty + activate costPrice + preview no journal
- [x] tsc backend + FE module page
- [x] Cursor PASS → archive

## Gates (факт)

- [x] `npx jest cost-calculation.service.spec + product-module.service.spec` → **14/14 PASS**
- [x] `npx tsc -p tsconfig.build.json --noEmit` (backend) → **PASS**
- [x] `npx tsc -p tsconfig.app.json --noEmit` (frontend) → **PASS**

## Executor report

- BE `CostCalculationService`: recursive `walkModule`; cycle → `infos[]`; overhead A helper; `activate` → `Product.costPrice`.
- Schema: `infos?: string[]`.
- `GET /modules/:id/cost-preview` via ProductModuleController → CostCalculationService.previewModuleCost (no POST journal).
- FE: section V read-only на module-detail (local ModuleCostPreview type; httpResource).
- ARCHITECTURE: overhead canon A + recursive/activate/preview one-liner.
- Conflict disclosure: peer TZD-22 disjoint keys (desktop); **not staged** desktop / FE lists chrome / pi-product-modules.service WIP.
- known_limitation: module preview total = materials+labor (no product overhead %); product→product PARK; COST-303 only on PO.

## Review handoff

- [x] READY FOR REVIEW
- [x] Cursor Verdict PASS → archive

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-08T00:15:00Z

## Executor report (auto)

- commit: PENDING
