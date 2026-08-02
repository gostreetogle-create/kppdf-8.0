# TZ-DOC-336 DONE — Texts/Tables shell + dialog FormField canon

```
ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-02
closed_by: local-executor
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (frontend tsc -p tsconfig.app.json --noEmit)
  - jest: PASS (95 tests / 6 suites — texts.page, text-block-editor, tables.page, table-template-dialog, template-setup-dialog, templates.page)
  - browser smoke: SKIPPED (no live server in executor session; unit gates cover shell/dialog contracts)
protects:
  - Pi page chrome parity for texts/tables with templates
  - FormField/Switch dialog canon without payload shape changes
  - templates duplicate via copyLabel/(copy)
residual:
  - full text-block-editor → modal dialog = successor
  - data-field-picker deep redesign = successor
  - optional pageKey on PiNavDropdownItem added to unblock pre-existing layout tsc
```

## Summary

Texts and Tables pages now use `PiPageHeader` + `PiToolbar` + `PiSection` + `PiEmptyState` + `PiRowActions`. Tables promo aside removed; copy uses row-actions copy slot. Table template dialog uses FormField/Input/Switch; `::ng-deep` size hacks removed. Template setup dialog FormField + chips `aria-pressed`/`pi-focus-ring`. Text editor: Активен → pi-switch; L/C/R Lucide icons + aria-label. Templates duplicate uses `copyLabel`/(copy).

## Critical files

- `frontend/src/app/pages/doc-constructor/texts/texts.page.ts`
- `frontend/src/app/pages/doc-constructor/texts/text-block-editor.component.ts`
- `frontend/src/app/pages/doc-constructor/tables/tables.page.ts`
- `frontend/src/app/pages/doc-constructor/tables/table-template-dialog.component.ts`
- `frontend/src/app/pages/doc-constructor/builder/template-setup-dialog.component.ts`
- `frontend/src/app/pages/doc-constructor/templates/templates.page.ts`
- `docs/pages/texts.page.md`, `tables.page.md`, `PAGE-TZ-INDEX.md`
- `docs/agent-checklists/TZ-DOC-336.md`
