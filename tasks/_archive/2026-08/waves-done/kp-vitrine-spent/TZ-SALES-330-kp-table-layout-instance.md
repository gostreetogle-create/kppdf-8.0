═══════════════════════════════════════════════════════════════
TZ-SALES-330: Create КП — экземпляр раскладки таблицы (порядок / видимость)
═══════════════════════════════════════════════════════════════

PAGES: /proposals/create
PAGE_DOCS: proposals-create.page.md
Аудит: docs/audits/2026-08-09-kp-table-config-canon.md §3 §5B–C
Статус: READY после DOC-TABLES-307 (пресет keys) **или** параллельно с hardcoded default set, если 307 ещё не в main — тогда скопировать канон columns в FE constant
Зависит от: TZ-SALES-325 DONE (previewLines bind)

РОЛЬ АГЕНТА: fullstack
ЗАВИСИМОСТИ: 325 DONE; 307 желательно; не смешивать с 331 footer/VAT (можно сразу после)
LAYER: 3
CONFLICT KEYS: backend/src/modules/document-template/dto/build-document.dto.ts; backend/src/modules/document-template/document-template.service.ts; backend/src/modules/table-template/table-template.service.ts; frontend/src/app/pages/commercial/proposals/proposal-create.page.ts; frontend/src/app/pages/commercial/proposals/proposal-create.page.spec.ts; frontend/src/app/pages/commercial/proposals/proposal-create-inspector.component.ts; frontend/src/app/shared/services/pi-document-templates.service.ts; docs/pages/proposals-create.page.md

Проверено: bind 325 мапит по column.key шаблона; Create inspector = org + наценка; shell 317 FROZEN; draftLines in-memory; клиент = Counterparty later.

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ
═══════════════════════════════════════════════════════════════

1. PO хочет двигать столбцы **в каждом КП**, не только в общем шаблоне.
2. Общий `TableTemplate` нельзя тихо переписывать из Create (иначе все бланки пляшут).
3. Нужен copy-on-write `kpTableLayout` + панель «Таблица» в правом flyout.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

1. **Модель экземпляра (FE session)**
   - `kpTableLayout: { columns: { key: string; label?: string; visible: boolean }[] }`
   - При выборе шаблона / первом build с line-items target:
     a) взять columns из TableTemplate target (GET или из build meta — минимально: отдельный GET table-template / embed в ответе build);
     b) если нет обязательных keys (`productName`, `quantity`, и `unitPrice` или `sum`) — долить default КП set (тот же канон, что 307);
     c) сохранить в signal; **не** PATCH TableTemplate.

2. **DTO build**
   - Опционально `tableLayout?: { key: string; visible?: boolean }[]` (порядок = порядок массива).
   - Только для line-items target; snapshot tables не трогать.
   - class-validator + forbidNonWhitelisted совместимость.

3. **BE render**
   - При наличии `tableLayout`: рендерить thead/tbody в этом порядке; `visible:false` → колонка отсутствует.
   - Значения ячеек — как 325 + alias для `index` → 1-based row number.
   - Без `tableLayout` — поведение 325 (columns шаблона as-is).

4. **UI Create — секция «Таблица»**
   - В правом flyout (inspector): секция/заголовок **«Таблица»** под Параметрами **или** отдельный sub-panel по тому же overlay-паттерну 317 (не ломать FROZEN shell: overlay, не dock).
   - Список столбцов экземпляра: label RU, кнопки ↑↓, toggle «показать».
   - Любое изменение → debounce rebuild с `tableLayout` + `previewLines`.
   - Ссылка-кнопка «Пресет в Документах» → `/doc-constructor/tables` (или `?editId=` если известен tableTemplateId).
   - RU hint одной строкой: «Меняет только это КП, не общий шаблон».

5. **Tests + docs**
   - BE: layout order меняет порядок th; hidden key отсутствует.
   - FE: reorder → build вызван с tableLayout.
   - proposals-create.page.md: instance layout + ссылка на канон-аудит.

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ / НЕ ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

- FROZEN shell 317 (A4 center, rails, overlay)
- Persist Quotation / snapshot layout (later)
- Footer НДС (→ 331)
- Менять наценку→цену (→ 331, можно stub)
- PATCH shared TableTemplate из Create
- Print 320 / BuilderCanvas / deploy
- Per-line discount column

known_limitation:
- Layout пока только in-memory до Save-snapshot successor.
- Ширины колонок / drag-resize — later (достаточно ↑↓).
- Добавление произвольного нового key «с нуля» в Create — out of scope (только reorder/hide пресета).

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. На Create можно поднять/опустить столбец → лист показывает новый порядок после rebuild.
2. Скрытие столбца убирает его с листа; данные draftLines не теряются.
3. Shared TableTemplate в Mongo после манипуляций Create **не** меняется.
4. Hint «только это КП» виден в панели.
5. Gates:
   ```
   cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
   cd backend && pnpm test -- --testPathPattern=document-templates-build
   cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
   cd frontend && pnpm test -- --testPathPattern=proposal-create
   ```
6. Visual PO: панель понятна; лист обновляется; scroll 323 не регрессирует.
7. Executor report (auto); archive после Cursor/PO PASS.

Финализация: `tasks/_archive/2026-08/TZ-SALES-330.done.md`.
