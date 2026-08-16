# LEDGER-06 — Production
date: 2026-08-16T16:35:00+03:00
agent: Buffy (freebuff)

## Score (0–100)
overall: 92
subscores:
  evidence_quality: 93
  sync_code_docs: 92
  risk_holes: 90

## What I opened (paths)
- docs/pages/production-cockpit.page.md — Couplings, activeOnly, write-path matrix, known limitations
- frontend/src/app/pages/production/gantt-bar.model.ts — ACTIVE_COMMERCIAL_ORDER_STATUSES (L15–19), filterOrdersForRail (L818+)
- frontend/src/app/pages/production/gantt-bar.model.spec.ts — пины статусов (L24)
- frontend/src/app/pages/production/blocks/orders-rail.component.ts — selectedOrderId bypass (L255/267)
- tasks/_archive/2026-08/TZ-PRODUCTION-337.done.md — outcome, known_limitation, verification (3 suites/53 tests, deploy NOT RUN)

## PASS evidence
- **Active filter = канон:** ACTIVE = `confirmed`/`in_production`/`ready` без `draft`; spec пинит ровно этот набор; `filterOrdersForRail(activeOnly:true)` исключает draft и `isActive===false`. Совпадает с COUPLING-MAP §2, dashboard/orders page.md и PRODUCTION-337.done (Cursor PASS, commit 6e6b492).
- **Selected bypass документирован:** `orders-rail.component.ts` передаёт `selectedOrderId` в filterOrdersForRail → выбранный остаётся в rail вне активных; deep-link `?orderId=` → `ctx.selectOrder(id)` + RU hint/fallback «все активные» (page.md L37). known_limitation про draft-?orderId была в архиве и _NOW.
- **known limits записаны:** page.md Known limitations (keyboard 310+, no assign writes/ProductionSchedule, workers re-seed, deep BOM, Zoom Месяц, 333/335 catalog reload, plan-vs-fact parked) + «fact production OUT».
- **Gates:** jest gantt-bar.model 25 PASS (LEDGER-02) + orders-rail 7 PASS = 32 теста зелёные.

## FINDINGS
| id | sev | area | repro/proof | action |
|----|-----|------|-------------|--------|
| F-01 | P3 | page.md | known_limitation «deep-link ?orderId= на draft показывает выбранный (selected bypass)» отсутствовала в production-cockpit.page.md (была только в archive/_NOW) | **FIXED** — строка добавлена в Known limitations (docs-only, 1 файл, не чужой WIP) |
| F-02 | P3 | deep-link doc | `?orderId=` на draft: код показывает заказ (bypass), страница теперь явно это фиксирует; сам bypass не чиним (осознанный, TZ-PRODUCTION-337) | accept (documented) |

## TZ drafted (if any)
- Нет

## Confidence note for Cursor
- Production cockpit: активный фильтр, freeze write-path и known limits согласованы doc↔code; 32 focused теста зелёные.
- Не проверял: живое поведение Ганта с реальной Mongo (browser smoke вне lane); deep BOM «изделие→изделие» остаётся known_limitation.
- F-01 починен локально; diff — одна строка в page.md.
