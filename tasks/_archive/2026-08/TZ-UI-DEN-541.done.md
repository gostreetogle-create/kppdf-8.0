ARCHIVE_MARKER
task_id: TZ-UI-DEN-541
outcome: DONE
closed_at: 2026-08-23T15:46:00+03:00
agent_id: executor-subagent
spec: tasks/_backlog/ui-density/TZ-UI-DEN-541-builder-panes-density.md

verification:
  - typecheck: PASS
  - tests: PASS (builder-tool-pane + builder-inspector specs)

## Density applied

- Tool-pane flyout: removed box-shadow (hairline only, WR-503 preserved)
- Inspector: label/value stack 4px gap, labels 11px, values/inputs 13px

## Files changed

- `frontend/src/app/pages/doc-constructor/builder/builder-tool-pane.component.ts`
- `frontend/src/app/pages/doc-constructor/builder/builder-inspector.component.ts`
