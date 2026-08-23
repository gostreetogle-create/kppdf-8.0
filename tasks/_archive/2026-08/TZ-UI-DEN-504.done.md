ARCHIVE_MARKER
task_id: TZ-UI-DEN-504
outcome: DONE
closed_at: 2026-08-23T15:30:00+03:00
agent_id: executor-subagent
spec: tasks/_backlog/ui-density/TZ-UI-DEN-504-button-single-cta-canon.md

verification:
  - typecheck: PASS
  - lint: PASS

## Что сделано

### button.component.ts
- JSDoc: one-gold-per-screen rule; variant roles (default/secondary/outline/ghost/destructive)
- No API break — docs only

### forms.page.ts (/kit/forms)
- Section «Footer pattern (single CTA)»: left status text + right single gold CTA + outline cancel

### ui-density-canon.md
- Link to `/kit/forms` Footer pattern section + button JSDoc

## Out of scope (honored)

- Feature page buttons (DEN-510+)
- Gold contrast pairs (WR-504)
- workspace/**, proposal-create.page.ts
