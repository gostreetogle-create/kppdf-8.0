# Аудит консистентности breadcrumb/навигации — 2026-08-22

**Scope:** `frontend/src/app` — все реализации breadcrumb / «где я нахожусь» / back-navigation
на реальных ERP-маршрутах и в UI-kit.

**Канон:** `docs/paper-and-ink.md`, `docs/design-spec.md`; компоненты
`shared/ui/pi-breadcrumb.component.ts`, `shared/ui/pi-breadcrumb-item.component.ts`,
`shared/page/pi-page-chrome.component.ts`, `shared/page/pi-page-header.component.ts`.

**Метод:** статический grep/read по живому frontend-коду + `app.routes.ts` для перечня
реальных `:id` detail-маршрутов. Код не изменялся.

## Итог

Найдено **4 находки**: **1 high**, **2 medium**, **1 low/uncertain**. В коде существуют
**три независимые реализации** «где я нахожусь / назад»: kit-only компонент
`app-pi-breadcrumb`/`app-pi-breadcrumb-item`, реально используемый `app-pi-page-chrome[crumbs]`
и полностью кастомный toolbar-back в doc-constructor builder. Главный риск — не разнобой
цвета/шрифта (там расхождение подтверждено, но некритично), а то, что три из четырёх
catalog/order detail-страниц рендерят **два независимых back-affordance с одинаковым
`data-test="back-button"`** одновременно.

## Перечень маршрутов

Реальные `:id` detail-маршруты по `app.routes.ts`: `materials/:id` (138), `products/:id` (305),
`modules/:id` (324), `orders/:id` (368), `doc-constructor/builder/:id` (460). Список-страницы
(`products`, `modules`, `materials`, `orders`, dictionary group-страницы) breadcrumb вообще не
рендерят — используют `PiGroupWorkspaceComponent` (chips-only, без H1/крошек по замыслу, см.
комментарий в `measurements-group.page.ts:141-144`); это осознанный паттерн, не находка.

## Находки

### B-01 — HIGH — дублирующийся `data-test="back-button"` + два back-affordance на одном экране

`frontend/src/app/pages/modules/module-detail.page.ts:76-88`,
`frontend/src/app/pages/products/product-detail.page.ts:85-89`,
`frontend/src/app/pages/materials/material-detail.page.ts:79-83`

`PiPageChromeComponent` сам помечает первую ссылку крошек `data-test="back-button"`, когда она
и первая, и не последняя (`shared/page/pi-page-chrome.component.ts:34`:
`[attr.data-test]="first ? 'back-button' : null"`). Все три catalog-detail страницы одновременно
рендерят в `actions`-слоте отдельную ghost-кнопку «← Назад» с тем же `data-test="back-button"`
(`onBack()` / `backLabel()`, referrer-aware, TZ-UX-313). В итоге на одной странице **два разных
DOM-узла с одинаковым test id** — `document.querySelector('[data-test="back-button"]')` находит
первый и молча игнорирует второй, а Playwright/e2e-локатор по этому test id неоднозначен.
Визуально это ещё и два разных «назад»-элемента рядом: подчёркнутый текстовый крамб «Каталог» и
отдельная кнопка-призрак с текстом «← Назад» — не одна и та же аффорданс, но выглядят как
дублирующий функционал.

`frontend/src/app/pages/orders/order-detail.page.ts:76` — контрпример: рендерит
`<app-pi-page-chrome [crumbs]="crumbs()" ... />` **без** actions-слота и без отдельной
ghost-кнопки «назад» — только один back-affordance (первая крошка «Сделки»). Тот же shared
компонент используется четырежды, но паттерн «назад» на order-detail отличается от трёх
catalog-detail страниц.

### B-02 — MEDIUM — несогласованная глубина/структура крошек на однотипных detail-экранах

- `module-detail.page.ts:413-417`: `Каталог → /modules`, `Модули → /modules`, `<имя>` — **два**
  сегмента подряд указывают на один и тот же route.
- `material-detail.page.ts:418-422`: `Каталог → /materials`, `Материалы → /materials`, `<имя>` —
  тот же паттерн-дубликат маршрута.
- `order-detail.page.ts:317-324`: `Сделки → /orders`, `Заказы → /orders`, `<номер>` — тот же
  паттерн.
- `product-detail.page.ts:445-448`: **только** `Каталог → /products`, `<имя>` — на один сегмент
  короче, без промежуточного «Товары».

Ни один из этих «Каталог»/«Сделки» сегментов не ведёт на отдельную родительскую страницу (route
`/catalog` не существует — `Каталог` указывает прямо на список, на который указывает и второй
сегмент). Технически это не сломано (обе ссылки кликабельны и ведут в верный список), но
семантика «путь от корня» не соблюдается: у трёх экранов один и тот же список показан дважды
разными подписями, а у product-detail — только один раз. Итог: 4 detail-экрана одного типа
(«карточка сущности из каталога/сделок») используют 2 разные по глубине структуры крошек без
видимой причины.

### B-03 — MEDIUM — kit-компонент `app-pi-breadcrumb`/`app-pi-breadcrumb-item` не используется ни на одном ERP-экране и расходится по виду с реально используемыми крошками

`frontend/src/app/shared/ui/pi-breadcrumb.component.ts:1-22`,
`frontend/src/app/shared/ui/pi-breadcrumb-item.component.ts:1-45`,
единственное использование: `frontend/src/app/pages/navigation/navigation.page.ts:74-79`
(kit-showcase страница `/navigation`).

