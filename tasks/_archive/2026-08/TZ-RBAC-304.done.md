═══════════════════════════════════════════════════════════════
TZ-RBAC-304: user:read + /auth/me pages[] contract — DONE
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-04
closed_by: Cursor (docs + unit proof, PO small-tech)
acceptance_status: PASS
verification:
  - docs/RBAC-CONTRACT.md: stale «not yet pages[]» → documents pages[]
  - AuthService.getMe already projects role.pages via toAuthUser
  - backend jest auth.service.spec.ts: getMe pages[] + empty + no secrets PASS
protected_files:
  - docs/RBAC-CONTRACT.md
  - backend/src/modules/auth/auth.service.spec.ts
checklist: docs/agent-checklists/TZ-RBAC-304.md
lock: .mimocode/locks/TZ-RBAC-304-auth-me-pages-contract.lock
source: tasks/_backlog/TZ-RBAC-304-user-read-me-contract.md (archived)

---

## Summary

Контракт user:read (self /auth/me) vs user:admin (enumerate users) зафиксирован.
`GET /auth/me` отдаёт `pages: string[]`. Документ отставал от кода — выровнен.
Unit-тесты закрывают AC без e2e/mongo.

known_limitation: director checkbox UI = ACCESS-302 (уже DONE).
