# TZ-ADMIN-303 checklist

> Status: **DONE**  
> Marker: archived `tasks/_archive/2026-08/TZ-ADMIN-303.done.md`  
> Source: `tasks/_backlog/admin/TZ-ADMIN-303-system-roles-admin-edit.md`  
> Parallel-safe with WAVE-KP-USABLE (disjoint keys)

## Claim slot

- agent_id: `agent-3e757640b7`
- claimed_at: `2026-08-09T21:09:39Z`
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable — Unknown task TZ-ADMIN-303
- closed_at: `2026-08-09T18:18:00Z`

## Preflight

- [x] Canonical `D:\kppdf-8.0` / `main`
- [x] Peer `_active/TZ-SALES-339` only — disjoint keys; no foreign CLAIM on admin keys
- [x] Claim before code

## Acceptance

- [x] Site admin Edit/PATCH system role permissions/pages
- [x] System role DELETE forbidden (UI + API 403 `SYSTEM_ROLE_FROZEN`)
- [x] Escalation `isSystem:true` on non-system still forbidden
- [x] RU UI / toasts (badge «Системная»; toast «Системные роли нельзя удалить»)
- [x] Gates + archive + push; admin WIP no longer dirty

## Integrity slot

- [x] Тип: page (admin roles policy)
- [x] page.md updated (`docs/pages/admin-roles.page.md`)
- [x] SECTION-READINESS N/A
- [x] Чужой WIP (SALES/DOC) не в коммите
- [x] Conflict disclosure: filter + permission-labels.ru

## Gates (факт)

- backend tsc PASS
- system-role.guard Jest 7/7 PASS
- roles-admin controller Jest suite PASS
- frontend tsc PASS
- roles-admin.page.spec Jest 13/13 PASS
- Prettier zone PASS; ESLint warning-only (pre-existing HttpClient); diff-check PASS
- Self-verify PASS: admin → /admin/roles → Редактировать director → Сохранить; Delete absent; DELETE API 403 + code

## Executor report

- Finished dirty WIP: SystemRoleGuard allows admin PATCH; DELETE frozen; FE Edit for system at role:write
- Fixed filter to preserve `code`; badge no longer claims read-only
- Freebuff KP stack on :3000/:4200 untouched; verify used canonical temp :3001/:4201
- NEXT: idle. Deploy NO.

## Closeout

- [x] archive + lock + progress + remove `_active`
- [x] Status = DONE
- closed_at: 2026-08-09T18:18:00Z
