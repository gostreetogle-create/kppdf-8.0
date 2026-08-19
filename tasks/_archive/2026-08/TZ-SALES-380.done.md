# TZ-SALES-380: Дефолт переноса строк на блоке таблицы в конструкторе шаблона

PAGES: /doc-constructor/builder/:id ; /proposals/create
PAGE_DOCS: templates.page.md ; proposals-create.page.md

РОЛЬ АГЕНТА: fullstack
ЗАВИСИМОСТИ: TZ-SALES-376 DONE · TZ-SALES-378 DONE
LAYER: 3

CONFLICT KEYS:
backend/src/modules/document-template/document-template.schema.ts;
backend/src/modules/document-template/dto/create-document-template.dto.ts;
backend/src/modules/document-template/document-template.service.ts;
backend/src/modules/template-block/template-block.schema.ts;
frontend/src/app/pages/doc-constructor/builder/builder-inspector.component.ts;
frontend/src/app/pages/commercial/proposals/proposal-create.page.ts;
frontend/src/app/pages/commercial/proposals/proposal-create-inspector.component.ts;
docs/pages/proposals-create.page.md;
docs/pages/PAGE-TZ-INDEX.md

Проверено:
- KP3 `metadata.tablePageBreakFirstPage/NextPages` → KP8 `sheetLayout.rowsFirstPage/rowsNextPage`
  (`docs/audits/2026-08-12-kp3-to-kp8-field-map.md` §3)
- Create КП: поля только в Параметры→«Вид листа» (`proposal-create-inspector.component.ts` ~233)
- Builder inspector для `type=table`: только `tableTemplateId`, **нет** переноса строк
  (`builder-inspector.component.ts` ~744)
- Auto split при `0/0` читает `layout.height` рамки line-items (`document-template.service.ts`
  `estimateAutoRowCapacity`) — высота уже влияет, но числа строк в шаблоне не сохраняются

Loose wording PO «через какую строку на следующую страницу» → канон:
`rowsFirstPage` / `rowsNextPage` (0 = авто по рамке), не отдельное «после строки N» в builder
(per-row = `pageBreakBefore` в Редакторе таблицы, уже есть TZ-370).

## ИСХОДНОЕ СОСТОЯНИЕ

1. Менеджер меняет высоту рамки таблицы в builder, но дефолт переноса задаёт только в Create КП.
2. Новый КП после выбора шаблона получает `rowsFirstPage/rowsNextPage = 0` всегда.
3. Нет связи «рамка + дефолт строк» в одном месте при проектировании бланка.

## ЧТО ДЕЛАТЬ

### 1. Backend — хранение дефолта на шаблоне

На `DocumentTemplate` добавить опционально:

```ts
defaultSheetLayout?: {
  rowsFirstPage?: number;  // 0…200, default 0
  rowsNextPage?: number;   // 0…200, default 0
}
```

- PATCH/CREATE DTO + migration-safe defaults (поле отсутствует = `{0,0}`).
- **Не** дублировать photoScale/showPhotoColumn здесь — они остаются в `Quotation.sheetLayout`.

Альтернатива отвергнута: только `TemplateBlock.settings` — line-items block может
отсутствовать; дефолт логичнее на уровне DocumentTemplate.

### 2. Builder — UI на блоке line-items таблицы

В `builder-inspector` когда выбран table-block с `settings.role === 'line-items'`
(или единственная live table с kpLineItems — как в build resolver):

- Секция **«Перенос на страницы»** под высотой/layout:
  - «Строк на 1-й странице» (number, 0 = авто по рамке)
  - «Строк на следующих» (number, 0 = авто)
- **State ownership:** значения читаются из `template().defaultSheetLayout` (input signal),
  **не** из `block.settings`. Emit `templatePatch` / PATCH `DocumentTemplate`, не block update.
- Hint RU: «0 — автоматически по высоте рамки; явное число — override для всех новых КП
  с этим бланком».

Preview builder (single page) **не** обязан показывать multipage — только сохранение дефолта.

### 3. Create КП — hydrate

При выборе шаблона / resume draft в **`proposal-create.page.ts` / inspector**:

- Если локальный `sheetLayout.rowsFirstPage/rowsNextPage` ещё default (0/0) **и**
  у шаблона задан `defaultSheetLayout` — подставить в `sheetLayout` signal.
- Явно изменённые менеджером числа **не** перетирать при rebuild preview.
- Backend build **не** менять — числа приходят через существующий `BuildDocumentDto.sheetLayout`.

### 4. Docs + tests

- `proposals-create.page.md` — строка про дефолт из шаблона (380)
- BE spec: template with `{rowsFirstPage:4, rowsNextPage:6}` + build split unchanged
- FE spec: pick template → inspector shows inherited defaults OR hydrate on template change

## НЕ ИЗМЕНЯТЬ

- Multipage render shell (378) — только читать те же поля через hydrate
- Per-row `pageBreakBefore` (370)
- Shared `TableTemplate` schema
- Multi-page canvas (`layout.page > 1`) — out of scope

## КРИТЕРИИ ПРИЁМКИ

1. В builder на line-items таблице можно сохранить «Строк на 1-й / следующих»; F5 builder
   восстанавливает значения.
2. Новый Create КП с этим шаблоном: «Вид листа» показывает те же числа (до ручной правки).
3. `0/0` + низкая рамка → auto split как 376 (регрессия).
4. Gates:
   ```text
   cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
   cd backend && pnpm test -- document-template
   cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
   cd frontend && pnpm exec jest --testPathPattern="builder-inspector|proposal-create" --runInBand
   ```

## known_limitation

- Дефолт на шаблоне не мигрирует старые сохранённые КП с уже записанным sheetLayout.
- «Строка N» как абсolut — только через `pageBreakBefore` на строке, не в builder.

Финализация: `tasks/_archive/2026-08/TZ-SALES-380.done.md` + lock + checklist.
