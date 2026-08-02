# TZ-ORDERS-301 — quote → order conversion (strip-commerce)

## Verification log

**Дата:** 2026-08-02. **Executor:** buffy. **Worktree:** 221ae09f.

### Что сделано (backend)
- `quotation.service.ts convertToOrder()`: guard `status === 'accepted'`
  (иначе `BadRequestException`; `converted` → `NotFoundException` как раньше);
  **strip-commerce**: order items копируют FK `productId` + inline snapshot
  `productName/productSku`, `unitPrice`/`total`/`discount` НЕ копируются.
- `order.service.ts update()`: блокирует PATCH для
  `in_production/ready/shipped/delivered/cancelled` (`BadRequestException`);
  `create()` маппит `unitPrice: i.unitPrice ?? 0`.
- `create-order.dto.ts`: `OrderItemDto.unitPrice` → `@IsOptional`.
- Spec'ы: `quotation.service.spec.ts` +4 convert-теста; `order.service.spec.ts` NEW (11 тестов).

### Что сделано (frontend)
- `proposals.page.ts`: колонка «В заказ» (key `convertedOrderId`),
  `canConvertToOrder(row)` (только `accepted`), `onConvertToOrder` —
  confirm-диалог → `ProposalsService.convertToOrder` → toast + reload.
- `proposals.page.spec.ts` +5 тестов (матрица canConvert, early-return,
  dialog open, confirmed flow, failure toast).

### Гейты
| Gate | Результат |
|---|---|
| backend tsc -p tsconfig.build.json --noEmit | exit 0 |
| backend jest quotation order --no-coverage | 27/27 PASS |
| frontend tsc -p tsconfig.app.json --noEmit | exit 0 |
| jest proposals pi-proposals --no-coverage | 23/23 PASS |
| ng build --configuration=development | exit 0 |
| git diff --check (staged) | clean |
| OrchestratorKit/verify-status.sh | PASS |

## Executor report (auto) — TZ-ORDERS-301
- status: DONE
- commits: 4e037736600a1e87892690c35cf9183de60cc546 + <closeout SHA pending>
- gates: backend-tsc=PASS; quotation/order-jest=27/27; frontend-tsc=PASS; proposals-jest=23/23; ng-build=PASS; diff-check=clean; verify-status=PASS
- known: convertToContract asymmetry (копирует unitPrice, без guard accepted — out-of-scope); frozen-guard не блокирует PATCH draft→in_production напрямую (флаг для TZ-PRODUCTION); org-scope/createdAt — interceptor/сортировка, не в service (disclose)
- ask: TZ-INVENTORY-301 / TZ-PRODUCTION-301 разблокированы
