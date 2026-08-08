# Аудит: ёмкость полей и плотность формы (QuickCreate L)

**Дата:** 2026-08-08  
**Триггер PO:** «Быстрое создание: Изделие» (профиль L) — появился скролл; большие вертикальные пробелы; Длина/Ширина/Высота/Вес занимают полширины, хотя вмещают 4–6 цифр.  
**Связь:** shell kinds A–D закрыты в **TZ-UX-DIALOG-302** — это **ширина окна**. Этот аудит — **внутри формы**: как поля делят строку по *данным*, а не «всем поровну 50%».  
**TZ исполнения:** `TZ-UX-FORM-301`  
**Шпаргалка:** [`docs/pages/ui-form-field-capacity.md`](../pages/ui-form-field-capacity.md)

---

## 1. Вердикт (одной фразой)

Скролл возник не потому что «мало пикселей окна», а потому что **наивная 2-колоночная сетка** раздувает короткие числовые поля до половины диалога, плюс **крупный вертикальный gap** и **высокие textarea** (описание/заметки). Нужен второй эталон: **канон ёмкости полей (Field Capacity)** поверх kind B.

| Слой | Что решает | Статус |
|------|------------|--------|
| Dialog kinds A–D | ширина/variant оболочки | DONE (302) |
| Field Capacity | span/ширина input по типу данных + плотная упаковка рядов | **P0 → FORM-301** |
| UX-FORM-CANON | валидация без thrash layout | уже есть (не трогать смысл) |

---

## 2. Как назвать грамотно

| RU (для PO/доков) | EN (для кода/TZ) | Смысл |
|-------------------|------------------|--------|
| **Ёмкость поля** | `fieldCapacity` | Сколько символов/цифр реально вводят → целевая ширина control |
| **Плотность формы** | `formDensity` | Вертикальный gap, высота textarea, «воздух» между рядами |
| **Упаковка ряда** | `row packing` / `span` | Несколько коротких полей в **одной** строке |

Не путать с FormProfile S/M/L (это **набор полей + ширина диалога**), и не с global density service (тема/spacing всего UI).

---

## 3. Почему скролл на скрине (диагноз)

Факт по коду QuickCreate после DIALOG-302:

1. M/L → `md:grid-cols-2` + `gap-form-field` — **каждое** поле = 50% ширины.
2. `dimLength` / `dimWidth` / `dimHeight` / `dimUnit` / `weightKg` идут как обычные number/select → **5 полурядов** вместо одной «ленты габаритов».
3. `description` / `notes` — `textarea rows=3` + `col-span-2` → два высоких блока внизу.
4. Body `max-h ~70vh` + overflow → скролл **симптома**; корень — плохая упаковка.

PO-ожидание (эталон упаковки product L):

- Габариты + вес (+ ед. габаритов) — **одна строка**, ширина control ≈ ёмкость (цифры + небольшой запас).
- Название — широкое; короткие (ед., прайс, артикул) — узкие/средние.
- Описание/заметки — full-width, но **низкие** (≈2 строки), не «простыня».
- Вертикальный ритм QuickCreate — **компактнее** комфортного page-form.

Цель AC: при типичном product L на desktop (~1280×720+) body **без скролла** или скролл ≤ ~40px (не «половина формы»).

---

## 4. Канон ёмкости (таксономия)

Сетка-каркас для kind B (QuickCreate M/L): **12 колонок** (или эквивалент flex с max-width на nano).  
Mobile (&lt;md): всё в 1 колонку, порядок = порядок FieldKey в профиле.

| Capacity | Типичная ёмкость данных | Span (12-col) | max-width control (ориентир) | Примеры FieldKey |
|----------|-------------------------|---------------|------------------------------|------------------|
| **nano** | 1–6 цифр / короткий enum | 2 | ~4.5–5.5rem | dimLength, dimWidth, dimHeight, weightKg, width, height, depth, weight |
| **xs** | короткий код / ед. | 2–3 | ~6–7rem | unit, dimUnit, listPrice (если ≤6 знаков+коп.) |
| **sm** | артикул, короткие select | 3–4 | — | sku, article, kind, status |
| **md** | обычный select / mid text | 4–6 | — | categoryId, isActive (с лейблом) |
| **lg** | длинное имя | 6–8 | — | name |
| **xl / full** | prose | 12 | — | description, notes |

Правила упаковки:

1. Ряд заполняется слева направо, суммарный span ≤ 12; переполнение → новый ряд.
2. Поля одной **группы** (габариты) не разрывать пустым «дырявым» рядом: `dimLength…weightKg` пакуются **подряд в один band**.
3. `full` всегда на своей строке; textarea **rows ≤ 2** в QuickCreate (FullEditor может больше).
4. Ширина **input** у nano/xs может быть меньше ячейки (`max-w-*` + `w-full` внутри), чтобы не выглядеть «пустым ангаром».
5. Hint под полем (как «Из справочника…») — только если не раздувает ритм; иначе `title` / sr-only.

Реестр: расширить `field-key-registry.ts` (или соседний `field-capacity.ts`) константой  
`FIELD_CAPACITY: Record<fieldKey, 'nano'|'xs'|'sm'|'md'|'lg'|'full'>` — **без** выдумывания новых FieldKey вне allowlist DICT-314/315.

---

## 5. Целевая упаковка product L (эталон для AC)

Порядок ключей в профиле может остаться; **визуальный** порядок рядов:

| Ряд | Поля | Логика |
|-----|------|--------|
| 1 | name (lg) + kind (sm) | имя шире вида |
| 2 | unit (xs) + sku (sm) + listPrice (xs) + categoryId (md) | короткие коммерческие |
| 3 | isActive (md) + status (sm) | флаги |
| 4 | dimLength · dimWidth · dimHeight · dimUnit · weightKg | **одна nano-лента** |
| 5 | description (full, rows=2) | |
| 6 | notes (full, rows=2) | |

Module L: `width|height|depth|weight` — та же nano-лента; `article` sm; `notes` full.

---

## 6. Плотность (formDensity в QuickCreate)

| Параметр | Сейчас (симптом) | Канон QuickCreate |
|----------|------------------|-------------------|
| grid gap | `gap-form-field` (крупно) | `gap-x-3 gap-y-2` (или token compact) |
| textarea rows | 3 | **2** |
| label | uppercase + крупный stack | сохранить стиль PiFormField, но не добавлять лишний margin |
| checkbox row | min-h-touch раздувает | допустим touch, но не двойной padding ряда |

Не менять global `density.service` в этом TZ.

---

## 7. Что НЕ делать

- Не откатывать xl/2-col shell DIALOG-302 «назад в узкий столбец».
- Не плодить третий FormProfile size ради плотности.
- Не менять BE allowlist / required locked.
- Не переписывать все FullEditor (kind C) в том же TZ — только QuickCreate (+ registry); FullEditor → successor по необходимости.
- Не решать скролл одним `overflow:hidden` без упаковки.

---

## 8. Successors (после FORM-301)

| ID (черновик) | Зачем |
|---------------|--------|
| FORM-302 | PiFormField / token compact gap для kind B/C |
| FORM-303 | FullEditor product — та же ёмкость габаритов |
| chrome UX-302 | page chrome (отдельный поток) |

---

## 9. Status

- Audit + шпаргалка — этот коммит (Cursor).  
- Исполнение упаковки — **TZ-UX-FORM-301**.
