═══════════════════════════════════════════════════════════════
TZ-UX-313: Catalog detail smart back (return where you came from)
═══════════════════════════════════════════════════════════════

> Domain preflight: UI-only navigation. Counterparty/Organization N/A.
> Проверено: product-detail.page.ts `onBack()` → `/products`;
> module-detail.page.ts `onBack()` → `/modules`;
> material-detail.page.ts `onBack()` → `/materials`;
> pi-page-chrome first crumb = structural list link (`data-test=back-button`);
> docs/pages/page-chrome.md — crumbs = раздел/страница, не browser history.
> PO: product → module → хочет вернуться откуда пришёл; нет глобальных ←→ в shell.

РОЛЬ АГЕНТА: Frontend UI Engineer

ЗАВИСИМОСТИ: Нет

LAYER: 3

PAGES: /products/:id ; /modules/:id ; /materials/:id
PAGE_DOCS: product-detail.page.md ; module-detail.page.md ; materials.page.md ; page-chrome.md

CONFLICT KEYS: frontend/src/app/pages/products/product-detail.page.ts; frontend/src/app/pages/modules/module-detail.page.ts; frontend/src/app/pages/materials/material-detail.page.ts; frontend/src/app/shared/navigation/catalog-return.util.ts; docs/pages/page-chrome.md

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. Detail catalog pages have ghost button «← К каталогу / модулям / материалам»
   that **always** `router.navigate` to the section list — loses referrer
   (e.g. `/products` expand → `/modules/:id` → back dumps on `/modules`).

2. Crumbs are **structural** (`Каталог / Модули / имя`), first link =
   section list. That is correct for IA, wrong as “return to previous screen”.

3. No app-wide forward/back chrome. Browser history works (Alt+← / mouse
   back) but is not taught in UI.

4. No shared return helper; each detail duplicates hard-coded list route.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Shared smart-back helper (tiny util, not a service god-object)

  Создать `frontend/src/app/shared/navigation/catalog-return.util.ts`
  (или `.ts` + thin injectable if needed for `Location`/`Router` inject):

  Поведение `navigateBackOr(fallback: string)`:
  1. Если в history есть previous entry **того же origin** и URL ≠ текущий
     → `Location.back()`.
  2. Иначе → `Router.navigateByUrl(fallback)`.

  Эвристика same-app previous (выбрать одну, зафиксировать в коде+тесте):
  - предпочтительно: запоминать `previousUrl` через `Router` events в
    tiny `providedIn: 'root'` store (lastSuccessfulNavigation / NavigationEnd
    pair) — надёжнее чем сырой `history.length` в SPA;
  - НЕ открывать внешние сайты; НЕ `back()` если previousUrl пуст
    (прямой заход по закладке).

ШАГ 2: Wire three details

  Заменить `onBack()` в:
  - product-detail → fallback `/products`, label остаётся «← К каталогу»
    **или** динамически «← Назад» когда previousUrl известен (предпочтение PO:
    короткий «← Назад» если есть referrer, иначе текущий текст списка).
  - module-detail → fallback `/modules`
  - material-detail → fallback `/materials`

  Error-state duplicate «← К …» кнопки — тот же helper.

ШАГ 3: Crumbs stay structural

  НЕ делать crumbs = browser history. First crumb остаётся разделом/списком.
  Опционально (nice): если previousUrl = `/products/:id`, можно добавить
  средний crumb «{product name}» только когда пришли с продукта — **не
  обязательно** в этой TZ; known_limitation если не успеете.

ШАГ 4: Tests + docs

  - Unit: helper — with previous → back called; without → navigate fallback.
  - Spec smoke: module-detail onBack with mocked previousUrl.
  - `docs/pages/page-chrome.md` — секция «Возврат»: browser ← / smart back
    button; crumbs ≠ history. No global ←→ in app shell (by design).

═══════════════════════════════════════════════════════════════
ФАЙЛЫ ДЛЯ ИЗМЕНЕНИЯ
═══════════════════════════════════════════════════════════════

ИЗМЕНЯТЬ:
- frontend/src/app/shared/navigation/catalog-return.util.ts (new) ± tiny service
- frontend/src/app/pages/products/product-detail.page.ts (+spec if exists)
- frontend/src/app/pages/modules/module-detail.page.ts (+spec if exists)
- frontend/src/app/pages/materials/material-detail.page.ts (+spec if exists)
- docs/pages/page-chrome.md
- docs/pages/PAGE-TZ-INDEX.md (отметить UX-313)

НЕ ИЗМЕНЯТЬ:
- pi-page-chrome API (кроме docs) — не плодить второй back в каждом crumb
- app-layout / global toolbar forward-back UI
- composition-tree / products list expand (TZ-PRODUCTS-307)
- backend/**, desktop/**

known_limitation:
- Нет глобальных кнопок вперёд/назад в shell — браузерные.
- Deep links без history → fallback на список раздела.
- Не строить full trail «заказ → КП → продукт → модуль» в этой TZ.

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Сценарий: `/products` → клик модуль (expand card) → `/modules/:id` →
   кнопка «← …» возвращает на `/products` (или previous product detail),
   **не** всегда на `/modules` list.
2. Прямой заход `/modules/:id` (нет previous) → fallback `/modules`.
3. Crumbs по-прежнему структурные (Каталог / Модули / имя).
4. Нет новых ←→ в app shell / top nav.
5. `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`
6. `cd frontend && pnpm test -- --testPathPattern=catalog-return --no-coverage`
   (и/или module|product-detail back specs)
7. Manual light+dark: product→module→back; bookmark module→back to list.

═══════════════════════════════════════════════════════════════
ФИНАЛИЗАЦИЯ
═══════════════════════════════════════════════════════════════

GEMINI.md / executor-loop: archive `tasks/_archive/2026-08/TZ-UX-313.done.md`,
progress, commit/push своей зоны. Не трогать peer SUPPLY/desktop WIP.
