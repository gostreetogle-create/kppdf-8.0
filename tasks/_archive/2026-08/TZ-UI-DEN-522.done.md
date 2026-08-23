ARCHIVE_MARKER
task_id: TZ-UI-DEN-522
outcome: DONE
closed_at: 2026-08-23T16:14:00+03:00
agent_id: executor-subagent
spec: tasks/_backlog/ui-density/TZ-UI-DEN-522-dictionaries-density.md

verification:
  - typecheck: PASS
  - dictionaries specs: 7/7 PASS (color-references, doc-template-categories, text-block-categories, measurements, kind-labels, form-profiles, categories)
  - lint: PASS (0 err)

## Changes

- `pi-table-tree.component.ts`: `[compact]` input for tree lists
- Dictionary sub-routes: `[compact]="true"` on pi-table, text-xs body, bg-paper-raised surfaces
- `kind-labels.page.ts`, `form-profiles.page.ts`: H1 text-lg, 12px body, paper-raised panels

## Out of scope (honored)

- Dictionary form dialogs (DEN-530+)
