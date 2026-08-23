# TZ-KP-WS-410 — DONE

ARCHIVE_MARKER
task_id: TZ-KP-WS-410
outcome: DONE
closed_at: 2026-08-23T17:47:00+03:00
agent_id: freebuff-1
spec: tasks/TZ-KP-WS-410-hotfix-empty-viewport.md

## Verification

- tsc: PASS (exit 0)
- jest: PASS (64/64 — proposal-workspace 61 + deals-group-chips 3)
- lint: PASS (0 errors, 17 pre-existing warnings)

## Changes

### proposal-workspace-draft.service.ts
- `removeStorage('kp.create.lastTemplateId')` → `resumeLastTemplate()` (resumeLastDraft without draft reopens last selected template, not the empty default)

### proposal-workspace.page.spec.ts (+23 lines)
- "shows empty A4 placeholder and opens template panel when no template is selected"
- "clicking empty A4 sheet keeps template panel open" (empty-state guard)
- "clicking the A4 sheet closes the panel when template preview is loaded" (existing behavior preserved)

### deals-group-chips.ts + spec
- New chip: `{ id: 'workspace', label: 'Коммерческое предложение', route: '/proposals/workspace' }`
- Spec assertion updated to expect 3 KP chips: workspace → create → list

## Conflict keys
- `proposal-workspace-draft.service.ts`
- `proposal-workspace.page.spec.ts`
- `deals-group-chips.ts` + `.spec.ts`
