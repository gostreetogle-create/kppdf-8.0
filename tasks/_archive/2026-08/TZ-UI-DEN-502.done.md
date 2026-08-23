ARCHIVE_MARKER
task_id: TZ-UI-DEN-502
outcome: DONE
closed_at: 2026-08-23T15:15:00+03:00
agent_id: executor-subagent
spec: tasks/_backlog/ui-density/TZ-UI-DEN-502-form-field-hint-tones.md

verification:
  - typecheck: PASS
  - test: PASS (`pnpm test -- --testPathPattern=form-field` — 6 tests)
  - lint: PASS

## Что сделано

### form-field.component.ts
- Input `hintTone: 'default' | 'ai' | 'success' | 'warn'` (default `'default'`)
- Semantic classes: `text-hint-ai`, `text-hint-warn`, `text-hint-success`; default stays `text-muted-foreground`
- Error line: `text-xs text-destructive`, `role="alert"`, no shadow

### form-field.component.spec.ts
- 6 tests: default muted, ai/warn/success tokens, error shadows hint

### forms.page.ts
- Kit demo section «Hint tones» with 4 tone variants

## Migration note

- Page-level `hintTone` adoption deferred to DEN-530+ — primitive only in this TZ.

## Files changed

- `frontend/src/app/shared/ui/form-field/form-field.component.ts`
- `frontend/src/app/shared/ui/form-field/form-field.component.spec.ts`
- `frontend/src/app/pages/forms/forms.page.ts`

## Out of scope (honored)

- Feature pages (adoption)
- `frontend/src/app/pages/commercial/proposals/workspace/**`
- `proposal-create.page.ts`
