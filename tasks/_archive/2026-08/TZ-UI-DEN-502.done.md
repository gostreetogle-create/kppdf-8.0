ARCHIVE_MARKER
task_id: TZ-UI-DEN-502
outcome: DONE
closed_at: 2026-08-23T15:15:00+03:00
agent_id: executor-subagent
spec: tasks/_backlog/ui-density/TZ-UI-DEN-502-form-field-hint-tones.md

verification:
  - typecheck: PASS
  - form-field tests: 6/6 PASS

## Changes

- `form-field.component.ts`: `hintTone: default|ai|success|warn` + computed hintClass
- `form-field.component.spec.ts`: NEW — tone + error shadow tests

## Migration

- Feature pages adopt `hintTone` in DEN-530+; primitive only in this TZ.
- kit/forms demo row deferred to DEN-504 overlap.
