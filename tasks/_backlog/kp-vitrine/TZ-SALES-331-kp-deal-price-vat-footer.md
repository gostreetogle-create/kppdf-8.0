═══════════════════════════════════════════════════════════════
TZ-SALES-331: Create КП — наценка→цена на листе + НДС/Итого в подвале
═══════════════════════════════════════════════════════════════

PAGES: /proposals/create
PAGE_DOCS: proposals-create.page.md
Аудит: docs/audits/2026-08-09-kp-table-config-canon.md §2 §4 footer
Статус: READY после TZ-SALES-330 (layout instance) — можно начинать сразу после 330 READY FOR REVIEW если keys согласованы
Зависит от: TZ-SALES-325 DONE; TZ-SALES-330 (желательно — один target table + layout)

РОЛЬ АГЕНТА: fullstack
ЗАВИСИМОСТИ: 325 DONE; 330 желательно DONE
LAYER: 3
CONFLICT KEYS: backend/src/modules/document-template/dto/build-document.dto.ts; backend/src/modules/document-template/document-template.service.ts; backend/src/modules/table-template/table-template.service.ts; frontend/src/app/pages/commercial/proposals/proposal-create.page.ts; frontend/src/app/pages/commercial/proposals/proposal-create.page.spec.ts; frontend/src/app/pages/commercial/proposals/proposal-create-inspector.component.ts; frontend/src/app/shared/services/pi-document-templates.service.ts; docs/pages/proposals-create.page.md

Проверено: inspector уже имеет `orgMarkupPercent` + UI estimate (`proposal-create-inspector.component.ts`); `previewLines.unitPrice` сейчас = `listPrice` без наценки; скидка-колонка на бланке **запрещена** каноном; НДС только на всё КП.

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ
═══════════════════════════════════════════════════════════════

1. PO: скидка/наценка **фоном** через панель (Organization), на бланке отдельной колонкой не светится; меняется цена позиции в КП.
2. Каталог не портить.
3. НДС и «Итого» — внизу справа таблицы позиций; тексты MVP фиксированные RU (позже — блоки PO).

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

1. **Эффективная цена строки (FE)**
   - При сборке `previewLines`:  
     `unitPrice = roundMoney(baseListPrice * (1 + orgMarkupPercent/100))`  
     (наценка со знаком: отрицательная = скидка; clamp/validate разумный диапазон, напр. −100…+1000, без NaN).
   - В `draftLines` хранить `baseUnitPrice` (из каталога) + показывать/слать в preview уже effective — **или** считать effective только в mapper build payload, не мутируя каталог.
   - Канон: Product/`listPrice` в API update **не** вызывать.

2. **НДС сделки**
   - Поле в inspector «Параметры»: `НДС %` (`dealVatPercent`, default из Organization если поле есть, иначе 20 или 0 — выбрать одно и зафиксировать в page doc; PO тексты later).
   - Только на всё КП; не per-line.

3. **DTO + footer render (только line-items target)**
   - `dealTotals?: { vatPercent?: number }` (итого считается на BE из previewLines).
   - Под `<table>` line-items (или tfoot): блок выровненный вправо:
     - `Итого: {sum} ₽`
     - `в т.ч. НДС {vatPercent}%: {vatAmount} ₽`  
       где `vatAmount = sum * vat/(100+vat)` при цене **с НДС** **или** `sum * vat/100` при цене без НДС — **зафиксировать в коде + page doc один режим**: MVP = цены строк считаем **с НДС**, НДС выделяется из итого (`sum * vat/(100+vat)`), подпись «в т.ч. НДС».
   - Если `vatPercent` = 0 / отсутствует — строку НДС не показывать; «Итого» остаётся.
   - Admin preview таблицы без dealTotals — **без** footer (не ломать `/doc-constructor/tables`).

4. **UX copy**
   - Под наценкой: «Меняет цены только в этом КП; каталог не трогаем».
   - Не добавлять колонку «Скидка».

5. **Tests + docs**
   - FE: markup 10% → previewLines.unitPrice = base*1.1.
   - BE: dealTotals → footer содержит «Итого» и «НДС»; без dealTotals footer нет.
   - Page doc + ссылка на канон-аудит.

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ / НЕ ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

- Колонка скидки на бланке
- Per-line VAT / per-line discount
- Persist Quotation totals / snapshot (later)
- Print 320 / paid lock 322
- PATCH Product prices
- FROZEN shell 317 layout
- deploy

known_limitation:
- Формулировки подвала = MVP RU; текстовые блоки PO — successor.
- Режим «цена без НДС + сверху» — не в этой TZ (только «в т.ч.»).
- Save authoritative totals — successor persist.

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Наценка в панели меняет «Цена»/«Сумма» на листе; Product в БД без изменений.
2. НДС % на всё КП → подвал с «Итого» и «в т.ч. НДС»; при 0% только «Итого».
3. Нет колонки скидки; admin table preview без footer сделки.
4. Gates:
   ```
   cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
   cd backend && pnpm test -- --testPathPattern=document-templates-build
   cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
   cd frontend && pnpm test -- --testPathPattern=proposal-create
   ```
5. Visual PO: цены на листе = ожидаемые после наценки; подвал читаемый справа снизу.
6. Executor report (auto); archive после Cursor/PO PASS.

Финализация: `tasks/_archive/2026-08/TZ-SALES-331.done.md`.
