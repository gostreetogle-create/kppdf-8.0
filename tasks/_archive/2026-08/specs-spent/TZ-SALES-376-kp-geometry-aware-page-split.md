# TZ-SALES-376: Страницы КП по рамке таблицы (geometry-aware split)

РОЛЬ АГЕНТА: Full-stack (document build split + Create КП «Вид листа» copy)

ЗАВИСИМОСТИ: SALES-346 DONE (multipage pipeline); SALES-374/375 DONE; AUTH-305 keys OK

LAYER: 3

PAGES: /proposals/create
PAGE_DOCS: proposals-create.page.md

CONFLICT KEYS: backend/src/modules/document-template/document-template.service.ts ; backend/src/modules/document-template/document-template.assets.spec.ts ; backend/src/modules/table-template/table-template.service.ts ; frontend/src/app/pages/commercial/proposals/proposal-create-inspector.component.ts ; docs/pages/proposals-create.page.md ; docs/pages/PAGE-TZ-INDEX.md ; docs/audits/2026-08-15-kp-multipage-table-overflow-audit.md

Проверено:
- Audit: `docs/audits/2026-08-15-kp-multipage-table-overflow-audit.md`
- Split: `document-template.service.ts` `splitPreviewLines` — `0` → hardcode **20/25**, не height блока
- Build loop: same file ~L650–692; iframe ribbon: `proposal-create-template-center.component.ts`
- Builder table height = `BlockLayout` fraction / px editor chrome; `normalizeBlockLayout` clamps `page` to 1
- Create КП UI: inspector «Строк на 1-й / следующих» (`kp-sheet-rows-first/next`), default 0
- `pageBreakBefore` → CSS on `<tr>` only; splitter ignores
- Totals on last page: `resolveTableBlock` sums **page slice** `previewLines` when `dealTotals` set — fix to full КП lines

Loose wording PO «таблица уходит за шаблон / перенос на следующую страницу» → geometry-aware `splitPreviewLines` + clip; **не** новый multi-template-per-page.

## ИСХОДНОЕ СОСТОЯНИЕ

1. Multipage уже работает по **числу строк**, не по высоте рамки таблицы в шаблоне.
2. PO видит в builder высоту ~312px, в Create КП — переполнение листа.
3. «0 = авто» обещано 346, реализовано как 20/25.

## ЧТО ДЕЛАТЬ

### ШАГ 1. Real auto capacity (0 = по рамке)

В `DocumentTemplateService` при `rowsFirstPage === 0` / `rowsNextPage === 0`:

1. Найти block(s) с `kpLineItems` / line-items table target (тот же критерий, что `lineItemsTargetIds` в `build`).
2. Взять `layout.height` (доля страницы, 0…1) и `layout.y` если нужно ограничить «остаток до низа».
3. Оценить вместимость строк:
   - высота слота ≈ `pageContentHeightPx * layout.height` (page size из template format A4/A3… — уже есть в render path);
   - минус оценка thead (`tableHeaderFontSize` + padding);
   - делить на оценку высоты строки: `tableFontSize`, наличие density (`compact|large|auto`), photo column on/off + `photoScalePercent`.
4. Conservative clamp **1…200**. Если блок/height отсутствует — fallback **не хуже текущего** 20/25 (задокументировать в spec).
5. Явные `rowsFirstPage` / `rowsNextPage` > 0 остаются **ручным override** (как сейчас).

Алгоритм может быть приближённым (не pixel-perfect DOM measure) — цель: при типичных строках **появление страницы 2+ раньше**, чем визуальный вылет за рамку.

### ШАГ 2. Honor `pageBreakBefore`

В `splitPreviewLines` (или обёртке): строка с `rowPresentation.pageBreakBefore === true` начинает **новую** страницу (после hard cut), даже если ещё есть место по capacity.

### ШАГ 3. Clip overflow на бланке

В generated CSS для positioned table (или всех `.block--positioned` в build HTML): `overflow: hidden` на контейнере блока таблицы, чтобы остаток строк не рисовался поверх полей страницы — они уходят на следующую страницу через split.

Не ломать editor builder (`overflow: visible` в FE block-renderer можно оставить).

### ШАГ 4. Totals = full КП on last page

При `isLastPage && dealTotals`: считать base/additional totals по **полному** `dto.previewLines`, не по page slice. Page slice только для `rows` таблицы.

### ШАГ 5. UI copy (Create КП)

В «Вид листа»:

- Подписи/hint RU: **«0 — автоматически по рамке таблицы в шаблоне»** (кратко, не простыня).
- Не добавлять новый god-panel; существующие number inputs достаточно.

### ШАГ 6. Tests + docs

1. Spec: при `rowsFirst/Next = 0` и малом `layout.height` у line-items блока — больше страниц, чем при tall height (fixture с N одинаковыми строками).
2. Spec: `pageBreakBefore` на строке k → страница начинается с этой строки.
3. Spec: last-page totals = сумма всех non-optional lines, не только last slice.
4. `proposals-create.page.md` note **376**; PAGE-TZ-INDEX; audit already exists.

## ИЗМЕНЯТЬ

- CONFLICT KEYS + checklist / progress / archive по `GEMINI.md`

## НЕ ИЗМЕНЯТЬ

- Новый DocumentTemplate «на каждую страницу» / builder multi-page canvas / `layout.page > 1` real
- ContinuationMode (это **TZ-SALES-377** park)
- AUTH-305, catalog, table editor chrome (374), products rail (375)
- Deploy

## КРИТЕРИИ ПРИЁМКИ

1. Create КП с `rowsFirstPage=0`, `rowsNextPage=0`, шаблон с низкой рамкой таблицы + много позиций → **≥2** страницы в ленте / `.doc-page` **до** того, как таблица визуально «вылезает» за типичный A4 slot (smoke + unit).
2. Ручные rowsFirst/Next > 0 по-прежнему режут ровно по числам.
3. `pageBreakBefore` создаёт новую build-страницу.
4. Итог на последней странице = полный КП.
5. Gates:
   ```text
   cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
   cd backend && pnpm test -- document-template
   cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
   cd frontend && pnpm test -- proposal-create
   ```
6. READY FOR REVIEW → archive только после Cursor PASS.

## known_limitation

- Auto capacity — оценка, не layout engine; экстремально высокие photo/large rows могут всё ещё clip’иться внутри страницы — successor: tighter measure или SALES-377.
- Per-page templates / «только фон на стр. 2+» — **TZ-SALES-377**, не этот TZ.
