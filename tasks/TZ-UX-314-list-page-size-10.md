# TZ-UX-314: Единый PAGE_SIZE = 10 на рабочих списках

> Перед выполнением: `docs/TZ-AUTHORING.md` (канон имён).  
> PO: «везде десять» — быстрее первая отрисовка списков/карточек.

```
PAGES: /products ; /materials ; /modules ; /organizations ; /orders ; /contracts ; /commercial/proposals ; /people ; /counterparties ; /work-types ; /admin/users ; /admin/roles ; /dictionaries/colors ; /inventory/stock-movements
PAGE_DOCS: products.page.md ; materials.page.md ; contracts.page.md
```

РОЛЬ АГЕНТА: Frontend UI Engineer  
ЗАВИСИМОСТИ: Нет  
LAYER: 3  
CONFLICT KEYS: frontend/src/app/pages/products/products.page.ts; frontend/src/app/pages/materials/materials.page.ts; frontend/src/app/pages/modules/modules.page.ts; frontend/src/app/pages/organizations/organizations.page.ts; frontend/src/app/pages/orders/orders.page.ts; frontend/src/app/pages/contracts/contracts.page.ts; frontend/src/app/pages/commercial/proposals/proposals.page.ts; frontend/src/app/pages/people/people.page.ts; frontend/src/app/pages/counterparties/counterparties.page.ts; frontend/src/app/pages/work-types/work-types.page.ts; frontend/src/app/pages/admin/users-admin.page.ts; frontend/src/app/pages/admin/roles-admin.page.ts; frontend/src/app/pages/dictionaries/color-references.page.ts; frontend/src/app/pages/inventory/stock-movements.page.ts

Проверено: `products.page.ts` PAGE_SIZE=50 (+ server `limit`); `materials` 50; `organizations`/`users-admin`/`roles-admin` 50; `orders`/`contracts`/`proposals`/`people`/`modules`/`work-types` 20; `color-references` pageSize=100; `counterparties` hardcoded pageSize/limit 200; `stock-movements` template `[pageSize]="50"`; docs/templates уже 10.

---

## Domain preflight

| Говорят | Канон |
|---------|--------|
| «карточки / списки / везде десять» | UI `PAGE_SIZE` / table `pageSize` / server `limit` **списка** = **10** |
| Не путать | `limit: 200` в **пикерах/диалогах** (орг, контрагенты, продукты для select) — это не page size списка |
| Не путать | `pageSize: 'A4'` конструктора документов — формат бумаги |
| Не путать | `forms.page.ts` pageSize=5 — demo `/forms`, вне ERP-потока |

Кардинальность: 1 страница списка → ровно **10** видимых строк/карточек (если total ≥ 10); pager остаётся.

---

## ИСХОДНОЕ СОСТОЯНИЕ

1. Рабочие списки имеют разные дефолты (20 / 50 / 100 / 200) → тяжёлая первая загрузка (особенно `/products` grid с витриной).
2. `/doc-constructor/documents` и `/templates` уже `PAGE_SIZE = 10` — не трогать логику, только не разъехаться.
3. Часть страниц пагинирует на сервере (`limit: PAGE_SIZE`), часть — client-slice после большой выборки (`people` limit 100, `counterparties` limit 200).

---

## ЧТО ДЕЛАТЬ

### ШАГ 1 — Константы PAGE_SIZE → 10

Во всех файлах из CONFLICT KEYS, где есть `const PAGE_SIZE = 20|50` или `pageSize = 100` / `[pageSize]="50"` / `[pageSize]="200"`:

- выставить **`10`**;
- server-list params, которые уже берут `PAGE_SIZE`, подтянутся сами (`products`, `materials`, `organizations`, admin users/roles).

### ШАГ 2 — Заказчики (`counterparties`) без потери строк

Сейчас: `list({ page: 1, limit: 200 })` + `[page]="1" [pageSize]="200"` без `pageChange` → смена на 10 без pager **спрячет** заказчиков.

