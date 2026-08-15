# Audit: multipage КП / overflow таблицы (2026-08-15)

> Источник: PO screenshots (builder height 312px vs Create КП tall table) + code audit.
> Канон решения → `TZ-SALES-376` (now) · `TZ-SALES-377` (park).

## PO intent (переформулировка)

1. В конструкторе таблица имеет **рамку высоты** — это бюджет места на 1-й странице.
2. В Create КП строки не должны «вылезать» за лист: остаток → **страница 2+**.
3. Настройки страниц — в Create КП (уже «Вид листа»); явные числа = override.
4. Разные шаблоны на каждую страницу / полный конструктор page 2+ — **позже**; сейчас достаточно одного шаблона с повтором фона+блоков (как сейчас) и честного split.
5. Разумный successor: страницы 2+ = **фон + таблица** (без декоративных блоков страницы 1) — park `TZ-SALES-377`.

## Что уже есть (SALES-346)

| Механизм | Статус |
|----------|--------|
| `sheetLayout.rowsFirstPage` / `rowsNextPage` | Да; UI Параметры→Вид листа |
| `splitPreviewLines` → N× HTML / `.doc-page` | Да |
| Create КП вертикальная лента iframe | Да |
| Повтор фона + блоков; итог/условия на последней | Да |
| `pageBreakBefore` на строке | Только CSS; **не** режет страницы build |
| Высота блока таблицы в builder | **Только editor**; build split **не** читает |

## Корневой баг

`rowsFirstPage/rowsNextPage = 0` в TZ-346 обещали «авто», код подставляет **20 / 25** строк
(`document-template.service.ts` `splitPreviewLines`). Высота рамки (312px) игнорируется →
таблица визуально переполняет лист, пока count не «дотянет» до следующей страницы.

## Решение волны

1. **TZ-SALES-376** — geometry-aware auto + clip + honor pageBreakBefore + totals fix + RU labels.
2. **TZ-SALES-377** (park) — continuationMode background+table; **не** multi-template-per-page.
