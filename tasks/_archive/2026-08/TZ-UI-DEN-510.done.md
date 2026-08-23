ARCHIVE_MARKER
task_id: TZ-UI-DEN-510
outcome: DONE
closed_at: 2026-08-23T15:25:00+03:00
agent_id: executor-subagent
spec: tasks/_backlog/ui-density/TZ-UI-DEN-510-app-shell-paper-hairline.md

verification:
  - typecheck: PASS
  - lint: PASS (scoped)
  - tests: PASS (app-layout.component.spec.ts, pi-dictionary-shell.component.spec.ts)

## Class snapshot (app-layout shell)

Outer: `h-screen bg-paper text-ink font-body flex flex-col overflow-hidden`
Header: `sticky top-0 z-30 bg-paper hairline-b pi-edge-bleed shrink-0` + inner `h-header-h`
Main: `flex-1 … overflow-y-auto bg-paper`
Nav active: gold chip `bg-sunrise-warm` + `text-on-gold` (no underline)
Rails: `border-right/left: 1px solid var(--color-rule)`, `box-shadow: none`

## Files changed

- `frontend/src/styles.css` — `--header-h: 46px`, `--spacing-header-h`
- `frontend/src/app/layout/app-layout.component.ts`
- `frontend/src/app/layout/app-layout.component.spec.ts`
- `frontend/src/app/shared/page/pi-dictionary-shell.component.ts` — sticky `top-header-h` sync
- `frontend/src/app/shared/page/pi-dictionary-shell.component.spec.ts`

## Out of scope (honored)

- commercial/proposals/workspace/**
- desk/**
