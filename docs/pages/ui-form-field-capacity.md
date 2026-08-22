# UI Form Field Capacity (ёмкость полей)

> Внутри диалога/формы: ширина control и упаковка ряда по **данным**, не «всем 50%».  
> Оболочка окон: [`ui-dialog-canon.md`](./ui-dialog-canon.md) (kinds A–D).  
> Валидация без thrash: [`../UX-FORM-CANON.md`](../UX-FORM-CANON.md).  
> Полный аудит: [`../audits/2026-08-08-form-field-capacity-canon.md`](../audits/2026-08-08-form-field-capacity-canon.md).  
> Плотность 2026-08-22: **kind B и kind C**. Ширина окна ≠ ширина поля (GOV.UK/Fluent).

## Зачем

Широкий shell не обязан делать каждое поле full-width. Скролл остаётся, если короткие числа (Д/Ш/В/вес) сидят в огромных ячейках, а textarea открыта на высоту `maxLength`.

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

QuickCreate M/L **и FullEditor (kind C):** `md:grid-cols-12` + `gap-x-3 gap-y-2`. Textarea: QC `rows ≤ 2`; FullEditor `rows ≤ 3` (не высота под 4000 символов). Короткие фикс. значения: `CAPACITY_CONTROL_MAX_CLASS` (`max-w`, ≈ GOV.UK 2–10 символов), не `w-full`.

## Правила

1. Паковать ряды до суммы span ≤ 12. Переменные поля (имя, select) — span; короткие числа — span **и** max-w; цифры Д/Ш/В/вес/`listPrice` — `text-right tabular-nums`.
2. Габариты + вес — **одна строка** (band), не пять полурядов и не `grid-cols-2` на треть окна.
3. Textarea не доминирует форму: мало rows; character counter не оправдывает пустую простыню.
4. Один реестр `FIELD_CAPACITY` для QuickCreate **и** FullEditor. Не две таблицы.
5. Kind C на 1440: блок идентичности (имя, артикул, цена, габариты, описание) **без** body-scroll. Состав/фото ниже fold допустимы с внутренним scroll.
6. Не увеличивать `maxWidth` / высоту модалки вместо упаковки полей.
8. Flyout и expand-tray: только `max-w` / `ch` на короткие числа. Не `md:grid-cols-12` на узкую колонку — «жидкие» поля.

## Анти

- Число/артикул/`grid-cols-1` на всю колонку kind C (три вертикальных стека).
- «Всем 50%» для смешанных данных.
- Пустой textarea толкает «Сохранить» за край экрана.
