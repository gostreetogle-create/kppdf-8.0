═══════════════════════════════════════════════════════════════
TZ-UX-345: Chrome-rail снова виден как боковое меню
═══════════════════════════════════════════════════════════════

> `docs/TZ-AUTHORING.md`. Канон: `docs/pages/page-chrome.md` § Page tools + § «Куда делись боковые меню».
> Не путать с TZ-DESK-423 (tray заказа). Другие conflict keys — можно параллельно.

РОЛЬ АГЕНТА: Frontend Layout Engineer

ЗАВИСИМОСТИ: Нет (UX-321-FIX / 322 / 326–328 уже DONE)

LAYER: 3 (app-layout — один агент)

PAGES: (app shell) ; /products ; /modules ; /materials ; /production ; /desk
PAGE_DOCS: page-chrome.md ; products.page.md

CONFLICT KEYS: frontend/src/app/layout/app-layout.component.ts; frontend/src/app/layout/app-layout.component.spec.ts; frontend/src/app/pages/products/products.page.ts; frontend/src/app/pages/modules/modules.page.ts; frontend/src/app/pages/materials/materials.page.ts; docs/pages/page-chrome.md

Проверено: `app-layout.component.ts` `.app-chrome-rail { display: none }` + `@media (min-width: 1680px) { display: flex }` (~566–638); rails `background: transparent`, width 64px, left/right 0 of `.pi-page-frame` (`--screen-max: 1400px`); spec требует литерал `1680px` (app-layout.component.spec.ts ~167); products/modules/materials регистрируют tools через `PiChromeToolsService`, fallback `.products-chrome-fallback` только &lt;1680; production-cockpit **нет** fallback — на 1440 Заказы/Фильтры Ганта тоже скрыты; `filters-rail` `w-12` снят UX-326/327/328; TZ-UI-404 не содержит chrome-rail.

Dictation PO: «боковые меню» = chrome-rail / бывший filters-rail, не жёлтое топ-меню.

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. PO думает, что меню стёрли (крошки или самодеятельность). Факт: перенос в shell по его же канону 15–16.08, плюс порог 1680px и прозрачный фон.

2. Шапка уже с **1024px** (`lg`) имеет `padding-inline: 64px` у `.pi-page-frame` / `pi-edge-bleed` — ровно ширина chrome-rail. Верхнее меню при этом на месте (горизонтальный скролл nav, не схлопывание). Порог **1680** прячет рейлы, пока шапка ещё «держит ширину» — это и есть баг.

3. Откат git волны 326–328 запрещён: заденет витрину/пагинацию/другие правки.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Порог = поле шапки, не магические 1680

Правило PO: **пока верхнее меню в полной раскладке и в `.pi-page-frame` уже есть 64px поле — chrome-rail виден.**
Это уже сейчас `min-width: 1024px` (`padding-inline: 64px` в `styles.css` у `.pi-page-frame` и `.pi-edge-bleed`).

- В `app-layout.component.ts` сменить `@media (min-width: 1680px)` показа `.app-chrome-rail` на **`1024px`**. Один порог на left+right (←→ + page-tools).
- Комментарий: рейл живёт в том же 64px поле, что padding шапки; 1680 был лишний. Не возвращать `w-12`.
- Spec: ждать `1024px`, не `1680px` и не выдумывать 1440.

ШАГ 2: Рейл читается как вертикальное меню

Сейчас `background: transparent; border: none` — полоска не видна.
- Лёгкий фон `var(--color-paper-2)` (или color-mix paper/paper-2 ~80%) + hairline `var(--color-rule)` **только** на внутреннем крае (left rail — border-right; right — border-left). Без тени, без второй «коробки», ширина **64px** сохранить.
- History-кнопки сверху по-прежнему raised; page-tools ниже зазора UX-324.
- Не `position: fixed`, не `left:64px`, не `app-nav-gutter` (spec уже запрещает).

ШАГ 3: Docs

Дописать в `page-chrome.md`: порог **1024px = lg padding 64px**; зачем не `w-12`; крошки 404 ≠ рейлы. Строка PAGE-TZ-INDEX `(app shell)`.

ШАГ 4: Не раздувать

- Не возвращать `data-test="filters-rail"` колонки в products/modules/materials.
- Не дублировать studio-rail КП/Builder в chrome.
- Не переписывать flyout фильтров (overlay канон products).
- Production fallback на &lt;1024 — **known_limitation** (отдельный successor); эта TZ только shell visibility.
- Toolbar fallback каталога (`.products-chrome-fallback` и зеркала): их `@media (min-width: 1680px)` сменить на **`1024px`**, иначе на 1024–1679 будут ДВА комплекта иконок (chrome + toolbar).

═══════════════════════════════════════════════════════════════
ФАЙЛЫ ДЛЯ ИЗМЕНЕНИЯ
═══════════════════════════════════════════════════════════════

ИЗМЕНЯТЬ:
- frontend/src/app/layout/app-layout.component.ts
- frontend/src/app/layout/app-layout.component.spec.ts
- frontend/src/app/pages/products/products.page.ts (только media fallback 1680→1440)
- frontend/src/app/pages/modules/modules.page.ts (то же, если есть 1680)
- frontend/src/app/pages/materials/materials.page.ts (то же, если есть 1680)
- docs/pages/page-chrome.md
- docs/pages/PAGE-TZ-INDEX.md

НЕ ИЗМЕНЯТЬ:
- order-hub-tray / manager-desk (DESK-423)
- composition-tree, backend, desktop
- git revert UX-326/327/328
- docs/PO-CANON.md
- git add -A

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. На 1440×900 **и** на 1280 `/products`: видны `app-chrome-rail-left` + `chrome-tool-*` Фильтры; клик открывает существующий flyout. Нет колонки `w-12` у таблицы.
2. На тех же ширинах `/modules` и `/materials` — тот же chrome-фильтр.
3. На 1023 и ниже chrome-rail `display:none`; каталог fallback в toolbar жив.
4. На 1024–1679 нет двойных иконок фильтр/вид (chrome XOR toolbar fallback).
5. Spec layout: `1024px`, не `1680px`. Geometry запреты UX-321-FIX сохранены.
6. Gates:
```
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm test -- app-layout products.page modules.page materials.page --runInBand
cd frontend && pnpm lint
```
7. Browser если стенд: 1280, 1440 и 1920, light, `/products` — скрин left rail.

known_limitation: Гант &lt;1024 без chrome-tools fallback. Не эта TZ.

Archive: `tasks/_archive/2026-08/TZ-UX-345.done.md`. Без деплоя.
