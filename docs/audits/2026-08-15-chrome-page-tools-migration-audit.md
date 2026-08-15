# Audit: page-tools → `PiChromeToolsService` / app-chrome-rail

**Date:** 2026-08-15  
**TZ:** TZ-UX-325 (docs-only)  
**Depends:** TZ-UX-322 DONE (API), TZ-UX-323 DONE (Gantt эталон)  
**Canon:** [`docs/pages/page-chrome.md`](../pages/page-chrome.md) § Page tools  
**Wave successor:** [`tasks/_backlog/WAVE-UX-CHROME-PAGE-TOOLS-MIGRATE.md`](../../tasks/_backlog/WAVE-UX-CHROME-PAGE-TOOLS-MIGRATE.md)

## Verdict

Есть **≥3 сильных P0** на каталожных списках: локальная колонка `w-12` (`filters-rail`) ест ширину витрины — ровно антипаттерн «локальная 48px колонка рядом с контентом». Icon-действия (фильтр, вид, обновить) можно проецировать в chrome-rail; панель фильтров остаётся flyout overlay у страницы.

Студии КП Create и Builder **уже** icon-rail + flyout — **не дублировать** в chrome без отдельного PO-решения (высокий риск layout/savebar).

Гант `/production` — **DONE** (TZ-UX-323); эталон consumer.

## Method (read-only)

Просмотрены `frontend/src/app/pages/**`: `app-pi-toolbar`, `filters-rail` / `w-12`, studio `*-rail`, consumers `PiChromeToolsService.setTools`. Код не менялся.

## Inventory table

| Route | Сейчас | Что в L/R chrome | Выигрыш | Priority | Conflict risk |
|-------|--------|------------------|---------|----------|---------------|
| `/production` | Tools уже в chrome; local 48px rails удалены | Заказы · Фильтры · Обновить \| Карточка · Сегодня · Масштаб | — (эталон) | **DONE** | Low (locked) |
| `/products` | Toolbar: поиск/фильтры-селекты, Создать, Обновить, list/grid; **aside `w-12` filters-rail** + flyout | L: Фильтры; R: Вид · Обновить (Create/search остаются в toolbar) | +48px ширины сетки; меньше высоты toolbar | **P0** | Med — `products.page.ts` часто в catalog TZ |
| `/modules` | Паритет products: toolbar + **`filters-rail` w-12** + view toggle | L: Фильтры; R: Вид · Обновить | +48px витрины | **P0** | Med — modules list/specs |
| `/materials` | Паритет products (CATALOG-373): **`filters-rail` w-12** + view toggle | L: Фильтры; R: Вид · Обновить | +48px витрины | **P0** | Med — materials + 373 specs |
| `/supply` | Group tools: status select, chip заказа, **Обновить**, +Задача | R: Обновить (filter select остаётся в tools row) | Чуть меньше шума в tools-row | **P1** | Low |
| `/orders` | Group tools: search, Создать, **Обновить** | R: Обновить | Мелкий chrome win | **P1** | Low–Med (orders hub) |
| `/work-types`, `/people` | Toolbar-ish: Обновить + CRUD | R: Обновить | Мелкий | **P2** | Low |
| `/proposals/create` | **Уже studio:** L/R `kp-create-studio__rail` (3rem) + flyouts; savebar lifecycle | — | Не освобождать через chrome без redesign | **НЕ** (уже studio) | High — SALES/KP |
| `/builder`, `/builder/:id` | **Уже studio:** `builder-tool-pane` icon-rail + inspector | — | Не дублировать chrome | **НЕ** (уже studio) | High — DOC builder |
| Списки с `app-pi-toolbar` без rail (orgs, counterparties, contracts, inventory…) | Горизонтальный toolbar: search + primary | Обычно нечего переносить (нет icon-rail) | Мал | **P2 / skip** | Low |
| Admin `/admin/*` | Список устройств / roles | Не трогать в этой волне | — | **out** | AUTH-308 active |

## Явное НЕ (запрет переноса)

| Нельзя в chrome-rail | Почему |
|----------------------|--------|
| H1 / `app-pi-page-chrome` title | Структура IA, не page-tool |
| Жёлтое топ-меню / TOC chips | Навигация раздела |
| Primary «+ Создать» / длинный search input | Нужен текст/поле; chrome = icon-only |
| Lifecycle savebar КП (сохранить/отправить/…) | Канон savebar; destructive + confirm на месте |
| Destructive без confirm | Confirm остаётся у страницы |
| Дубль studio-rail КП/Builder в chrome | Уже icon-rail; второй набор путает |
| Локальный fallback 48px «на узких» | Rails ≥1680 как ←→; без docked колонки «на всякий» |

## Priority summary

### P0 (делать первыми в WAVE)

1. **`/products`** — снять `filters-rail` `w-12`; filter icon → left chrome; view + refresh → right.  
2. **`/modules`** — тот же паттерн (после или зеркалом products).  
3. **`/materials`** — тот же паттерн (CATALOG-373 parity).

Общий подход: один ownerId на страницу; flyout фильтров absolute overlay (как сейчас panel), без колонки; `clear` on destroy; data-test `chrome-tool-*`.

### P1

- `/supply` — Обновить → chrome (опционально иконка фильтра статуса позже).  
- `/orders` — Обновить → chrome.

### P2 / skip

- work-types / people refresh; прочие entity-list без rail.  
- Showcase / foundations / playground — out of product ERP.

### DONE / НЕ

- `/production` DONE.  
- КП Create + Builder — **уже studio / не дублировать**.

## End-user lens

Админ/менеджер на широком мониторе: витрина каталога и Гант должны занимать центр; иконки фильтра/вида — в поле у ←→, не «вторая колонка» внутри страницы. На ноутбуке &lt;1680 chrome скрыт — toolbar search/Create остаются usable.

## Evidence pointers (code, read-only)

- `products.page.ts` — `data-test="filters-rail"` / `w-12`  
- `modules.page.ts` — тот же блок  
- `materials.page.ts` — TZ-CATALOG-373 layout  
- `production-cockpit.page.ts` — `chromeTools.setTools('production-cockpit', …)`  
- `proposal-create.page.ts` — `kp-create-studio__rail`  
- `builder-tool-pane.component.ts` — icon rail + flyout  

## Out of scope this TZ

Любые правки `frontend/**` / `backend/**`. Только этот audit + WAVE backlog + page-chrome link.
