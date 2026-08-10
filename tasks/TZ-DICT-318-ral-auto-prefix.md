═══════════════════════════════════════════════════════════════
TZ-DICT-318: RAL — автопрефикс + ввод цифр
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Frontend UI Engineer
ЗАВИСИМОСТИ: Нет (параллельно DICT-317 ок, разные keys)
LAYER: 3
CONFLICT KEYS: frontend/src/app/pages/dictionaries/color-reference-form-dialog.component.ts; frontend/src/app/pages/dictionaries/color-references.page.ts; frontend/src/app/pages/dictionaries/color-reference-form-dialog.component.spec.ts; docs/pages/color-references.page.md; docs/agent-checklists/TZ-DICT-318.md

PAGES: /dictionaries/color-references
PAGE_DOCS: color-references.page.md

Проверено: color-reference-form-dialog — name free text, placeholder «RAL 9003 — …»; BE slugify(name); orphan twin color-references-form-dialog.component.ts не импортирован.

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

PO: при создании цвета по умолчанию подставлять английские буквы «RAL», вбивать только цифры (стандарт оформления).

Сейчас пользователь вынужден печатать `RAL 9003` целиком.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: UX формы create/edit
  - Поле **Код RAL** (digits): пользователь вводит `9003` / `9010`.
  - Визуально слева/prefix chip **`RAL`** (не часть editable value в input, либо readonly prefix в одном control).
  - Опционально второе поле **Название/описание** (напр. «Сигнальный белый») — если пусто, `name` = `RAL {code}`.
  - При submit: `name` = `RAL ${code}` или `RAL ${code} — ${title}` (тире как в placeholder).
  - Edit: парсить существующий name (`/^RAL\s*(\d+)/i`) → заполнить code; не ломать не-RAL имена (system «Не выбран» — dialog не открывается).

ШАГ 2: Defaults
  - Hex остаётся optional; slug optional (server).
  - Hint RU: «Введите номер RAL — префикс подставится сам».

ШАГ 3: Dead twin
  - Если `color-references-form-dialog.component.ts` (plural) дублирует selector и не используется — удалить **или** пометить deprecated в комментарии + не трогать page import. Предпочтение: **delete dead file** если grep = 0 imports.

ШАГ 4: Spec + page doc
  - Submit с code `9003` → API name starts with `RAL 9003`.
  - Page doc: RAL prefix UX.

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- Seed system color
- Catalog appearance hues (`/catalog/appearance`) — другой справочник
- Schema rename `name` → required still string

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Create: ввод `9003` (+ optional title) → сохранённый `name` содержит префикс `RAL `.
2. Edit существующего RAL: code предзаполнен цифрами.
3. Подсказка в UI видна (hint или footer note).
4. Gates: frontend tsc; jest dialog/page; archive + Executor report.

known_limitation: импорт полной таблицы RAL из файла — out of scope.
