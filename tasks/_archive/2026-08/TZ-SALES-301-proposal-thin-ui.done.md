# TZ-SALES-301 — КП (Коммерческие Предложения), thin UI — DONE

```
ARCHIVE_MARKER: TZ-SALES-301-proposal-thin-ui
status: DONE
date: 2026-08-02
executor: buffy
worktree: 221ae09f (branch freebuff/task-221ae09f-…)
source_task: tasks/TZ-SALES-301-proposal-thin-ui.md
related_archive: tasks/_archive/2026-08/TZ-ORDERS-301-quote-to-order-conversion.done.md (successor)
```

## Outcome

Тонкий end-to-end UI для создания/просмотра КП. Первая волна цепочки
`shop-customer-lifecycle` (plan §S1). Иммутабельность КП обеспечена inline-snapshot
`productName/productSku` на момент создания.

**Ключевое решение (аудит перед стартом):** новый `proposal/`-модуль backend **НЕ создавался** —
используется **существующий `QuotationModule`** (`backend/src/modules/quotation/`,
registered `app.module.ts:204`). ТЗ требовало «выбрать один API, не строить UI на дублях».
Фронтенд-обёртка: `frontend/src/app/shared/services/pi-proposals.service.ts` (GET/POST/PATCH/DELETE
`/quotations`, duplicate, convert-to-order). Snapshot-поля `QuotationItem.productName/productSku`
уже существуют и заполняются вербатим из DTO в `create()` — имматабельность без schema-изменений.

## Files (только мои)

- `backend/src/modules/quotation/quotation.service.spec.ts` (NEW) — 12 тестов:
  create snapshot (verbatim), no-mutation-on-catalog-change, auto-number, discount total,
  findAll invalid/filter, findById 404/404/snapshot, update-total, duplicate.
- `frontend/src/app/shared/services/pi-proposals.service.ts` (NEW) + `pi-proposals.service.spec.ts` (8 тестов).
- `frontend/src/app/pages/commercial/proposals/proposals.page.ts` (NEW) — pi-table,
  статус-бейджи, поиск/сортировка/слайс-пагинация.
- `frontend/src/app/pages/commercial/proposals/proposal-form-dialog.component.ts` (NEW) —
  variant="form" lg, sticky footer (PiDialog contract), стороны + реквизиты + позиции (snapshot) + заметки.
- `frontend/src/app/pages/commercial/proposals/proposals.page.spec.ts` (NEW) — 10 тестов.
- `frontend/src/app/app.routes.ts` — route `/proposals` (adminOnlyRouteGuard).
- `frontend/src/app/layout/app-layout.component.ts` — nav «Сделки → КП».
- `docs/pages/proposals.page.md` (NEW).

## Gates (все зелёные)

| Gate | Результат |
|---|---|
| backend tsc -p tsconfig.build.json --noEmit | exit 0 |
| backend jest quotation --no-coverage | 12/12 PASS |
| frontend tsc -p tsconfig.app.json --noEmit | exit 0 |
| jest proposals pi-proposals --no-coverage | 18/18 PASS |
| ng build --configuration=development | exit 0 |
| git diff --check (staged) | clean |
| OrchestratorKit/verify-status.sh | PASS |

## Scope before/after

- **Before:** КП в UI отсутствовали; quotation backend существовал (CRUD + convert), но без
  UI-обёртки и без unit-тестов.
- **After:** страница КП + форма + сервис + тесты (backend 12, frontend 18); route + nav + docs.
- **Не входило:** convert-to-order UI-кнопка (TZ-ORDERS-301), strip-commerce (TZ-ORDERS-301),
  convert-тесты (добавлены в TZ-ORDERS-301, тот же spec-файл).

## Known limitations

- Backend GET /quotations возвращает плоский массив (без envelope) — страница владеет
  search/sort/paginate (паттерн OrdersPage). Пагинация клиентская, N>100 — вне скоупа (данных мало).
- Диалог — variant="form" (640px), не content 1000px (ТЗ 301 не требовало; 302-паттерн не применялся).
- `unitPrice` в КП остаётся коммерческим полем КП — strip только при конверсии в Order (ORDERS-301).

## Commit hashes

- feat: `f7083169b9e0bc75ae9eac84e945e4133851133d`
- closeout: `<closeout-sha>` (заполняется после коммита)

## Successor

- **TZ-ORDERS-301** — quote → order conversion (кнопка «В заказ» на proposals page,
  strip-commerce, guard accepted) — разблокирован (требует SALES-301 UI-обёртку).
- Далее: TZ-INVENTORY-301 / TZ-PRODUCTION-301 (downstream chain).

## Push

Нет (worktree convention; merge в main — PO/merge-agent).
