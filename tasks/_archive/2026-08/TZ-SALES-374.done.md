# TZ-SALES-374 DONE — KP table editor chrome, dual fonts, drawer-actions, row frame

```
ARCHIVE_MARKER
task: TZ-SALES-374
outcome: DONE
closed_at: 2026-08-15T07:00:00Z
closed_by: Buffy (closeout)
workspace: D:\kppdf-8.0
implementation_sha: 9b50bc9ec044216817fd0928c8fd3d29cb3f52e6
closeout_sha: 2678cefc8e2a923380186f97a1aa94e05b13ae3b
verification:
  - acceptance criteria: PASS (см. checklist docs/agent-checklists/TZ-SALES-374.md)
  - frontend tsc: PASS
  - proposal-create Jest: PASS (7 suites / 61 tests)
  - backend tsc: PASS
  - table-template.service Jest: PASS (7 tests, incl. header font)
  - Cursor verdict: PASS (cross-check 9b50bc9e — Lucide chrome; dual fonts; gutter chevron; drawer «Действия»; expand frame)
  - checklist: DONE
  - progress.md: UPDATED
  - active marker: removed after archive
  - deploy: NOT EXECUTED
protected:
  - frontend/src/app/pages/commercial/proposals/proposal-create-table-editor.component.ts
  - frontend/src/app/pages/commercial/proposals/proposal-create-inspector.component.ts
  - frontend/src/app/pages/commercial/proposals/proposal-create.page.ts
  - frontend/src/app/shared/services/pi-proposals.service.ts
  - frontend/src/app/shared/services/pi-document-templates.service.ts
  - backend/src/modules/quotation/quotation.schema.ts
  - backend/src/modules/quotation/dto/create-quotation.dto.ts
  - backend/src/modules/quotation/quotation.service.ts
  - backend/src/modules/document-template/dto/build-document.dto.ts
  - backend/src/modules/table-template/table-template.service.ts
  - docs/pages/proposals-create.page.md
  - docs/pages/PAGE-TZ-INDEX.md
```

## Delivered

- Toolbar: Lucide Square/Bold icon-buttons for border cycle + header bold; aria/title state labels.
- `sheetLayout.tableHeaderFontSize` + `tableFontSize` (default 12, clamp 8–20); toolbar + Вид листа dual controls; preview th/td separate sizes.
- Row gutter: chevron-only; pencil/⋯/trash → drawer «Действия» with clear RU labels incl. «Создать копию в каталоге».
- Expand frame around data-row+drawer + sibling dim (UX-319 pattern, local editor table).
- Optional: «пресет» → «шаблон» in Ещё menu copy.

## НЕ

- Deploy / wipe
- Per-column font
- `/doc-constructor/tables`

---

# TZ-SALES-374: Редактор таблицы КП — иконки chrome, два шрифта, drawer-actions, рамка строки

РОЛЬ АГЕНТА: Frontend (+ thin sheetLayout BE)

ЗАВИСИМОСТИ: SALES-370/373 DONE; UX-319 DONE (эталон рамки expand)

LAYER: 3

PAGES: /proposals/create
PAGE_DOCS: proposals-create.page.md

CONFLICT KEYS: frontend/src/app/pages/commercial/proposals/proposal-create-table-editor.component.ts ; frontend/src/app/pages/commercial/proposals/proposal-create-inspector.component.ts ; frontend/src/app/pages/commercial/proposals/proposal-create.page.ts ; frontend/src/app/shared/services/pi-proposals.service.ts ; frontend/src/app/shared/services/pi-document-templates.service.ts ; backend/src/modules/quotation/quotation.schema.ts ; backend/src/modules/quotation/dto/create-quotation.dto.ts ; backend/src/modules/quotation/quotation.service.ts ; backend/src/modules/document-template/dto/build-document.dto.ts ; backend/src/modules/table-template/table-template.service.ts ; docs/pages/proposals-create.page.md ; docs/pages/PAGE-TZ-INDEX.md

Проверено: скрины PO; `proposal-create-table-editor` L119–158 (Рамка/Шапка/Шрифт текстом), L616–707 (4 кнопки в жёлобе), L711+ drawer; `sheetLayout.tableFontSize` (373); UX-319 frame pattern на `pi-table`.
Чеклист PO: `docs/agent-checklists/PO-KP-TABLE-EDITOR-CHROME-2026-08-15.md`.

## ИСХОДНОЕ СОСТОЯНИЕ

1. Тулбар: текстовые «Рамка: … / Шапка: …» — PO хочет иконки.
2. Один `tableFontSize` — нельзя отдельно шапку и тело.
3. В каждой строке 4 иконки справа — тесно; действия строки должны жить в drawer.
4. Раскрытый drawer без общей рамки с data-row (в отличие от products UX-319).

## КРИТЕРИИ ПРИЁМКИ

1. Тулбар: Рамка/Шапка — иконки с понятным aria/title состояния.
2. Можно задать разный размер шрифта шапки и тела; оба на бланке preview.
3. В строке справа только стрелка; остальные действия в открытой панели.
4. «Создать копию в каталоге» подписано ясно.
5. Раскрытая строка+панель в рамке; соседи приглушены.
6. Gates: FE/BE tsc + proposal-create + table-template.service — PASS.
