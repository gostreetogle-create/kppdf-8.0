# TZ-SALES-373 DONE — KP table font size on A4 sheet

```
ARCHIVE_MARKER
task: TZ-SALES-373
outcome: DONE
closed_at: 2026-08-15
closed_by: Buffy (closeout)
workspace: D:\kppdf-8.0
implementation_sha: 60fad54a7c0dbf1bcb574c977f1e63061ed6adf3
closeout_sha: PENDING
verification:
  - acceptance criteria: PASS (см. checklist docs/agent-checklists/TZ-SALES-373.md)
  - frontend tsc: PASS
  - proposal-create Jest: PASS (4 suites / 56 tests)
  - backend tsc: PASS
  - table-template.service Jest: PASS (6 tests, incl. tableFontSize)
  - Cursor verdict: PASS (cross-check 60fad54a — tableFontSize FE/BE + preview HTML; browser Вид листа + toolbar)
  - checklist: DONE
  - progress.md: UPDATED
  - active marker: removed after archive
  - deploy: NOT EXECUTED
protected:
  - frontend/src/app/pages/commercial/proposals/proposal-create-inspector.component.ts
  - frontend/src/app/pages/commercial/proposals/proposal-create-table-editor.component.ts
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

- `sheetLayout.tableFontSize` (default 12, clamp 8–20) on Quotation schema/DTO/mapSheetLayout + BuildSheetLayoutDto + FE types.
- UI: «Шрифт таблицы» in Вид листа (`kp-sheet-table-font`) + «Шрифт» in table editor toolbar (`kp-table-editor-font`); one sheetLayout store.
- Live editor `[style.font-size.px]`; preview HTML `font-size:Npx` on `<table>`.
- Old KP without field → 12; page docs + PAGE-TZ-INDEX updated.

## НЕ

- Deploy / wipe
- Per-column / per-cell font
