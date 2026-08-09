═══════════════════════════════════════════════════════════════
TZ-DOC-TABLES-307: Категория «КП» + пресет колонок позиций
═══════════════════════════════════════════════════════════════

PAGES: /doc-constructor/tables
PAGE_DOCS: tables.page.md
Аудит: docs/audits/2026-08-09-kp-table-config-canon.md §4–§5A
Статус: READY (после visual PASS DOC-TABLES-305 или параллельно, если keys не пересекаются с dialog WIP)

РОЛЬ АГЕНТА: fullstack (BE enum/seed + FE dialog)
ЗАВИСИМОСТИ: WAVE-DOC-TABLES 301–304 DONE; 305 dialog compact желательно DONE (иначе не ломать его WIP)
LAYER: 2–3
CONFLICT KEYS: backend/src/modules/table-template/table-template.schema.ts; backend/src/modules/table-template/dto/create-table-template.dto.ts; backend/src/modules/table-template/table-template.service.ts; frontend/src/app/pages/doc-constructor/tables/table-template-dialog.component.ts; frontend/src/app/pages/doc-constructor/tables/tables.page.ts; docs/pages/tables.page.md

Проверено: `TableTemplateCategory` = product-spec|cost-calc|order-summary|price-list|custom (`table-template.schema.ts` 34–47); columns = key/label/type/width/align; bind Create уже ждёт keys из TZ-SALES-325; клиент = Counterparty, не Organization.

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ
═══════════════════════════════════════════════════════════════

1. Для КП нужны колонки № / Наименование / Кол-во / Ед. / Цена / Сумма — сейчас их вручную собирают.
2. PO: пресет обязателен; категории пресетов расширяемы (не только КП).
3. Create правит **экземпляр** (SALES-330) — эта TZ только **библиотеку пресетов** в Документах.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

1. **Enum category**
   - Добавить `kp` в `TableTemplateCategory` + `TABLE_TEMPLATE_CATEGORIES`.
   - FE labels: «КП» (коротко); остальные категории без регрессии.
   - DTO / overflow «Тип» подхватывает новое значение.

2. **Канон default columns (shared constant)**
   - Один SoT-массив (BE export или shared JSON comment в service), ключи строго:
     `index`, `productName`, `quantity`, `unit`, `unitPrice`, `sum`
     с RU labels: № · Наименование · Кол-во · Ед. · Цена · Сумма
     types: number / text / number / text / currency / currency.
   - Не invent других keys в MVP.

3. **Seed / ensure preset**
   - При старте модуля или явной ensure-методе: если нет активного TableTemplate с `category:'kp'` и именем вроде «КП — позиции» — создать.
   - Идемпотентно (повторный boot не дублирует).
   - `isActive: true`, разумный `sortOrder`.

4. **UI «Применить пресет колонок»**
   - В диалоге таблицы: кнопка/меню — подставляет default set для **выбранной** категории.
   - Для `kp` — колонки из п.2; для других категорий MVP: либо тот же набор (если PO выбрал «как КП»), либо no-op + RU hint «пресет пока только для КП» — **предпочтительно:** пресет KP-колонок доступен из меню для любой категории (PO п.3 — «и другим категориям»), не только при `category===kp`.
   - Замена колонок — с confirm, если columns уже непустые.
   - Не трогает Create КП и не пишет в Quotation.

5. **Docs + tests**
   - `tables.page.md`: категория КП, seed, apply-preset.
   - Unit/e2e: create with category kp; apply preset → 6 columns с канон keys.

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ / НЕ ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

- Create КП UI / proposal-create* (→ 330)
- Footer НДС / наценка на листе (→ 331)
- PATCH TableTemplate из Create
- DocumentTemplate builder mega-rewrite / DOC-343 keys
- deploy; EAV колонки «из воздуха» без key
- Менять aliases bind 325 (только обеспечить keys пресета совместимы)

known_limitation:
- Пресеты «спецификация/калькуляция» своими наборами — later.
- Авто-подстановка пресета в Create instance — TZ-SALES-330.

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. В «Тип» таблицы есть «КП»; можно сохранить шаблон с `category: kp`.
2. После ensure в списке есть «КП — позиции» (или эквивалент) с 6 канон keys.
3. «Применить пресет» вставляет/заменяет колонки на канон set (с confirm если было непусто).
4. Gates:
   ```
   cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
   cd backend && pnpm test -- --testPathPattern=table-template
   cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
   ```
5. Page doc обновлён; PAGE-TZ-INDEX строка tables.
6. Executor report (auto); archive после Cursor/PO PASS.

Финализация: `tasks/_archive/2026-08/TZ-DOC-TABLES-307.done.md`.
