# TZ-SALES-325: Create КП — draftLines → table на бланке (live bind)

PAGES: /proposals/create  
PAGE_DOCS: proposals-create.page.md  
Аудит: `docs/audits/2026-08-09-kp-create-preview-wave2.md` §C  
Статус готовности: **после PASS 323+324**; до того — не claim  
Зависит от: TZ-SALES-323 (fit), TZ-SALES-324 (skeleton empty)

РОЛЬ АГЕНТА: fullstack  
ЗАВИСИМОСТИ: 323 DONE visual scroll; 324 DONE skeleton; **не** смешивать с 322 snapshot  
LAYER: 3  
CONFLICT KEYS: backend/src/modules/document-template/dto/build-document.dto.ts; backend/src/modules/document-template/document-template.service.ts; backend/src/modules/table-template/table-template.service.ts; frontend/src/app/pages/commercial/proposals/proposal-create.page.ts; frontend/src/app/pages/commercial/proposals/proposal-create.page.spec.ts; frontend/src/app/shared/services/pi-document-templates.service.ts; docs/pages/proposals-create.page.md

Проверено: `build(id, { organizationId? })` без lines (`proposal-create.page.ts` 325–327); `BuildDocumentDto` whitelist ids only (`build-document.dto.ts` 19–36); `resolveTableBlock` → `preview(sampleRows)` only (604); `ProposalDraftLine` = `{ productId, productName, quantity, unitPrice }` (`proposal-product-rail.component.ts`); Quotation items schema аналогичен; клиент = Counterparty (не Organization).

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ
═══════════════════════════════════════════════════════════════

1. PO ждёт: добавил изделие в рейл «Товары» → строки видны в таблице шаблона на листе.
2. Сейчас это **by-design gap** (319 stub policy), не баг клика.
3. Без явного column-contract нельзя угадывать mapping.

═══════════════════════════════════════════════════════════════
КОНТРАКТ КОЛОНОК (обязателен — не invent)
═══════════════════════════════════════════════════════════════

При live bind строка `ProposalDraftLine` мапится в ячейки table-template **по `column.key`** (case-insensitive):

| Draft field | Принимаемые `column.key` |
|-------------|---------------------------|
| `productName` | `productName`, `name`, `title`, `product`, `наименование` |
| `quantity` | `quantity`, `qty`, `count`, `кол-во`, `количество` |
| `unitPrice` | `unitPrice`, `price`, `unit_price`, `цена` |
| computed `quantity * unitPrice` | `sum`, `total`, `amount`, `сумма` |

- Колонки с неизвестным key → пустая ячейка.
- Если у шаблона **несколько** table-блоков — заполнять **все** live table-template blocks одинаковыми draft rows (MVP). Snapshot-mode table (`source.mode === 'snapshot'`) — **не** трогать (как сейчас в resolveTableBlock).
- Пустой `draftLines` → поведение **324** (skeleton 1 empty row), не «Нет данных».

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

1. **DTO**
   - Расширить `BuildDocumentDto` опциональным массивом строк превью, напр. `previewLines?: { productName: string; quantity: number; unitPrice: number }[]` (без обязательного productId в HTML path).
   - class-validator: optional array, nested numbers ≥ 0; whitelist совместим с `forbidNonWhitelisted`.

2. **BE render path**
   - В `resolveTableBlock` / `preview`: если переданы `previewLines` (через build bag или аргумент) — рендерить `<table>` thead из columns + tbody из mapped rows (formatCell types currency/number/text).
   - Не требовать `quotationId` для Create preview.
   - Не писать в Mongo Quotation в этой TZ.

3. **FE Create**
   - `build(id, { organizationId?, previewLines: draftLines mapped })` при каждом rebuild.
   - Rebuild также на `onProductAdd` (debounce уже есть — триггерить `rebuildPreview$.next()`).
   - Не рисовать bullet list поверх листа (запрет 319 сохраняется).

4. **UX copy (rail)**
   - Если нужно — одна короткая RU-подпись в панели Товары: «Позиции отображаются в таблице шаблона» (не тост-спам).

5. **Tests + docs**
   - BE: preview/build с previewLines → td содержат имя/qty/price.
   - FE: add product → build вызван с previewLines length ≥ 1.
   - Page doc: draftLines live на бланке; snapshot persist — later.

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ / НЕ ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

- FROZEN shell 317
- Auto-update всех сохранённых КП при save шаблона
- Snapshot / lock / paid / **322**
- Print 320 / BuilderCanvas / deploy
- Persist Quotation Save (отдельный successor)
- Угадывать колонки по `label` вместо `key` (только key-contract выше)
- Подставлять выдуманного Counterparty

known_limitation:
- Mapping по key aliases — MVP; нет UI «привязать колонку» в Create.
- После Save истиной станет Quotation.items + snapshot — не этот live preview.

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Добавил изделие в рейл → после rebuild на листе в table-блоке видна строка с именем (и qty/price если колонки ключей из контракта есть).
2. Удалили все draftLines (если UI удаления нет — empty array) → снова skeleton 324, не paragraph.
3. Gates:
   ```
   cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
   cd backend && pnpm test -- --testPathPattern=document-templates-build
   cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
   cd frontend && pnpm test -- --testPathPattern=proposal-create
   ```
4. Visual PO: товары на бланке + нет scroll regression (323) + нет «Нет данных» (324).
5. Executor report (auto); archive после Cursor/PO PASS.

Финализация: `tasks/_archive/2026-08/TZ-SALES-325.done.md`.
