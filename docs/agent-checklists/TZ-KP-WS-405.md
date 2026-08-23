# Checklist — TZ-KP-WS-405 (embedded doc settings)

**CLAIM**

| Slot | Значение |
|------|----------|
| agent_id | freebuff-1 |
| claimed_at | 2026-08-23T14:53:20+0300 |
| TZ | TZ-KP-WS-405 |
| conflict keys | doc-constructor/tables/* · doc-constructor/texts/* · proposal-workspace* · pi-table-templates.service.ts · pi-text-blocks.service.ts (свободны на 14:53) |

- [ ] Table preset inline: PiDialog + TableTemplateFormDialog, no route change; save → layout sync
- [ ] Text block inline: PiDialog + TextBlockEditorComponent; save → library refresh
- [ ] Template mini: rename / duplicate / upload background
- [ ] Full builder returnUrl intact (already in picker)
- [ ] All overlays PiDialog/Sheet (no hand-rolled modal)
- [ ] Tests: table preset ≥3, text block ≥2
- [ ] Gates: tsc · jest · lint · build
- [ ] Docs + archive + commit + push
