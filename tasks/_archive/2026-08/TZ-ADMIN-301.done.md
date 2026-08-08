# TZ-ADMIN-301 — Roles permissions UX + pageKey ACL

**Outcome:** DONE  
**Date:** 2026-08-08  
**Cursor Verdict:** PASS (PO continuous claim → executor self)  
**Canon:** `docs/audits/2026-08-08-chrome-nav-admin-smell.md`

## Delivered

- System roles: RU badge «Системная · только чтение» + **Смотреть** → read-only dialog with banner (SystemRoleGuard frozen by design)
- Custom roles: Create/Edit dialog — **разделы меню** (pageKey ACL) + capabilities matrix
- Admin API: `pages` on create/update DTO + `toClientRole`; catalog `GET /admin/permissions` returns `pages: PAGE_KEYS`
- Seed gap: `text-block-categories` added to `PAGE_KEYS`
- RU labels for all NAV pageKeys 2026-08-08; audit table in checklist

## НЕ (as scoped)

- app-layout / UX-301 compact nav
- SystemRoleGuard changes
- Deploy
- Peer dirty FE chrome WIP (not staged)

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08T08:26:00Z
closed_by: agent-3e757640b7
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (fe+be tsc)
  - tests: PASS (fe admin 56; be admin 23)
  - checklist: UPDATED
  - progress.md: UPDATED
cursor_verdict: PASS
agent_id: agent-3e757640b7
conflict_disclosure: also touched admin DTO/mapper/permissions catalog (pages ACL wire required for AC)
