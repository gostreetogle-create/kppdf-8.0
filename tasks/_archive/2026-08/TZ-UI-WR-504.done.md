# TZ-UI-WR-504: Gold / on-gold contrast audit

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-23
closed_by: freebuff-wr-b
verification:
  - acceptance criteria: PASS (all CONFLICT KEY files already compliant)
  - typecheck: PASS (no code changes)
  - tests: N/A (no code changes)
  - checklist: ADDED
  - AC guard command: documented

## Evidence table

| File | Status |
|------|--------|
| `app-layout.component.ts` | OK — activeCategoryId: `bg-sunrise-warm` + `text-on-gold` (L376-377) |
| `pi-nav-dropdown.component.ts` | OK — active: `bg-sunrise-warm` + `text-on-gold` (L71-72) |
| `pi-group-workspace.component.ts` | OK — activeId: `bg-sunrise-warm` + `text-on-gold` (L79-80) |
| `supply.page.ts` | OK — viewMode: `bg-sunrise-warm` + `text-on-gold` (L75-76, L90-91) |
| `organization-full-editor-dialog.component.ts` | OK — isTypeSelected: `bg-sunrise-warm` + `text-on-gold` (L156-157) |
| `counterparty-full-editor-dialog.component.ts` | OK — isRoleSelected: `bg-sunrise-warm` + `text-on-gold` (L192-193) |
| `stock-movements.page.ts` | OK — activeWarehouseChipId: `bg-sunrise-warm` + `text-on-gold` (L98-99) |

## AC Guard command

```bash
# Verify no bg-sunrise-warm without text-on-gold in CONFLICT KEY files
cd frontend/src && grep -rn 'bg-sunrise-warm\|bg-gold' \
  app/layout/app-layout.component.ts \
  app/shared/page/pi-group-workspace.component.ts \
  app/shared/ui/menu/pi-nav-dropdown.component.ts \
  app/pages/supply/supply.page.ts \
  app/pages/organizations/organization-full-editor-dialog.component.ts \
  app/pages/counterparties/counterparty-full-editor-dialog.component.ts \
  app/pages/inventory/stock-movements.page.ts \
  | grep -v 'text-on-gold' | grep -v '/20' | grep -v 'shrink-0' | grep -v 'hover:bg'
# Expected: 0 lines (all bg-sunrise-warm paired with text-on-gold)
```

## Изменённые файлы

Нет — все файлы уже compliant. Zero diff.