Обязательно:

- `const PAGE_SIZE = 10`;
- сигнал `page` (1-based);
- `list({ page: page(), limit: PAGE_SIZE })` (или client-slice + total, если API уже отдаёт total — предпочтительно **server page/limit**);
- `(pageChange)` на `app-pi-table` обновляет `page` и перезагружает/режет данные;
- не оставлять hardcoded `pageSize="200"`.

### ШАГ 3 — Спеки и page.md

Обновить ожидания `limit: 50` → `limit: 10` **только** там, где тест бьёт в list page (не service-unit с произвольным limit 50):

- `products.page.spec.ts`
- `materials.page*.spec.ts` (если assert на page limit)
- `users-admin.page.spec.ts`, `roles-admin.page.spec.ts`
- `counterparties.page.spec.ts` при наличии
- `docs/pages/products.page.md`, `materials.page.md` (и contracts/people если явно указан размер)

### ШАГ 4 — Gates

```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm test -- --include=**/products.page.spec.ts --include=**/materials.page*.spec.ts --include=**/users-admin.page.spec.ts --include=**/roles-admin.page.spec.ts --include=**/counterparties.page.spec.ts
```

(Допустимо прогнать полный `pnpm test` зоны pages, если include-фильтр неудобен.)

---

## ИЗМЕНЯТЬ

- Все page `.ts` из CONFLICT KEYS (+ их `*.spec.ts` при падении assert)
- `docs/pages/products.page.md`, `docs/pages/materials.page.md` (числа limit/PAGE_SIZE)
- при необходимости короткий note в `docs/pages/counterparties.page.md` / `people.page.md`

## НЕ ИЗМЕНЯТЬ

- `limit: 200` (и аналоги) в **form-dialog / picker** list-запросах
- `forms.page.ts` demo
- document-template `pageSize: 'A3'|'A4'|'A5'`
- backend API defaults (если BE clamp/default >10 — FE шлёт `limit=10`; не менять BE без нужды)
- generated-documents `findAll` без `-html` — **отдельный** follow-up (это не page size; list тянет HTML целиком)

## known_limitation

- `people.page.ts` может по-прежнему один раз тянуть `limit: 100` и резать client-side — для этого TZ достаточно `PAGE_SIZE=10` на UI. Server-page people — не блокер.
- `measurements-group` `limit: 100` (маленький справочник единиц) — вне scope, если нет table pager с PAGE_SIZE.
- Архив generated-documents: ускорение = exclude `html` + server limit, не смена UI 10.

---

## КРИТЕРИИ ПРИЁМКИ

1. Grep по `frontend/src/app/pages`: нет рабочих list-страниц с `PAGE_SIZE = 20|50` или table `[pageSize]="50|100|200"` на экранах из PAGES (кроме исключений выше).
2. `/products` list API первой загрузки уходит с `limit=10` (Network / spec).
3. `/materials`, `/organizations`, `/admin/users`, `/admin/roles` — аналогично `limit=10`.
4. `/counterparties`: видно ≤10 строк на странице; pager переключает страницы; заказчики за пределами первой десятки доступны.
5. Карточки продукции (grid): на первой странице ≤10 карточек.
6. Пикеры в диалогах по-прежнему могут грузить `limit: 200`.
7. `tsc --noEmit` frontend PASS; затронутые page specs PASS.
8. Финализация: archive + checklist Executor report + progress; Cursor review если требуется wave.

---

## One-liner исполнителю

```text
Прочитай GEMINI.md + tasks/TZ-UX-314-list-page-size-10.md. CLAIM → PAGE_SIZE/pageSize рабочих списков = 10 (products/materials/modules/orgs/orders/contracts/proposals/people/work-types/admin/colors/stock-movements); counterparties — pager + limit=10 без потери строк; пикеры limit:200 и A4/forms не трогать; спеки/page.md; gates; archive.
```
