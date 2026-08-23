ARCHIVE_MARKER
task_id: TZ-UI-DEN-520
outcome: DONE
closed_at: 2026-08-23T16:10:00+03:00
agent_id: executor-subagent
spec: tasks/_backlog/ui-density/TZ-UI-DEN-520-catalog-lists-density.md

verification:
  - typecheck: PASS
  - catalog page specs: materials/products/modules PASS
  - lint: PASS (0 err)
  - rg bg-white|shadow-md|rounded-lg on catalog list pages: 0

## Changes

- `pi-table.component.ts`: `[compact]` input — 12px cells, tighter padding
- `pi-showcase-card.component.ts`: grid cards use `--color-paper-raised` (white on paper)
- `materials.page.ts`, `products.page.ts`, `modules.page.ts`: `[compact]="true"`, `bg-paper-raised` table surface, grid gap-2.5, filter rail selects `text-xs`
- `pi-filter-panel.component.ts`: p-4 outer, `bg-paper-raised`, `hairline-b`, pi-label header
- `pi-pagination.component.ts`: compact 32px (`h-8`) pager controls
- `materials.page-373.spec.ts`: flyout DOM assertion aligned with pi-filter-panel siblings

## Out of scope (honored)

- Photo/dropzone, expandable rows, backend filters
- workspace/**, proposal-create.page.ts, desk/**
