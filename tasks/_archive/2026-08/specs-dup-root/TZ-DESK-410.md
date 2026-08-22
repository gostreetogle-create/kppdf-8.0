═══════════════════════════════════════════════════════════════
TZ-DESK-410: очередь стола — search/filter/sort (reuse /orders)
═══════════════════════════════════════════════════════════════

PAGES: /desk
PAGE_DOCS: manager-desk.page.md

РОЛЬ АГЕНТА: Frontend. Root TZ, GEMINI.md. Freebuff.

ЗАВИСИМОСТИ: TZ-DESK-402 DONE (живой GET /orders).

LAYER: 3

CONFLICT KEYS: frontend/src/app/pages/desk/manager-desk.page.ts; frontend/src/app/pages/desk/desk-queue-toolbar.component.ts (новый); frontend/src/app/pages/orders/orders.page.ts (extract helpers only if shared)

Проверено: `orders.page.ts` — `createSearchState`, `filteredRows`, sort, pagination.
Flyout «Фильтр» и «Сводка» в 401 — пустышки. Без фильтра стол бесполезен при >30 заказах.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — toolbar над очередью
- Debounced search (номер, клиент, counterparty label) — reuse `createSearchState`.
- `data-test="desk-search-input"`.

ШАГ 2 — flyout «Фильтр»
- Status multi-select; preset **«Активные»** default (exclude draft/shipped/cancelled/delivered — align production ACTIVE + business sense).
- Persist filter in query `?status=` or sessionStorage (pick one, document in page.md).

ШАГ 3 — flyout «Сводка»
- Counts by status for **current filter** (read-only); reuse computed from loaded orders, no new API.

ШАГ 4 — sort + page slice
- Default sort: created/updated desc (same field as /orders).
- Pagination or «ещё» — same pattern as orders hub; total in strip meta.

ШАГ 5 — refresh
- Кнопка «Обновить» в filter flyout → re-fetch GET /orders; сохранить expand if id still exists.

Gates: tsc + manager-desk.page spec + eslint.

КРИТЕРИИ ПРИЁМКИ
- Default view ≠ «все когда-либо»; search/filter/sort работают без /orders.
- Archive + push.

known_limitation: server-side filter — только если orders API уже поддерживает; иначе client pipeline как hub.
