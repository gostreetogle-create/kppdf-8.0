# TZ-NAV-305.done — Проект: Комбайн first, then Очередь

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-16T14:15:00+03:00
closed_by: cursor-composer-executor
TZ: TZ-NAV-305
DEP: TZ-NAV-303
Cursor_verdict: PASS (executor land; PO-authorized execute)

verification:
  - acceptance criteria: PASS
  - typecheck: PASS (`pnpm exec tsc -p tsconfig.app.json --noEmit`)
  - tests: PASS (app-layout 2 suites / 18 tests)
  - lint: N/A (focused tsc + jest)
  - checklist: UPDATED DONE
  - progress.md: UPDATED
  - status synchronization: PASS
  - deploy: NOT RUN (PO: Do NOT deploy)

COMMIT: d3de1b229e30430282120230e0ad4fd1e8b0e227
CLOSEOUT_COMMIT: d3de1b229e30430282120230e0ad4fd1e8b0e227

## Spec (body)

# TZ-NAV-305: Проект — сначала Комбайн, потом Очередь

## Delivered

- `design.items`: Комбайн (`/design/combine`) → Очередь (`/design`)
- `entryPath`: `/design/combine`
- nav-order spec TZ-NAV-305 order/entry assertion
- Docs one-liners: `design.page.md`, `page-chrome.md`

## Out of scope

- Kanban / SWEEP-401 write-path
- Queue stub content
- PHOTO / DASHBOARD-401
- deploy.ps1
