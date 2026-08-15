# Audit: витрина каталога — Продукция vs Модули vs Материалы

**Дата:** 2026-08-15  
**Эталон:** `/products` (`products.page.ts`, TZ-PRODUCTS-305 + filters overlay)  
**Цель PO:** три вкладки каталога (Продукция / Модули / Материалы) выглядят и управляются одинаково.

## Вердикт

| Экран | Близость к эталону | Главный разрыв |
|-------|-------------------|----------------|
| Продукция | **Эталон** | — |
| Материалы | ~70% | Нет list↔grid, нет `filters-rail`, нет showcase-карточек |
| Модули | ~25% | Только «плоская» таблица: нет фото, фильтров, reload, toggle вида, витрины |

Менеджер переключает чипы «Продукция → Модули» и попадает в другой UX-язык: у товаров — витрина с фото и фильтрами, у модулей — устаревший список «название + артикул + счётчики». Это стыдно на демо и ломает привычку «каталог = одна витрина».

## Эталон (факты по коду)

Файл: `frontend/src/app/pages/products/products.page.ts`.

1. **Toolbar:** поиск · фильтры (статус / активность / категория) · «+ Создать» · «Обновить» · **toggle list/grid** · счётчик.
2. **Filters rail:** узкая полоска `w-12` + оверлей-панель (`filters-rail-panel`) поверх колонки контента; backdrop не перекрывает рейл; клик внутри панели не закрывает.
3. **List:** `pi-table` с колонкой **Фото** (`pi-empty-tile` / `photoListUrl`), имя → `/products/:id`, expandable состав (отдельный контракт).
4. **Grid:** `app-pi-showcase-card size="md"`, сетка `1/2/3`, pager, `localStorage` ключ `pi-products-view-mode`.
5. **API:** envelope `{items,total,page,limit}` + query-фильтры.

Канон в `docs/pages/products.page.md` § «Карточки-витрины».

## Модули — текущее состояние

Файл: `frontend/src/app/pages/modules/modules.page.ts`.

| Есть | Нет (vs эталон) |
|------|-----------------|
| Group chips, поиск name/article | Фото-колонка / empty-tile |
| pi-table, client page/sort | Toolbar: Обновить, view toggle |
| Kind-marker на имени | Имя-ссылка на `/modules/:id` (сейчас только marker; detail — row-click) |
| Счётчики материалов/работ | Filters rail + доменные фильтры |
| Hint «см. карточку» в себест. | Grid + `PiShowcaseCard` |
| Flat `GET /modules` | Server envelope (не блокер для FE parity) |

**Данные для фото уже в схеме:** `ProductModule.mainPhotoId` / `photoIds`  
(`backend/.../product-module.schema.ts`). List **не populate** Photo, но id отдаётся — паттерн материалов: `PhotosService` lookup + `photoListUrl`. FE-тип `ProductModule` в сервисе **не объявляет** `mainPhotoId` — дыра типов.

**Не выдумывать** у модуля поля Product (`status`, `categoryId`, `listPrice`). Фильтры rail — только то, что есть: сортировка name/article, «состав пустой / есть материалы», опционально «есть работы».

## Материалы — текущее состояние

Файл: `frontend/src/app/pages/materials/materials.page.ts`.

| Есть | Нет (vs эталон) |
|------|-----------------|
| Фото, имя-ссылка, kind filter, reload | View toggle list↔grid |
| Server pagination | Filters rail + sort в панели |
| Kind-marker | Showcase grid + `pi-materials-view-mode` |

Материалы уже «почти витрина» в табличном режиме; не хватает того же chrome, что у продукции.

## Границы (что не чинить в этой волне)

- Expandable-строки модулей (состав materials) — successor, не блокер паритета chrome.
- Server-side pagination `GET /modules` — optional follow-up; client slice + PAGE_SIZE=10 допустим.
- Batch cost в списке модулей — по-прежнему «см. карточку» (TZ-COST-303).
- Общий shared-компонент filters-rail — не обязателен; копировать канон оверлея из products.
- Detail-страницы / FullEditor — вне scope.

## План исполнения

| TZ | Scope | Кому |
|----|-------|------|
| **TZ-CATALOG-372** | Модули → chrome + фото + grid витрины | Frontend |
| **TZ-CATALOG-373** | Материалы → grid + filters-rail (deps: можно параллельно с 372) | Frontend |

Conflict: разные page-файлы → параллель Layer 3 безопасна, если не трогать `pi-showcase-card` / `pi-table` ядро без нужды.
