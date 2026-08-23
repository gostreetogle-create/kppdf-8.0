ARCHIVE_MARKER
task_id: TZ-UI-DEN-570
outcome: DONE
closed_at: 2026-08-23T15:50:00+03:00
agent_id: executor-subagent
spec: tasks/_backlog/ui-density/TZ-UI-DEN-570-auth-pages-density.md

verification:
  - typecheck: PASS
  - tests: PASS (login.page + enroll.page specs)

## Density applied

- Full-page warm `bg-paper`; centered card `bg-white` + hairline (no shadow)
- H1 compact `text-lg`; compact padding
- Single gold submit (existing); RU error banners (existing)

## Files changed

- `frontend/src/app/pages/login/login.page.ts`
- `frontend/src/app/pages/enroll/enroll.page.ts`
