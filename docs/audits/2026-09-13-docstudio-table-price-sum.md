# Audit — DocStudio table: пустая «Цена» + нет «Сумма»

date: 2026-09-13  
PO: скрин каталожной таблицы — две колонки «Цена», первая пустая, последняя `0`; вопрос «где сумма / кнопка добавить сумму».

## Факты по коду

| Слой | Путь | Поведение |
|------|------|-----------|
| Live hydrate | `backend/.../studio-data-resolver.ts` | `listPrice \|\| basePrice \|\| pricePerUnit \|\| 0`; `total = price * qty` |
| Ячейка | `lineValue(column.key)` | Данные только по **key** + `COLUMN_ALIASES`; **label не участвует** |
| Aliases price | `price`, `unitprice`, `unit_price`, `цена` | **Нет** `listprice` / `listPrice` / `basePrice` |
| Aliases sum | `sum`, `total`, `amount`, `сумма` | Считает уже; footer `type==='sum'` или key sum/total |
| Quick-add | `STUDIO_STANDARD_COLUMN_FIELDS` | qty/sku/photo/unit/description/**price** — **нет sum** |
| Каталог | Product `listPrice`; Material `pricePerUnit`; **Module — поля цены нет** | Модули → всегда 0 |

## Почему скрин выглядит так

1. Заголовок «Цена» = `label`. Пустая ячейка при живом qty/name/photo ⇒ **key колонки не в aliases** (битый/кастомный key), не «резолвер забыл цену».
2. Вторая «Цена» с `0` ⇒ key распознан как `price` **или** `sum`, а `listPrice` у позиций = 0 / нет → `0 * qty = 0`. Дубль заголовка = оператор/вид назвал sum «Цена» или две price-колонки.
3. Отдельной кнопки «+ Сумма» **нет** — только `+ Колонка` вручную (`key=sum`, `label=Сумма`) или пресет КП (`unitPrice` + `sum`).

## Workaround PO (сейчас)

1. Реестр → изделие → заполнить «Цена, ₽» (`listPrice`).
2. Свойства таблицы → у колонок смотреть **key**, не только заголовок: цена = `price`/`unitPrice`; сумма = `sum`, заголовок **Сумма**.
3. Если quick-add показывает «+ Цена» — колонки с рабочим price-key ещё нет.

## Type select (`text` / `number` / `currency`) — 2026-09-13 #2

PO: зачем менять type, если структура уже есть; не ломает ли код.

| Вопрос | Ответ по коду |
|--------|----------------|
| Влияет на подстановку цены/qty? | **Нет.** `lineValue` смотрит только `key` |
| Влияет на холст NX? | Почти нет — type копируется в settings, canvas не форматирует по type |
| BE | `type==='sum'\|'vat'` для footer — значений нет в FE dropdown |
| На скрине | `listPrice` + type currency → всё равно `—` (key не в aliases); второй `price` → `0` |

Итог: контрол для оператора **лишний/вредный** (выглядит важным, ничего не чинит). В PRICE-SUM TZ — lock/hide для known keys.

## Follow-up

TZ: `tasks/_ready/TZ-NX-DOCSTUDIO-TABLE-PRICE-SUM.md`
