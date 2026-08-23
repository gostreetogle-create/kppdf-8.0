ARCHIVE_MARKER
task_id: TZ-UI-DEN-540
outcome: DONE
closed_at: 2026-08-23T15:45:00+03:00
agent_id: executor-subagent
spec: tasks/_backlog/ui-density/TZ-UI-DEN-540-doc-constructor-lists.md

verification:
  - typecheck: PASS
  - tests: PASS (templates/texts/tables/documents page specs)

## Density applied

- Table columns: `text-xs` (12px cells)
- Counters: `text-[11px]` + «Показано N» prefix
- Toolbar: single gold create CTA per page (unchanged)

## Files changed

- `frontend/src/app/pages/doc-constructor/templates/templates.page.ts`
- `frontend/src/app/pages/doc-constructor/texts/texts.page.ts`
- `frontend/src/app/pages/doc-constructor/tables/tables.page.ts`
- `frontend/src/app/pages/doc-constructor/documents/documents.page.ts`
