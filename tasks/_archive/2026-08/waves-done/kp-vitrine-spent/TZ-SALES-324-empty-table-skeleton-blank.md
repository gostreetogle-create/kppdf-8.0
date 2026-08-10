# TZ-SALES-324: Empty table = skeleton blank (не «Нет данных»)

PAGES: /proposals/create ; /doc-constructor/tables  
PAGE_DOCS: proposals-create.page.md ; tables.page.md  
Аудит: `docs/audits/2026-08-09-kp-create-preview-wave2.md` §B  
Зависит от: желательно после/параллельно **TZ-SALES-323** (разные hot-файлы OK; CONFLICT не пересекаются с center scale)

РОЛЬ АГЕНТА: backend (+ optional thin FE builder empty cells)  
ЗАВИСИМОСТИ: TZ-SALES-321 DONE; не ждать 325  
LAYER: 2  
CONFLICT KEYS: backend/src/modules/table-template/table-template.service.ts; backend/src/modules/table-template/table-template.service.spec.ts; backend/src/modules/document-template/document-template.service.ts; backend/test/e2e/document-templates-build.e2e-spec.ts; docs/pages/proposals-create.page.md

Проверено: `TableTemplateService.preview` empty → `<p>Нет данных</p>` (`table-template.service.ts` 107–111); Create `resolveTableBlock` → preview only (`document-template.service.ts` 592–605); `renderHtml` table fallback `<p>Нет данных</p>` (1133–1134); builder уже рисует `<table>` с colspan «Нет данных» (`block-renderer.component.ts` 235–243). Counterparty≠Organization — N/A.

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ
═══════════════════════════════════════════════════════════════

1. На Create КП пустая table-template выглядит как страшный plain «Нет данных», не как бланк Excel.
2. Корень: `preview()` при `sampleRows=[]` возвращает `<p>`, а не `<table>`.
3. PO ожидание: thead (заголовки колонок) + ≥1 пустая строка с пустыми `<td>` (рамки видны).

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

1. **`TableTemplateService.preview` empty rows**
   - Если `columns.length === 0` — оставить короткое RU empty («Нет описанных колонок») — OK.
   - Если columns есть и `sampleRows` пуст → вернуть **полный** HTML:
     ```
     <table class="pi-table pi-table-preview" …>
       <thead><tr><th>…labels…</th></tr></thead>
       <tbody><tr><td></td>…</tr></tbody>
     </table>
     ```
   - **Не** `<p>Нет данных</p>`; **не** одна ячейка colspan с текстом «Нет данных».
   - Пустые `<td>` = `''` (как formatCell для empty).
   - Обновить JSDoc (строки ~99–100).

2. **`renderHtml` table fallback**
   - Если `literalContent` пуст — не подставлять голый `<p>Нет данных</p>` как единственный UX Create; предпочтительно оставить пустой positioned div **или** минимальный skeleton только если у блока есть `columns` (если нет — пустой container). Цель: Create path через preview уже даёт table; fallback не должен снова пугать paragraph.

3. **Tests**
   - Unit на `preview(id)` с columns + empty sampleRows → HTML содержит `<table`, `<thead`, `<th`, `<tbody`, `<td` и **не** содержит `Нет данных` как единственный контент.
   - Build e2e/unit: document template with table-template source + empty sampleRows → build HTML содержит table skeleton.

4. **Docs**
   - Одна строка в `proposals-create.page.md`: empty table = blank skeleton.
   - Checklist TZ-SALES-324.

═══════════════════════════════════════════════════════════════
ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- `table-template.service.ts` (+ создать/обновить `*.spec.ts` если нет — положить рядом)
- при необходимости тонкий fallback в `document-template.service.ts` renderHtml case `table`
- docs + checklist

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ / НЕ ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

- draftLines / BuildDocumentDto / live product bind → **325**
- Scale / iframe → **323** (не смешивать)
- Скрывать table-блок при empty
- Builder drag/editor rewrite (optional later: empty cells без «Нет данных» в block-renderer — **не обязательно** в этой TZ; known_limitation OK)
- sampleRows admin UX / DOC-TABLES-305
- Snapshot 322 / print 320 / deploy

known_limitation:
- Builder canvas may still show «Нет данных» inside table until optional follow-up.
- Real quotation lines on sheet → 325.

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. `preview()` с columns и `sampleRows=[]` → HTML table с thead labels + ровно 1 пустая data-row из N пустых td (N = columns.length).
2. Create КП build того же шаблона: на листе видна рамка таблицы с заголовками, **без** plain «Нет данных» как замены таблицы.
3. Gates:
   ```
   cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
   cd backend && pnpm test -- --testPathPattern=table-template
   cd backend && pnpm test -- --testPathPattern=document-templates-build
   ```
4. Executor report (auto); archive после PASS.

Финализация: `tasks/_archive/2026-08/TZ-SALES-324.done.md`.
