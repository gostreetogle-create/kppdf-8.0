# WAVE — Home = stats dashboard; Комбайн → Проект

> PO 2026-08-16: первая страница — **статистика по сайту** (движение заказов,
> материалов, общая картина). **Комбайн заказов** убрать с home: он живёт в
> **Проект** (проектирование подтверждает / двигает заказ). Не путать со
> складским «Дашборд» `/inventory`.

**Статус:** READY для Freebuff / executor — **не** тонкий CSS; волна 2–3 TZ.  
Cursor Mode A не кодит product; выдаёт TZ + prompt.

## Канон IA (после волны)

| Было | Станет |
|------|--------|
| `/` → `/dashboard` = Канбан «Комбайн заказов» | `/` → **домашняя статистика** (UI: «Дашборд» / «Обзор») |
| Комбайн в Сделки (`activeAliases` + TOC chip) | Комбайн пункт **Проект** (`design`) |
| Brand aria «Комбайн… — главная» | Brand → home stats (не Комбайн) |
| `/inventory` «Дашборд» склада | **Без переименования** — copy home ≠ «Складской дашборд» |

### Маршруты (предложение — зафиксировать в TZ-NAV-303)

1. **Home stats:** оставить path **`/dashboard`** под **новый** stats UI (меньше churn login/redirect) **или** `/home` + redirect `/` → `/home`, старый канбан на новый path.  
   **Предпочтение PO-friendly:** `/dashboard` = stats; канбан → **`/design/combine`** (или `/combine` с parent design).
2. Канбан-компонент: перенос/rename page doc `dashboard.page.md` → `orders-combine.page.md` (или `design-combine.page.md`); не ломать write-path SWEEP-401.
3. `pageKey` грантов: stats home может быть `dashboard`/`home`; combine остаётся `orders` (как сейчас).

## Порядок TZ

| # | ID | Суть | Keys (грубо) |
|---|-----|------|----------------|
| 1 | **TZ-NAV-303** | Nav: Комбайн под Проект; убрать из deals aliases/TOC; brand home → stats route; `/` redirect; routes split combine vs stats shell | `app-layout*`, `app.routes.ts`, deals TOC chips, page docs |
| 2 | **TZ-DASHBOARD-401** | Home stats page: layout виджетов RU (заказы по статусам, движения материалов/склада summary, ссылки в разделы). Сначала **read-only** из существующих list/count API; без выдуманного BI | новый/переписанный `dashboard.page` stats, specs, `dashboard.page.md` |
| 3 | **TZ-DASHBOARD-402** *(если 401 упрётся в API)* | BE aggregate endpoints если list+client fold тяжёлый | backend stats module |

**Старт Freebuff = TZ-NAV-303**, затем 401. Не параллелить 303+401 на `dashboard.page` / routes.

## Виджеты home (минимум 401)

- Заказы: счётчики по колонкам/статусам (draft…shipped) + клик → `/orders` или combine.
- Материалы / склад: краткий pulse (остатки critical / последние движения) → `/stock-movements`, `/storage-items`.
- Сделки: опц. открытые КП count → `/proposals`.
- Не дублировать полный канбан на home.

## НЕ

- Ломать ship/cancel write-path комбайна  
- Переименовывать `/inventory`  
- Deploy / wipe  
- PHOTO frame (Freebuff уже) / CATALOG-375 materials expand  

## Связанные docs

- `docs/pages/dashboard.page.md` (сейчас Комбайн)  
- `docs/PO-CANON.md` — обновить после DONE: home ≠ Комбайн  
- UX-331 brand chip — successor правка aria в NAV-303  
