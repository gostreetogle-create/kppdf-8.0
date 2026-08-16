# LEDGER-02 — Coupling Order.status
date: 2026-08-16T15:35:00+03:00
agent: Buffy (freebuff)

## Score (0–100)
overall: 91
subscores:
  evidence_quality: 95
  sync_code_docs: 88
  risk_holes: 90

## What I opened (paths)
- docs/COUPLING-MAP.md — §2 Order.status канон, §3 поля, §4 экран→поля
- frontend/src/app/pages/production/gantt-bar.model.ts — ACTIVE_COMMERCIAL_ORDER_STATUSES (L15–19), isHardFrozenOrderStatus, filterOrdersForRail (L818+)
- frontend/src/app/pages/production/gantt-bar.model.spec.ts — spec-пины статусов (L24)
- backend/src/modules/order/order.service.ts — assertOrderStatusTransition (L404+), update(), ship() (L535+), HARD_FROZEN (L26)
- backend/src/modules/order/order.controller.ts — PATCH :id (L167), POST :id/ship (L173), POST :id/cancel (L192)
- backend/src/modules/order/order.service.spec.ts — «BLOCKS PATCH to shipped/delivered/cancelled» (L333), «BLOCKS composition updates once in_production/ready/shipped/…» (L285)
- docs/pages/dashboard.page.md — couplings: draft ≠ работа цеха
- docs/pages/production-cockpit.page.md — couplings: «Все активные» = confirmed/in_production/ready

## PASS evidence
- Код = канон: `ACTIVE_COMMERCIAL_ORDER_STATUSES = ['confirmed','in_production','ready']` (gantt-bar.model.ts L15) — без `draft`; совпадает с COUPLING-MAP §2 и обоими page.md. Spec L24 пинит именно этот набор.
- PATCH-граф статуса: `assertOrderStatusTransition` разрешает только draft↔confirmed↔in_production↔ready; `HARD_FROZEN.has(to)` → RU 400 «Отгрузка — через действие „Отгрузить"; отмена — „Отменить заказ"» — точно как в COUPLING-MAP §2 («shipped только POST ship»).
- `POST /orders/:id/ship` (создаёт Shipment, atomic Z-001) и `POST /orders/:id/cancel` существуют в контроллере; ship не через PATCH — доказано spec (L333 «no mutation»).
- FE hard-freeze (`isHardFrozenOrderStatus` = shipped/delivered/cancelled) совпадает с backend `HARD_FROZEN` и doc-ом production-cockpit («shipped/delivered/cancelled — hard read-only»).
- filterOrdersForRail: `activeOnly` использует isActiveCommercialOrderStatus + `isActive===false` исключение — соответствует §2.
- Gate: `jest gantt-bar.model` → 25/25 PASS.

## FINDINGS
| id | sev | area | repro/proof | action |
|----|-----|------|-------------|--------|
| F-01 | P2 | COUPLING-MAP §2/§4 | Шапка колонки «Комбайн `/dashboard`» и §4 «Комбайн \| `/` → `/dashboard`» — устарели: NAV-303 перенёс канбан на `/design/combine`, `/dashboard` теперь «Обзор» (dashboard.page.md). Файл = foreign WIP (M, NAV-303) | fix-now после land NAV-303 (владелец или TZ-OPS-313-подобный docs-fix) |
| F-02 | P3 | COUPLING-MAP §3 | `OrderItem.status` row: «карточка Комбайна „X из Y"» — у Комбайна `/design/combine`; формула на `/orders` hub = `readyForWork`, не item.status (orders.page.md) — разделение уже описано, но Комбайн-route устарел | с F-01 |

## TZ drafted (if any)
- Нет (требует land NAV-303; COUPLING-MAP = чужой WIP — не чиню сам)

## Confidence note for Cursor
- Ядро канона (ACTIVE без draft, PATCH-граф, ship/cancel отдельно) подтверждено кодом + spec + jest — сильная связка.
- COUPLING-MAP отстаёт от NAV-303 только в route-лейблах Комбайна; после Cursor PASS NAV-303 карту надо обновить (1 строка).
- Не проверял: реальное поведение Комбайна на /design/combine (read-only lane; глубокий run — SITE-SMOKE/DeepC).
