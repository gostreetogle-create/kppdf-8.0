# LEDGER-05 — Deals / orders write-path
date: 2026-08-16T16:20:00+03:00
agent: Buffy (freebuff)

## Score (0–100)
overall: 88
subscores:
  evidence_quality: 90
  sync_code_docs: 92
  risk_holes: 84

## What I opened (paths)
- docs/pages/dashboard.page.md — Couplings: Order.status (draft ≠ цех), stub Обзор
- docs/pages/orders.page.md — lifecycle hub, freeze, stub-proposal, write-path
- docs/pages/design-combine.page.md — канбан канон статусов (TZ-SWEEP-401)
- docs/pages/proposals-create.page.md — studio autosave draft, freeze (336), convert paths
- backend/src/modules/order/order.service.ts — create() (L90), update()+freeze (L425–500), ship() (L535+), assertOrderStatusTransition (L404)
- backend/src/modules/order/dto/create-order.dto.ts — status enum (L68–73)
- backend/src/modules/order/order.controller.ts — PATCH :id / POST ship / cancel / reserve-stock
- backend/src/modules/quotation/quotation.service.ts — freeze (L235), convertToOrder (L830, only ACCEPTED)
- backend/src/modules/quotation/quotation.controller.ts — freeze/convert-to-order/convert-to-contract
- frontend/src/app/shared/services/pi-proposals.service.ts — freeze/convertToOrder методы

## PASS evidence
- **Один write-path статуса заказа:** PATCH /orders/:id через `assertOrderStatusTransition` (draft↔confirmed↔in_production↔ready; shipped/delivered/cancelled в граф не входят — RU 400). Отгрузка — только `POST /orders/:id/ship` (создаёт Shipment, atomic), отмена — `POST /orders/:id/cancel` (снимает резервы). Второго write-path статуса в коде нет (LEDGER-02 evidence).
- **Freeze задокументирован и в коде:** HARD_FROZEN (shipped/delivered/cancelled) — PATCH только status/materialsSource; PLAN_EDITABLE_FROZEN (in_production/ready) — только status + PLAN_UPDATE_KEYS (plannedDate/priority) — RU сообщения «Заказ в статусе „…" нельзя менять состав — только план/приоритет в Цехе»; совпадает с orders.page.md («freeze: in_production/ready; Save шлёт только plannedDate+priority») и production-cockpit.page.md.
- **КП write-path:** студия autosave пишет draft Quotation (без savebar, TZ-SALES-367); freeze `POST /quotations/:id/freeze`; «В заказ» = `convertToOrder` только для ACCEPTED (L842) + `convert-to-contract`; stub-proposal для прямого заказа идемпотентен. Каталог из КП-студии не мутируется (372 snapshot edit; наценка/НДС — request-only, 331).
- **Карандаш состава на /orders пишет в каталог** (live BOM), не в snapshot Order.items — documented и согласовано (orders.page.md; known_limitation 302).

## FINDINGS
| id | sev | area | repro/proof | action |
|----|-----|------|-------------|--------|
| F-01 | P2 | order create API | `CreateOrderDto.status` enum включает shipped/delivered/cancelled, `create()` берёт `dto.status ?? 'draft'` без transition-проверки → `POST /api/orders {status:'shipped'}` создаёт «Отгружен» заказ без Shipment/audit; такой заказ навсегда в HARD_FROZEN (PATCH из него запрещён). FE всегда шлёт draft — пользовательского бага нет, дыра контракта | TZ (сузить status при create до draft\|confirmed или force draft) |
| F-02 | P3 | freeze consistency | `POST /orders` create-status bypass не покрыт спеками (spec пинит PATCH-блокировки, но не create) | с F-01 |

## TZ drafted (if any)
- tasks/_backlog/TZ-OPS-315-order-create-status.md (F-01)

## Confidence note for Cursor
- Write-path «на глаз» один; freeze трёх уровней совпадает doc↔code; ship/cancel отдельные POST с созданием Shipment.
- F-01 — единственный реальный контрактный риск: create bypass transition graph. Требует решения (сужение DTO), не спешно.
- Не проверял: convertToOrder транзакционность (Z-001) и поведение «В заказ» в UI (read-only lane).
