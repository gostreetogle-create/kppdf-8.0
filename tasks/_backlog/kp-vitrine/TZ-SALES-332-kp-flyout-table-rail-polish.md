═══════════════════════════════════════════════════════════════
TZ-SALES-332: Create КП — sync колонок + rail «Таблица» + polish flyouts
═══════════════════════════════════════════════════════════════

PAGES: /proposals/create
PAGE_DOCS: proposals-create.page.md
Аудит: docs/audits/2026-08-09-kp-create-flyout-polish-audit.md
SPEC NOTE: размораживает `kp-create-studio-spec.md` §0 п.2 только так:
  Right rail = **Параметры + Таблица** (две иконки). Остальной FROZEN (A4 overlay) держать.

РОЛЬ АГЕНТА: frontend (+ тонкий BE/API read columns если нужно)
ЗАВИСИМОСТИ: TZ-SALES-330 DONE; TZ-SALES-331 archive/DONE или не трогать её keys в одном коммите
LAYER: 3
CONFLICT KEYS: frontend/src/app/pages/commercial/proposals/proposal-create.page.ts; frontend/src/app/pages/commercial/proposals/proposal-create.page.spec.ts; frontend/src/app/pages/commercial/proposals/proposal-create-inspector.component.ts; frontend/src/app/pages/commercial/proposals/proposal-create-template-picker.component.ts; frontend/src/app/shared/services/pi-document-templates.service.ts; frontend/src/app/shared/services/pi-table-templates.service.ts; docs/pages/proposals-create.page.md; docs/ux/kp-create-studio-spec.md

Проверено: DEFAULT_KP_TABLE_LAYOUT всегда на template change; BE `resolvePreviewColumns` fallback на все columns если layout keys miss; скрин PO — лист ≠ панель; клиент = Counterparty later.

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ
═══════════════════════════════════════════════════════════════

1. PO visual FAIL: панель «студенческая», ↑↓, «Показать» не влияет на лист, «Пресет» непонятен, витрина клипается.
2. Root cause hide: панель ≠ columns реального table-template.
3. Pride bar: коллегам нельзя показывать текущий flyout chrome.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

1. **Sync layout ← реальная таблица бланка**
   - После выбора DocumentTemplate: найти target line-items table (те же правила, что 325: kpLineItems / одна live table).
   - Загрузить columns TableTemplate (`GET /api/table-templates/:id` или уже есть list cache).
   - `kpTableLayout` = эти columns (key, label RU, visible:true), порядок как в шаблоне.
   - DEFAULT_KP set — только fallback, если table без columns / нет target.
   - Unit/FE test: template with keys photo/name/sku → inspector показывает те же labels.

2. **Hide/reorder реально меняют лист**
   - visible:false → колонка отсутствует в thead (уже умеет BE, если keys match).
   - Если после filter selected пуст — **не** silently возвращать все columns; оставить пустой/skeleton + RU hint в панели «Все колонки скрыты» ИЛИ запретить скрыть последнюю видимую.
   - Кнопки **← →** (data-test kp-table-left/right), aria «Левее/Правее».
   - Toggle label: **«Видна»** / **«Скрыта»** (состояние), не «Показать» при visible=true.

3. **Правый rail: две иконки**
   - Параметры (⚙) → org / наценка / НДС / оценка / клиент-stub.
   - Таблица (иконка Table / Grid) → только секция раскладки.
   - Взаимно исключают; active gold как left rail.
   - Обновить `kp-create-studio-spec.md` §0 п.2 + page doc.

4. **Chrome polish (обязательный visual)**
   - Flyout padding ≥ 12–16px inward; gap секций ≥ 12px; убрать «слипание» border-to-edge.
   - Column rows: аккуратный row kit (не raw border-button каша); предпочтительно `PiButton` size sm / ghost для ← → и toggle.
   - CTA: `PiButton` ghost/secondary «Открыть шаблон таблицы» → `/doc-constructor/tables` (+ editId если известен).
   - Left flyouts (Шаблон/Товары): тот же внутренний padding, что справа (паритет).

5. **Витрина не клипается**
   - Open Товары → закрыть right flyout **или** max-width products учитывает ширину open right flyout + rails.
   - AC visual: 3 md-карточки читаемы, правый край не режется панелью Параметры/Таблица.
   - Не сжимать A4 center (overlay rule FROZEN).

6. **Tests + docs**
   - FE specs: layout sync; toggle visible → build payload visible:false; left/right reorder.
   - proposals-create.page.md + audit link; spec §0 update.
   - Visual PO checklist в Executor report.

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ / НЕ ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

- Docked 3-column / resize A4 при open flyout
- Save Quotation / Counterparty picker (successor)
- PATCH TableTemplate из Create
- Print 320 / snapshot 322
- Переписывать Paper & Ink global tokens
- deploy
- Ломать 331 footer/VAT если уже в main — только не регрессировать

known_limitation:
- Полный drag-reorder колонок — later (достаточно ← →).
- Тексты на бланке править в Create — out of scope.

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Колонки в панели «Таблица» = заголовки на A4 для выбранного шаблона.
2. «Скрыта» убирает колонку с листа; «Видна» возвращает; ← → меняет порядок на листе.
3. Правый rail: две иконки Параметры / Таблица.
4. Нет текста «Пресет в Документах»; есть кнопка «Открыть шаблон таблицы».
5. Витрина товаров не обрезана правой панелью.
6. Flyout padding/воздух — PO visual PASS (pride).
7. Gates:
   ```
   cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
   cd frontend && pnpm test -- --testPathPattern=proposal-create
   ```
   (+ BE tsc/test только если трогали fallback empty-selected).
8. Executor report (auto); archive после Cursor/PO visual PASS.

Финализация: `tasks/_archive/2026-08/TZ-SALES-332.done.md`.