Этот компонент — единственная «универсальная» breadcrumb-пара в `shared/ui`, но ни один
реальный маршрут её не использует; все 4 реальных detail-маршрута используют вместо неё
`app-pi-page-chrome`'s inline `[crumbs]` (`shared/page/pi-page-chrome.component.ts:22-50`).
Визуально они не совпадают:

| | `app-pi-breadcrumb` | `app-pi-page-chrome[crumbs]` |
|---|---|---|
| шрифт/регистр | `font-mono text-[11px] uppercase tracking-[0.18em]` | `text-sm`, обычный регистр |
| разделитель | `›` | `/` |
| текущий сегмент | `text-ink font-medium` | `font-display text-base ... aria-current` |
| `aria-label` | input `ariaLabel()`, дефолт «Навигация» | хардкод `"Навигация"` |

Kit-страница даже собственный пример строит через legacy `href="/overview"` вместо
`[link]="…"` (`navigation.page.ts:76-77`), хотя компонент сам документирует
«Prefer routerLink over href (SPA navigation)» (`pi-breadcrumb-item.component.ts:5`) — showcase
демонстрирует не рекомендуемый режим использования собственного компонента. Компонент либо
мёртвый код, который нужно удалить/пометить deprecated, либо `page-chrome` должен быть
приведён к нему (или наоборот) как единый canonical breadcrumb primitive.

### B-04 — LOW / UNCERTAIN — `doc-constructor/builder/:id` не использует ни один breadcrumb-примитив

`frontend/src/app/pages/doc-constructor/builder/builder.page.ts:91-106`

Единственный detail-маршрут без `app-pi-page-chrome` и без крошек вообще: кастомный
`builder-toolbar` с одиночной icon-кнопкой `data-test="builder-back-templates"`
(`(click)="goToTemplates()"`), ведущей всегда на `/doc-constructor/templates`. Комментарий в
шаблоне (`builder.page.ts:92-97`, TZ-DOC-324) говорит, что это осознанно «pure editor for
`/:id`» — может быть намеренным canvas-first UX, аналогично builder palette flyout в
`2026-08-22-ui-consistency-audit.md` (D-05). Отмечаю как UNCERTAIN, а не нарушение: решение
нужно от PO — либо это законный третий паттерн для tool-canvas экранов, либо `/:id` builder
тоже должен получить `page-chrome`-путь «Шаблоны › <имя>» для консистентности с остальными
detail-маршрутами.

## Новое замечено

1. **Тестовая неоднозначность, не только визуальная:** B-01 — это не просто «два разных на вид
   элемента», а буквальный дубль `data-test` атрибута в DOM на 3 из 4 реальных detail-экранов;
   любой будущий e2e/Playwright-тест по этому селектору на этих страницах уже сегодня
   потенциально бьёт не туда.
2. **Список-страницы вообще не имеют крошек** (chips-only `PiGroupWorkspaceComponent`) — это
   подтверждённый осознанный паттерн, а не находка; но означает, что breadcrumb в этом проекте
   существует **только** на 4 (из 5 технически id-маршрутов) detail-экранах — маленькая
   поверхность, которую тем не менее не получилось сделать одинаковой.

## Проверенные не-нарушения / исключения

- Список-страницы (`products.page.ts`, `modules.page.ts`, `materials.page.ts`, `orders.page.ts`,
  `measurements-group.page.ts`) намеренно не используют `page-chrome`/крошки — задокументированный
  Group Chip Workspace паттерн.
- `dashboard-stats.page.ts:33-36` (`/dashboard`) вызывает `app-pi-page-chrome` без `[crumbs]` —
  корневой раздел верхнего уровня, отсутствие пути «откуда я» здесь корректно, не находка.
- `overview.page.ts` и `pi-command-palette.component.ts` упоминают «breadcrumb» только как текст
  kit-каталога/лейбл команды палитры (ссылка на `/navigation`) — не собственная реализация
  навигации, ложных срабатываний grep нет.
- `builder.page.ts:480-483` (`// TZ-DOC-318 — breadcrumb badge`) — комментарий про фильтр-чип
  категории текстов в топбаре редактора, не про путь навигации; не breadcrumb-находка.

## Open questions (PO)

1. Оставляем ли `app-pi-breadcrumb`/`app-pi-breadcrumb-item` как canonical primitive (тогда
   `page-chrome` крошки нужно мигрировать на него) или он мёртвый showcase-код, который стоит
   удалить/пометить deprecated (B-03)?
2. Убрать дублирующийся ghost back-button на module/product/material-detail (оставить один
   back-affordance, как на order-detail) или явно развести `data-test` id, раз оба элемента
   остаются (B-01)?
3. Выровнять глубину крошек: привести product-detail к 3 уровням как остальные три, или наоборот
   убрать средний дублирующий-route сегмент везде и оставить 2 уровня (B-02)?
4. `doc-constructor/builder/:id` — законный третий UX-паттерн для canvas-tool экранов, или
   успешник должен добавить туда `page-chrome` для консистентности с остальными 4
   detail-маршрутами (B-04)?

Successor: если PO подтвердит направление по вопросам 1–3, следующий TZ (например
`TZ-UI-404`) может консолидировать оба компонента и убрать дублирующий back-button —
объём укладывается в один фокусный TZ без затрагивания product-логики за пределами
`shared/page`/`shared/ui` и 4 detail-страниц.
