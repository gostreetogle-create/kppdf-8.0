═══════════════════════════════════════════════════════════════
TZ-DOC-TABLES-305: Table dialog compact + fields multi-select
═══════════════════════════════════════════════════════════════

> Domain: `TableTemplate` (не DocumentTemplate).
> **Категория** = enum `TableTemplateCategory` (product-spec | cost-calc |
> order-summary | price-list | custom) — **метка/группа** для списка и
> будущего фильтра пикера таблиц. **Не** `DocumentTemplateCategory` и не
> справочник «Категории шаблонов документов».
> Проверено: `table-template-dialog.component.ts` (chips category; fields
> `max-height:100px` scroll); `table-template.schema.ts` L34–47; list
> column `category` в `tables.page.ts`; DOC-TABLES-302 уже дал overflow
> для «Источник» / тип столбца.

РОЛЬ АГЕНТА: Frontend UI Engineer

ЗАВИСИМОСТИ: TZ-DOC-TABLES-302…304 DONE

LAYER: 2–3 (если трогаешь shared overflow-select — Layer 2; dialog alone = 3)

PAGES: /doc-constructor/tables
PAGE_DOCS: tables.page.md ; ui-overflow-select.md (если расширяешь multi)

CONFLICT KEYS: frontend/src/app/pages/doc-constructor/tables/table-template-dialog.component.ts; frontend/src/app/pages/doc-constructor/tables/table-template-dialog.component.spec.ts; frontend/src/app/shared/ui/overflow-select/pi-overflow-select.component.ts; frontend/src/app/shared/ui/overflow-select/pi-overflow-select.component.spec.ts; docs/pages/tables.page.md; docs/pages/ui-overflow-select.md

НЕ пересекать: DOC-344 builder keys; SALES-317 proposals; DOC-342 BE upload.

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ / ВЕРДИКТ ПО «КАТЕГОРИИ»
═══════════════════════════════════════════════════════════════

1. PO не понимает chips «Спецификация / Калькуляция / …».
2. Это **не** фильтр каталога изделий и не категории шаблонов документов.
3. Это **тип/группа** шаблона таблицы (enum в schema) — колонка в списке
   «Все таблицы»; позже удобно фильтровать пикер таблиц в builder.
4. **Не удалять.** В UI:
   - заменить chips на `PiOverflowSelect`;
   - лейбл: **«Тип»** (или «Категория» + hint «группа в списке»);
   - значения = те же 5 enum (RU labels как сейчас).
5. Справочник своих типов в «Справочниках» — **не в этой TZ**
   (known_limitation → successor, если PO подтвердит CRUD).

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: COMPACT SETTINGS ROW

  Верх диалога — **одна плотная строка** (wrap на узком окне ок):
  - Название (flex, required)
  - Описание (flex)
  - Тип/Категория — overflow-select (enum items)
  - Порядок — узкий number (~w-16…w-20)
  - Активен — switch
  Убрать второй ряд pills; убрать лишний вертикальный воздух (`gap` уменьшить).
  Цель: секция settings не раздувает диалог; больше места превью столбцов.

ШАГ 2: ПОЛЯ ИСТОЧНИКА — MULTI OVERFLOW (не scroll-box)

  Заменить `.ttd-field-list` (max-h 100px + internal scroll) на:
  - **Trigger** как overflow-select: текст «N выбрано» / краткий список лейблов;
  - **Panel** CDK overlay **поверх** диалога (как `PiOverflowSelect`),
    высота почти полная: `max-h-[min(70vh,28rem)]` или выше до ~80vh;
  - Внутри: чекбоксы полей + type meta; при ≥10 — поиск (`searchable="auto"`);
  - Toggle чекбокса = текущая логика `toggleField` (добавить/убрать столбец).

  Предпочтительно: расширить `PiOverflowSelect` режимом `multiple`
  (или тонкий sibling `PiOverflowMultiSelect` в той же папке) — канон
  `docs/pages/ui-overflow-select.md` обновить одной секцией Multi.
  Запрещено: native `<select multiple>` / `size=N` внутри dialog.

ШАГ 3: СТОЛБЦЫ ЧУТЬ ВЫШЕ

  В interactive thead (`.ttd-ih` / header cells): увеличить вертикальный
  padding / min-height шапки столбца (~+4–8px), чтобы номер+лейбл+key
  читались свободнее. Не раздувать весь диалог сверх разумного.

ШАГ 4: TESTS + DOCS

  - Jest: category select emit/value; fields multi open + toggle still
    syncs columns; compact row smoke.
  - `tables.page.md`: Mode B settings layout + «Тип» = enum grouping;
    fields = multi overflow.
  - Gates ниже.

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- BE schema enum / API category values (только FE control)
- Registry / DOC-TABLES-304 schema sync
- Builder tool-pane text categories (другая сущность)
- Новый CRUD справочника типов таблиц
- DOC-344 / SALES-317

known_limitation:
- Custom table-template types in Dictionaries — successor после PO ok
- Filter by type in builder table picker — later (после стабильного enum UI)

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Нет chips-ряда категории; Тип = overflow-select; значение сохраняется.
2. Поля источника: нет внутреннего scroll-box 100px; multi-panel overlay
   раскрывается высоко поверх диалога; поиск при ≥10.
3. Settings компактно (одна линия / плотный wrap); пустое «серое море»
   под формой уменьшено за счёт компактности верха.
4. Шапка столбцов visually чуть выше (PO eyeball).
5. Gates:
   ```
   cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
   cd frontend && pnpm test -- --testPathPattern="table-template-dialog|overflow-select"
   ```
6. Checklist + Executor report (auto); archive после Cursor/PO PASS (visual dialog).

═══════════════════════════════════════════════════════════════
ФИНАЛИЗАЦИЯ
═══════════════════════════════════════════════════════════════

GEMINI.md → `tasks/_archive/2026-08/TZ-DOC-TABLES-305.done.md`
