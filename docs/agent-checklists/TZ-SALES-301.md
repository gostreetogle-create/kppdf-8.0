# TZ-SALES-301 — КП (коммерческие предложения), thin UI

## Verification log

**Дата:** 2026-08-02. **Executor:** buffy. **Worktree:** 221ae09f.

### Решение по API (audit before start)
- Новый `proposal/`-модуль backend **НЕ создавался** — используется существующий
  `QuotationModule` (`backend/src/modules/quotation/`, registered `app.module.ts:204`).
  Один API, без дублей (ТЗ: «выбрать один API»). Фронт-обёртка: `pi-proposals.service.ts`.
- Снапшот-поля `QuotationItem.productName/productSku` уже есть и заполняются вербатим
  из DTO при `create()` — имматабельность §S1 соблюдена без schema-изменений.

### Что сделано
- Backend: `quotation.service.spec.ts` (NEW, 12 тестов) — create snapshot,
  no-mutation-on-catalog-change, list/get, update-total, duplicate.
- Frontend: `pi-proposals.service.ts` (+spec 8 тестов), `proposals.page.ts`
  (pi-table: номер/дата/контрагент/статус-бейдж/позиций/сумма; поиск, сортировка,
  слайс-пагинация), `proposal-form-dialog.component.ts` (variant="form" lg, sticky footer,
  стороны + реквизиты + позиции + заметки), `proposals.page.spec.ts` (10 тестов).
- Route `/proposals` (adminOnlyRouteGuard) + nav «Сделки → КП».

### Гейты
| Gate | Результат |
|---|---|
| backend tsc -p tsconfig.build.json --noEmit | exit 0 |
| backend jest quotation --no-coverage | 12/12 PASS |
| frontend tsc -p tsconfig.app.json --noEmit | exit 0 |
| jest proposals pi-proposals --no-coverage | 18/18 PASS |
| ng build --configuration=development | exit 0 |
| git diff --check (staged) | clean |
| OrchestratorKit/verify-status.sh | PASS |

## Executor report (auto) — TZ-SALES-301
- status: DONE
- commits: f7083169b9e0bc75ae9eac84e945e4133851133d + aa6f4cd57a72ef8cb67ac2584cd9fc7746895a27
- gates: backend-tsc=PASS; quotation-jest=12/12; frontend-tsc=PASS; proposals-jest=18/18; ng-build=PASS; diff-check=clean; verify-status=PASS
- known: quotation module bootstrapped earlier — reused as single КП API (no duplicate module); unitPrice DTO правка — TZ-ORDERS-301 (вне этой TZ)
- ask: ORDERS-301 разблокирован (кнопка «В заказ», strip-commerce)
