# TZ-ADMIN-302 — System role all-checked read-only

**Outcome:** DONE  
**Date:** 2026-08-08  
**Cursor Verdict:** PASS (PO continuous claim → executor self)  
**Canon:** TZ backlog + ADMIN-301 system view

## Delivered

- System «Смотреть»: after catalog load every pageKey + capability shown **checked + disabled** (fixes empty matrix for `permissions: ['*']`)
- Banner RU: «Системная · нельзя изменить (полный доступ)»
- No Save / no PATCH on view mode (unchanged)
- Custom / non-system director·manager keep Edit (`role:write`)
- Jest: full-checked disabled view + editable custom; roles-admin Edit for non-system director/manager

## НЕ (as scoped)

- app-layout / UX-305
- SystemRoleGuard changes
- Deploy
- Peer dirty users-admin / chrome WIP (not staged)

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08T08:32:30Z
closed_by: agent-3e757640b7
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (fe tsc)
  - tests: PASS (role-form + roles-admin + permission-labels = 30)
  - checklist: UPDATED
  - progress.md: UPDATED
cursor_verdict: PASS
agent_id: agent-3e757640b7
conflict_disclosure: also touched permission-labels.ru.ts (banner copy required for AC)
