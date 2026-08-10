# TZ-SALES-325: Create КП — draftLines → line-items table на бланке (live bind)

PAGES: /proposals/create  
PAGE_DOCS: proposals-create.page.md  
Аудит: `docs/audits/2026-08-09-kp-create-preview-wave2.md` §C  
Статус готовности: **после PASS 323+324**; до того — не claim  
Зависит от: TZ-SALES-323 (fit), TZ-SALES-324 (skeleton empty)

РОЛЬ АГЕНТА: fullstack  
ЗАВИСИМОСТИ: 323 DONE visual scroll; 324 DONE skeleton; **не** смешивать с 322 snapshot  
LAYER: 3  
CONFLICT KEYS: backend/src/modules/document-template/dto/build-document.dto.ts; backend/src/modules/document-template/document-template.service.ts; backend/src/modules/table-template/table-template.service.ts; frontend/src/app/pages/commercial/proposals/proposal-create.page.ts; frontend/src/app/pages/commercial/proposals/proposal-create.page.spec.ts; frontend/src/app/shared/services/pi-document-templates.service.ts; docs/pages/proposals-create.page.md

Проверено: `build(id, { organizationId? })` без lines (`proposal-create.page.ts` 325–327); `BuildDocumentDto` whitelist ids only (`build-document.dto.ts` 19–36); `resolveTableBlock` → `preview(sampleRows)` only (604); `BlockSource` = kind/refId/mode only (`template-block-layout.ts` 13–15) — **нет** line-items role; `TableTemplate.dataSource` = registry source (не = commercial role); `ProposalDraftLine` = `{ productId, productName, quantity, unitPrice }`; клиент = Counterparty (не Organization).

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ
═══════════════════════════════════════════════════════════════

1. PO ждёт: добавил изделие в рейл «Товары» → строки видны в таблице шаблона на листе.
2. Сейчас это **by-design gap** (319 stub policy), не баг клика.
3. Без явного column-contract и без выбора target-table нельзя угадывать mapping / заливать все live tables.

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
| optional `productSku` | `sku`, `article`, `артикул` (если поле есть в draft; иначе пусто) |
| optional `unit` | `unit`, `ед`, `ед.изм` (если есть; иначе пусто) |

- Колонки с неизвестным key → пустая ячейка.
- **Не** мапить по `column.label` / fuzzy RU labels.

═══════════════════════════════════════════════════════════════
КАКУЮ TABLE БИНДИТЬ (обязателен — не «все live»)
═══════════════════════════════════════════════════════════════

`BlockSource` сейчас = `{ kind, refId, mode }` — роли line-items нет.  
`TableTemplate.dataSource` = registry (`products`, `cost-calc`…) — **не** переиспользовать молча как commercial role.

**Правило target (в порядке приоритета):**

1. Явный флаг на блоке: `settings.kpLineItems === true` (или `settings.role === 'line-items'` — один канон в коде, задокументировать в page doc).
2. Иначе, если в шаблоне ровно **один** live `table-template` block (`mode !== 'snapshot'`) → биндить его (безопасный MVP для типового КП).
3. Иначе (несколько live tables **без** флага) → **ни одну** не заполнять draft rows; оставить skeleton 324. Не угадывать.

Snapshot-mode table (`source.mode === 'snapshot'`) — **никогда** не трогать.  
Несвязанные / невыбранные table blocks — не получают строки.

Не требуется UI mapper в этой TZ: флаг можно выставить в builder settings JSON / existing settings editor, если уже есть свободное поле; иначе MVP #2 покрывает шаблон с одной таблицей.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

1. **DTO**
   - Расширить `BuildDocumentDto` опциональным массивом строк превью, напр.  
     `previewLines?: { productName: string; quantity: number; unitPrice: number; productSku?: string; unit?: string }[]`.
   - class-validator: optional array, nested numbers ≥ 0; whitelist совместим с `forbidNonWhitelisted`.
   - Клиентский preview payload **не** писать в Mongo/Quotation.

2. **BE render path**
   - В `resolveTableBlock` / `preview`: если переданы `previewLines` — рендерить `<table>` thead из columns + tbody из mapped rows (formatCell types currency/number/text) **только** для target-table по правилу выше.
   - Не требовать `quotationId` для Create preview.
   - Пустой `previewLines` / пустой `draftLines` → поведение **324** (skeleton 1 empty row), не «Нет данных».

3. **FE Create**
   - `build(id, { organizationId?, previewLines: draftLines mapped })` при каждом rebuild.
   - Rebuild также на `onProductAdd` (debounce уже есть — триггерить `rebuildPreview$.next()`).
   - Не рисовать bullet list поверх листа (запрет 319 сохраняется).

4. **UX copy (rail)**
   - Если нужно — одна короткая RU-подпись в панели Товары: «Позиции отображаются в таблице шаблона» (не тост-спам).

5. **Tests + docs**
   - BE: preview/build с previewLines → td содержат имя/qty/price в **target** table; вторая live table без флага остаётся skeleton.
   - FE: add product → build вызван с previewLines length ≥ 1.
   - Page doc: draftLines live на бланке; Save/snapshot — later; правило target-table.

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ / НЕ ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

- FROZEN shell 317
- Заполнять **все** live tables одинаковыми rows без флага/правила выше
- Auto-update всех сохранённых КП при save шаблона
- Snapshot / lock / paid / **322**
- Print 320 / BuilderCanvas / deploy
- Persist Quotation Save (отдельный successor)
- Угадывать колонки по `label` вместо `key`
- Подставлять выдуманного Counterparty или Organization вместо commercial lines
- Считать `draftLines.unitPrice` authoritative server price
- DOC-344 builder keys / rewrite BlockSource schema mega-migration (достаточно settings flag)

known_limitation:
- Mapping по key aliases — MVP; нет UI «привязать колонку» в Create.
- После Save истиной станет Quotation.items + snapshot — не этот live preview.
- Шаблоны с несколькими live tables без `kpLineItems` не получат auto-bind (нужен флаг).

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Добавил изделие в рейл → после rebuild на листе в **target** table видны product name и quantity; price/total — при наличии canonical keys.
2. Удалили все draftLines (или empty array) → снова skeleton 324, не paragraph.
3. Snapshot-mode table не изменяется; несвязанные table blocks не получают строки.
4. Клиентский preview payload не записывается в Mongo/Quotation.
5. Scroll regression из 323 и «Нет данных» из 324 не возвращаются.
6. Gates:
   ```
   cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
   cd backend && pnpm test -- --testPathPattern=document-templates-build
   cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
   cd frontend && pnpm test -- --testPathPattern=proposal-create
   ```
7. Visual PO: товары в правильной таблице + нет scroll + нет «Нет данных».
8. Executor report (auto); archive после Cursor/PO PASS.

Финализация: `tasks/_archive/2026-08/TZ-SALES-325.done.md`.
