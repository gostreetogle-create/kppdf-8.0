# Audit: единая пагинация (ERP-списки)

**Дата:** 2026-08-16  
**Запрос PO:** везде один стиль; подобрать лучший/полный UX; исправить.  
**Зона:** `frontend` shared UI + list/grid pages.  
**Канон PO:** `PAGE_SIZE` рабочих списков = **10** (`PO-DIARY` / UX-314); UI на русском; плотные формы.

---

## Вердикт

Сейчас **три разных UI** и **разная подпись страницы**; `PAGE_SIZE` плавает (5 / 10 / 12 / 15 / 20).  
Канон для kppdf: **один shared-pager** (расширить `app-pi-pagination`) → его же использует `pi-table` и grid-витрины.  
Дефолт **10** строк; опционально выбор **10 / 25 / 50**; номера страниц при ≥5 страницах; всегда диапазон `N–M из T` + ‹ ›.

Исправление — волна **TZ-UX-340 → 341 → 342** (не один гигантский diff на все pages).

---

## Инвентарь (факты)

### Примитивы

| Компонент | Что умеет | Дыры |
|-----------|-----------|------|
| `app-pi-table` footer | `N–M из T` + ←/→ + `P / TP` | Нет номеров; default pageSize **20**; не slice’ит rows |
| `app-pi-pagination` | ‹ › + номера с «…» | **Нет** диапазона; default pageSize **20**; почти не используется |
| Custom `grid-pager` | products / modules / materials | Дубль разметки; «Назад/Далее»; у modules/materials нет «из TP» |

### Списки с живой пагинацией

| Страница | SIZE | Server/client | UI |
|----------|-----:|---------------|-----|
| `/products` | **15** | server | table: pi-table; grid: custom |
| `/modules` | 10 | client | table + custom grid |
| `/materials` | 10 | server | table + custom grid |
| orders, contracts, proposals, people, work-types | 10 | client* | pi-table |
| counterparties, organizations, admin users/roles | 10 | server | pi-table |
| documents, templates | 10 | client | pi-table |
| color-references | 10 | client | pi-table |
| forms (demo) | **5** | client | pi-table |
| KP product rail | **12** | mixed | **pi-pagination** + range |

\* people: API limit 100, UI slice 10.

### «Мёртвый» total (pager может показаться, клик бесполезен)

`stock-movements` (pageSize 10), warehouses / storage-items / inventory-dashboard / supply / document-template-categories / text-block-categories / texts / tables — часто `total = rows.length` без slice/`pageChange`.

---

## Проблемы для менеджера

1. Разная кнопка: «Назад» vs «←» vs «‹».  
2. Разная метка: `Стр. 2 из 5` vs `2 / 5` vs голое `2`.  
3. Products первая страница 15, остальные 10 — непривычно.  
4. На длинных списках нельзя прыгнуть на стр. 5 без многократного «Далее».  
5. Нельзя выбрать «показать по 25» на большой каталог.  
6. Часть экранов врёт пагинацией (total без логики).

---

## Канон (выбранный стиль)

**Имя:** `PiPagination` как единственный визуальный SoT (доработать, не плодить третий).

```
[ 1–10 из 61 ]   ‹  1  2  3 … 7  ›   [ по 10 ▾ ]
```

| Элемент | Правило |
|---------|---------|
| Диапазон | Всегда при visible pager: `{{start}}–{{end}} из {{total}}` |
| Prev/next | `‹` / `›` (как pi-pagination), RU aria |
| Номера | Если `totalPages ≥ 5` — полоска с gaps; если 2–4 — можно только ‹ › + `P / TP` **или** все номера (≤7 уже есть в компоненте) |
| First/Last | **Не** добавлять (шум для цеха ~10 чел) |
| Размер страницы | Select **10 / 25 / 50**; дефолт **10**; `pageSizeChange` output |
| Скрытие | `total ≤ pageSize` → не показывать |
| Table | Footer `pi-table` **встраивает** тот же компонент (убрать дубль разметки) |
| Grid | Заменить custom `grid-pager` на тот же компонент |
| KP rail | Перевести на тот же API/вид |
| Константа | Shared `PI_DEFAULT_PAGE_SIZE = 10` (или re-export); products **15 → 10** |

Визуал: Paper & Ink — `text-xs` / `font-mono` tabular, `hairline`, `h-7`, active = ink fill (как сейчас у pi-pagination). Одна строка, `justify-end` под таблицей/сеткой.

---

## Волна исправления

| # | TZ | Scope |
|---|-----|--------|
| 1 | **TZ-UX-340** | Доработать `pi-pagination` (range + pageSize select + outputs); встроить в `pi-table`; shared default 10; specs |
| 2 | **TZ-UX-341** | products/modules/materials: убрать custom grid-pager; products PAGE_SIZE=15→10; после/не конфликтовать с UX-326 |
| 3 | **TZ-UX-342** | KP rail + dead-total pages (slice или убрать total) + вычистить unused helpers |

Deploy **нет** в волне.

---

## Не в scope

- Backend envelope migration для flat-array modules (client slice ок).  
- Infinite scroll.  
- Менять Gantt / studio chrome.  
- i18n framework.
