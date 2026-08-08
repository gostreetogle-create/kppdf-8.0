# UI Form Field Capacity (ёмкость полей)

> Внутри диалога/формы: ширина control и упаковка ряда по **данным**, не «всем 50%».  
> Оболочка окон: [`ui-dialog-canon.md`](./ui-dialog-canon.md) (kinds A–D).  
> Валидация без thrash: [`../UX-FORM-CANON.md`](../UX-FORM-CANON.md).  
> Полный аудит: [`../audits/2026-08-08-form-field-capacity-canon.md`](../audits/2026-08-08-form-field-capacity-canon.md).

## Зачем

Kind B дал ширину окна. Скролл остаётся, если короткие числа (Д/Ш/В/вес) сидят в огромных ячейках и форма растёт вниз.

## Capacity → span (12-col, desktop)

Фиксировано в `field-capacity.ts` (`CAPACITY_SPAN`):

| Capacity | Span | Данные | Примеры |
|----------|------|--------|---------|
| nano | 2 | 1–6 цифр | Длина, Ширина, Высота, Вес |
| xs | 2 | ед., короткий прайс | Ед., Ед. габаритов, Прайс |
| sm | 4 | артикул, короткий select | Артикул, Вид, Статус |
| md | 4 | обычный select / checkbox | Категория, Активен |
| lg | 8 | длинное имя | Название |
| full | 12 | текст | Описание, Заметки |

QuickCreate M/L: `md:grid-cols-12` + `gap-x-3 gap-y-2`; textarea `rows=2`.

## Правила

1. Паковать ряды до суммы span ≤ 12.
2. Габариты + вес — **одна строка** (band), не пять полурядов.
3. QuickCreate textarea: **rows ≤ 2**; gap компактный (`gap-y-2`).
4. Реестр `FIELD_CAPACITY` только для allowlisted FieldKey.
5. Цель product L: без заметного body-scroll на обычном desktop.
