# TZ-DOC-TABLES-309: Диалог таблиц — понятные подписи + выше поля колонок

РОЛЬ АГЕНТА: Frontend UI Engineer

ЗАВИСИМОСТИ: WAVE-DOC-TABLES 301–308 DONE; UX-318 DONE (другие keys)

LAYER: 3

PAGES: /doc-constructor/tables
PAGE_DOCS: tables.page.md

CONFLICT KEYS: frontend/src/app/pages/doc-constructor/tables/table-template-dialog.component.ts ; frontend/src/app/pages/doc-constructor/tables/table-template-dialog.component.spec.ts ; docs/pages/tables.page.md ; docs/pages/PAGE-TZ-INDEX.md

Проверено: `table-template-dialog.component.ts` L253–280 (кнопки «+ Добавить столбец» / «Пресет КП» / confirm); L437–460 (ключ/название/тип); CSS `.ttd-ih` / `.ttd-cell-input`; FE/BE `TableColumn` без `fontSize`. Чеклист PO: `docs/agent-checklists/PO-TABLES-DIALOG-UX-2026-08-15.md`.

Loose wording PO «пресет / канон КП» → UI: кнопка применения готовых колонок КП + confirm замены.

## ИСХОДНОЕ СОСТОЯНИЕ

1. Кнопка `Пресет КП` + confirm «Заменить текущие столбцы каноном КП?» — непонятны PO.
2. «+ Добавить столбец» создаёт пустую колонку с `ключ` / `название` / `тип`, но без объяснения, зачем ключ и откуда данные.
3. Поля в шапке колонки визуально низкие.
4. Размера шрифта колонки в таблицах **нет** (есть только в текстовых блоках) — **не** в этой TZ.

## ЧТО ДЕЛАТЬ

### ШАГ 1. Русские понятные подписи

1. Кнопку `Пресет КП` → **`Колонки как в КП`** (или короче, но без слова «пресет»).
2. Confirm: **`Заменить текущие столбцы на стандартные колонки КП (№, название, кол-во, ед., цена, сумма)?`**
   Кнопки: **Заменить** / **Отмена** (оставить).
3. `data-test` ключи (`apply-kp-preset`, `kp-preset-confirm`) **сохранить** (не ломать spec); менять только видимый текст.
4. Обновить spec, если там assert по тексту кнопки/confirm.

### ШАГ 2. Справка про «Добавить столбец»

Под тулбаром (или `title` + одна строка `text-muted` рядом с кнопками), RU ≤2 предложений:

- «Добавить столбец» = новая колонка в шаблоне.
- **Название** — заголовок на бланке; **ключ** — техническое имя (для КП бери из стандарта: `productName`, `quantity`, …); **тип** — как показывать значение.
- Свой ключ = колонка без автоподстановки из каталога.

Не делать длинный help-drawer.

### ШАГ 3. Выше поля редактирования колонки

1. Увеличить высоту/padding `.ttd-cell-input` (и при необходимости `.ttd-ih` / `.ttd-ih-fields`), чтобы ключ/название было удобнее целиться и читать.
2. Не раздувать весь диалог на весь экран; умеренно (+~4–8px высоты input, чуть больше padding шапки).
3. Light/dark читаемы.

### ШАГ 4. Page note

1. Строка в `docs/pages/tables.page.md` про 309 (copy + taller header fields).
2. Строка в `PAGE-TZ-INDEX.md` для `/doc-constructor/tables`.

## ИЗМЕНЯТЬ

- `table-template-dialog.component.ts` (+ styles в том же файле)
- `table-template-dialog.component.spec.ts` (если тексты в assert)
- `docs/pages/tables.page.md`
- `docs/pages/PAGE-TZ-INDEX.md`
- checklist / progress / archive по `GEMINI.md`

## НЕ ИЗМЕНЯТЬ

- Backend table-template schema / seed / PDF
- `fontSize` колонок (отдельная TZ после PO «да»)
- `proposal-create-table-editor` / Create КП
- Текстовые блоки (`text-block-editor`)
- Deploy / wipe

## КРИТЕРИИ ПРИЁМКИ

1. В UI нет слова «пресет» / «канон» на этой кнопке и в confirm; смысл «стандартные колонки КП» ясен.
2. Рядом с добавлением столбца есть короткая RU-справка про ключ/название/тип.
3. Поля ключ/название заметно выше/удобнее прежнего (визуально).
4. Поведение apply KP columns + confirm/cancel без регрессии (focused spec).
5. Gates:

```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm test -- table-template-dialog.component.spec
```

## known_limitation

- Размер шрифта ячеек таблицы не добавляем (нет в schema) → successor **TZ-DOC-TABLES-310** только по явному PO.
- Глубокий bind произвольных ключей к каталогу — вне scope.

## Финализация

Root TZ: checklist `docs/agent-checklists/TZ-DOC-TABLES-309.md` → gates →
`## Executor report (auto)` → archive `tasks/_archive/2026-08/TZ-DOC-TABLES-309.done.md`
по `GEMINI.md`. Deploy НЕ. Archive после Cursor/PO PASS.
