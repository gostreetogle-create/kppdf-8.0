═══════════════════════════════════════════════════════════════
TZ-ADMIN-306: Admin — role select from API + /admin hub cleanup — DONE
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-06
closed_by: Buffy (Freebuff worktree a405897c, executor)
acceptance_status: PASS
verification:
  - FE tsc on allowlist files: PASS (0 errors in pages/admin + app.routes)
  - focused Jest: PASS (4 suites / 45 tests — user-form, role-form, roles-admin, users-admin)
  - full-repo tsc: BLOCKED by pre-existing group-chips WIP at origin/main HEAD
    (warehouse-group-chips.ts, materials.page.ts ×9 — parallel session #1 zone,
    NOT in allowlist, NOT touched per instruction)
  - acceptance criteria: PASS (live API role dropdown + /admin redirect)
checklist: docs/agent-checklists/TZ-ADMIN-306.md
lock: .mimocode/locks/TZ-ADMIN-306-role-select-hub.lock
source_was: tasks/_active/TZ-ADMIN-306.md

---

## Summary

1. **User-form role <select> = live API list** (`PiRolesService.list` → GET /admin/roles):
   - value = role `name` (matches create-user contract), label = RU
     (`roleLabelRu`: admin→Администратор, director→Директор, manager→Менеджер,
     user→Пользователь; custom roles use their API `label`).
   - System roles first (canonical order), then custom roles by RU label.
   - Edit-mode safety: current role kept even if absent from API response.
   - Failure fallback: canonical system roles + inline error hint (form never blocks).
2. **`/admin` → redirect `/admin/users`** (real hub; placeholder page
   `_admin-placeholder.page.ts` deleted — no more fake «in development»).
   Target route keeps its capability gate → non-admins still land on /forbidden.
3. **Smoke (jest-level, no live stack in sandbox):** custom role `packer`
   returned by the roles API renders as selectable `<option>` in the new-user
   dropdown (value=packer, label=Упаковщик); system roles render RU labels;
   error path falls back to system roles. Live-stack E2E (create role → dropdown)
   deferred to deploy window — stack (Mongo/backend) not running in this worktree
   and shared with parallel session #1.
4. `docs/SECTION-READINESS.md` §7: one-line Admin note.

## Files changed (allowlist only)

- frontend/src/app/app.routes.ts (M) — /admin → redirect
- frontend/src/app/pages/admin/user-form-dialog.component.ts (M) — API role dropdown
- frontend/src/app/pages/admin/user-form-dialog.component.spec.ts (M) — smoke tests
- frontend/src/app/pages/admin/permission-labels.ru.ts (M) — ROLE_LABEL_RU + roleLabelRu + SYSTEM_ROLE_ORDER
- frontend/src/app/pages/admin/_admin-placeholder.page.ts (D) — removed
- docs/SECTION-READINESS.md (M) — §7 note
- docs/agent-checklists/TZ-ADMIN-306.md (A)
- tasks/_active/TZ-ADMIN-306.md (A→removed at closeout)
- progress.md (M)

## Known limits

- Full-repo `tsc -p tsconfig.app.json --noEmit` still red at origin/main HEAD:
  9 errors in the parallel session's group-chips WIP (catalog/inventory zone).
  Not my files, not my commit — do not mix chips into this commit.
- Live-stack smoke (custom role → dropdown in browser) requires Mongo+backend,
  not available in this isolated worktree; covered by focused jest smoke instead.
