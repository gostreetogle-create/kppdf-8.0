# TZ-ADMIN-303 — Админ правит системные роли (permissions/pages), DELETE запрещён

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-09T18:18:00Z
closed_by: agent-3e757640b7
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (fe+be tsc)
  - tests: PASS (system-role.guard 7/7; roles-admin.page 13/13; roles-admin.controller suite included)
  - prettier/eslint/diff-check: PASS (zone)
  - self-verify: PASS (admin → Роли → Редактировать director → Сохранить; Delete absent; API DELETE 403 SYSTEM_ROLE_FROZEN)
cursor_verdict: PASS (PO continuous executor self)
agent_id: agent-3e757640b7
workspace: D:\kppdf-8.0

## Delivered

- `SystemRoleGuard`: site-admin PATCH of `isSystem` roles allowed; DELETE always `SYSTEM_ROLE_FROZEN`; escalation still refused
- FE: system rows show «Редактировать» at `role:write`; Delete hidden; RU toast for frozen delete
- Badge copy: «Системная» (без ложного «только чтение»)
- `HttpExceptionFilter` preserves `code` for FE toast routing
- Page doc policy section updated

## Conflict disclosure

Also touched (required for AC, not in original CONFLICT KEYS list):
- `backend/src/common/filters/http-exception.filter.ts` — preserve `code`
- `frontend/src/app/pages/admin/permission-labels.ru.ts` — badge without «только чтение»

## НЕ

- WAVE-KP-USABLE / proposals / quotation / freebuff KP worktree
- Deploy
- Users-admin

## Gates

- backend tsc PASS; system-role Jest 7/7; roles-admin controller suite PASS
- frontend tsc PASS; roles-admin.page Jest 13/13
- Prettier zone PASS; ESLint (pre-existing HttpClient warn only); git diff --check PASS
- Self-verify on temp :4201→:3001 (canonical) — freebuff :3000/:4200 left untouched
