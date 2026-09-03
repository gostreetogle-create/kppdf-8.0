# TZ-NX-SALES-S34-ORDERS-LIST: список заказов в NX

**РОЛЬ:** Executor (frontend-nx)  
**LAYER:** 3 · **PAGES:** `/orders`  
**PAGE_DOCS:** `docs/pages/orders.page.md`  
**ЗАВИСИМОСТИ:** S33  
**CONFLICT KEYS:** `app.routes.ts`; `frontend-nx/apps/kppdf-web/src/app/pages/orders/`

## BUILD INTEGRITY

IMPLICIT CONFLICT: frontend-nx/apps/kppdf-web — nx build kppdf-web

Baseline (до CLAIM):
  cd frontend-nx && pnpm exec nx build kppdf-web  → exit 0

Gates (закрытие, nx build — ПОСЛЕДНИЙ):
  cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit
  focused page spec
  cd frontend-nx && pnpm exec nx build kppdf-web  → exit 0

## Domain preflight

**Проверено:** `app.routes.ts` — нет `/orders`; `nav-categories.ts` уже содержит пункт «Заказы» (появится после route).  
Список legacy: `orders.page.md`. NX = тонкий журнал, не HUB expand.

Сбои: (1) API error → banner + Повторить; (2) пустой список — честная пустышка + CTA создать (кнопка может вести на create, даже если S36 ещё нет — disable или «Скоро» запрещён: если create нет, CTA = нет, copy «Заказов пока нет»); (3) F5 сохраняет список через повторный GET.

## ИСХОДНОЕ

Nav мёртвый, пока нет route. `PiOrdersService.list()` есть.

## ЧТО ДЕЛАТЬ

1. `orders.routes.ts` + child в `app.routes.ts`: `path: 'orders'` list `''`.
2. `orders-list.page.ts` по образцу `proposals-list.page.ts`: номер, статус RU, оплачен да/нет, «без КП» если нет quotationId.
3. Клик строки → `/orders/:id` (S35 добавит страницу; **сейчас** можно завести placeholder redirect на list **или** сразу пустой detail shell — предпочтительно route `:id` с «карточка в S35» только если не ломает build. Лучше: list-only, ссылка `:id` добавится в S35. Тогда в S34 ссылок на detail нет — только таблица.
4. `data-test="orders-list"`.
5. Docs: строка в `docs/pages/orders.page.md` — секция **NX** `/orders`; `PAGE-TZ-INDEX.md`.
6. FIC §A: route существует; nav уже есть; PAGE_KEYS.orders уже в backend — не выдумывать новый key.

## ИЗМЕНЯТЬ

- `app.routes.ts`
- `frontend-nx/apps/kppdf-web/src/app/pages/orders/*` (new)
- `docs/pages/orders.page.md`
- `docs/pages/PAGE-TZ-INDEX.md`

## НЕ ИЗМЕНЯТЬ

- legacy `frontend/src/app/pages/orders/**` (S38)
- HUB expand / composition-tree / supply blocks

## КРИТЕРИИ ПРИЁМКИ

- [ ] `/orders` рендерит список из GET /orders
- [ ] Пункт «Заказы» виден в nav (route exists)
- [ ] spec на loading/error/empty
- [ ] `nx build kppdf-web` PASS последним

## Archive

`tasks/_archive/2026-09/TZ-NX-SALES-S34-ORDERS-LIST.done.md`
