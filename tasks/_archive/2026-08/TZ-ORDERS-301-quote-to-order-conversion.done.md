# TZ-ORDERS-301 — quote → order conversion (strip-commerce) — DONE

```
ARCHIVE_MARKER: TZ-ORDERS-301-quote-to-order-conversion
status: DONE
date: 2026-08-02
executor: buffy
worktree: 221ae09f (branch freebuff/task-221ae09f-…)
source_task: tasks/_backlog/TZ-ORDERS-301-quote-to-order-conversion.md
related_archive: tasks/_archive/2026-08/TZ-SALES-301-proposal-thin-ui.done.md (dependency)
```

## Outcome

Заказ создаётся ТОЛЬКО из ПРИНЯТОГО КП и НЕ наследует коммерческие поля
(price/total/discount) — strip-commerce манифест (plan §S2). Копируются:
FK `productId` (идентификатор иммутабелен), inline snapshot `productName/productSku`
(переживает переименование/soft-delete товара), `quantity/unit`, реквизиты.
Заказ создаётся в `draft`; КП помечается `converted` + `convertedOrderId`.

## Files (только мои)

Backend:
- `backend/src/modules/quotation/quotation.service.ts` — convertToOrder: guard `accepted`
  (BadRequestException) + strip unitPrice (комментарий COPY/SNAPSHOT/DROP).
- `backend/src/modules/order/order.service.ts` — update() блок после
  `in_production/ready/shipped/delivered/cancelled`; create() `unitPrice: i.unitPrice ?? 0`.
- `backend/src/modules/order/dto/create-order.dto.ts` — `OrderItemDto.unitPrice` → `@IsOptional`.
- `backend/src/modules/quotation/quotation.service.spec.ts` — +4 convert-теста
  (reject non-accepted ×4 статуса, reject converted, strip-commerce payload, converted+orderId).
- `backend/src/modules/order/order.service.spec.ts` (NEW) — 11 тестов
  (create number/total/strip/snapshot, findAll invalid/filter, findById 404×2,
  update frozen-matrix ×5 + allowed draft, remove soft-delete).

Frontend:
- `frontend/src/app/pages/commercial/proposals/proposals.page.ts` — колонка «В заказ»
  (key `convertedOrderId` — ColumnDef.key типизирован `keyof Proposal`),
  `canConvertToOrder` (accepted-only), `onConvertToOrder` (confirm → convertToOrder → toast + reload).
- `frontend/src/app/pages/commercial/proposals/proposals.page.spec.ts` — +5 тестов.

## Gates (все зелёные)

| Gate | Результат |
|---|---|
| backend tsc -p tsconfig.build.json --noEmit | exit 0 |
| backend jest quotation order --no-coverage | 27/27 PASS |
| frontend tsc -p tsconfig.app.json --noEmit | exit 0 |
| jest proposals pi-proposals --no-coverage | 23/23 PASS |
| ng build --configuration=development | exit 0 |
| git diff --check (staged) | clean |
| OrchestratorKit/verify-status.sh | PASS |

## Scope before/after

- **Before:** convertToOrder копировал unitPrice (коммерция утекала в заказ), работал из
  любого статуса, order.update() не блокировался.
- **After:** accepted-guard, strip-commerce, frozen-order guard, DTO unitPrice optional,
  UI-кнопка «В заказ» (только accepted), convert-тесты + order spec.
- **Не входило:** production-флоу (TZ-PRODUCTION-*), availability (TZ-INVENTORY-*),
  orders page (не трогалась — конверсия живёт на proposals page).

## Known limitations (reviewer + architecture)

1. **convertToContract asymmetry** (`quotation.service.ts:187`): по-прежнему копирует
   unitPrice в договор и не имеет guard `accepted`. Pre-existing, вне скоупа ORDERS-301
   (контрактная конверсия — отдельная зона); зафиксировано для successor.
2. **Frozen-guard gap** (`order.service.ts:update`): guard блокирует PATCH, когда ТЕКУЩИЙ
   статус заморожен, но draft/confirmed можно напрямую перевести в `in_production` через
   `dto.status`, минуя production-флоу. Соответствует формулировке ТЗ («update blocked after
   in_production»); флаг для TZ-PRODUCTION-301.
3. **ТЗ item «list/get scoped by org + createdAt»** покрыт архитектурно, а не в service:
   org-scope — `OrgScopeGuardInterceptor`/`@RequireOrgScope`, сортировка — `{date:-1}`.
   Spec'ы покрывают counterparty/status фильтры. Disclose для PO spot-check.
4. Frontend-тесты по факту на proposals page (orders page не менялась): page+service 23 теста
   (≥8 по ТЗ — перекрыто).

## Commit hashes

- feat: `4e037736600a1e87892690c35cf9183de60cc546`
- closeout: `566de7d5418389019ddeca2b08e6e278fbe7d43c`

## Successor

- **TZ-INVENTORY-301** — availability check on order (разблокирован).
- **TZ-PRODUCTION-301** — design verification flow + frozen-guard доработка (разблокирован).
- Цепочка: SALES-301 → ORDERS-301 → INVENTORY-301 → PRODUCTION-301 (shop-customer-lifecycle).

## Push

Нет (worktree convention; merge в main — PO/merge-agent).
