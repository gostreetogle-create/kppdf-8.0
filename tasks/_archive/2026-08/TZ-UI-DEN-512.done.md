ARCHIVE_MARKER
task_id: TZ-UI-DEN-512
outcome: DONE
closed_at: 2026-08-23T15:25:00+03:00
agent_id: executor-subagent
spec: tasks/_backlog/ui-density/TZ-UI-DEN-512-desk-density.md

verification:
  - typecheck: PASS
  - lint: PASS (scoped)
  - tests: PASS (manager-desk.page.spec.ts, order-hub-tray.component.spec.ts)

## Density applied (/desk only)

- Tray cards (desk mode): `bg-paper-raised`, `p-4`, hairline `divide-y` stack (no 20px gaps)
- Queue rows: hairline separators, 13px meta (client/status), paper-raised row surface
- Single gold CTA: tray summary bar only; flyout submit/refresh demoted to outline
- RU status labels unchanged (already via `statusLabel()`)

## Files changed

- `frontend/src/app/pages/desk/manager-desk.page.ts`
- `frontend/src/app/shared/orders/order-hub-tray.component.ts`
- `frontend/src/app/pages/desk/manager-desk.page.spec.ts`
- `frontend/src/app/shared/orders/order-hub-tray.component.spec.ts`

## Out of scope (honored)

- Tray business logic / DESK-425 workspace IA
- Supply flyout container grid (431)
- Hub mode `/orders` tray styling (desk-scoped via `mode() === 'desk'`)
