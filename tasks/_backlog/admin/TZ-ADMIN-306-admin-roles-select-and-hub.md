═══════════════════════════════════════════════════════════════
TZ-ADMIN-306: Admin — role select from API + /admin hub cleanup
═══════════════════════════════════════════════════════════════

> READY for tomorrow. LAYER 2 · FE admin.
> Not a warehouse deploy blocker.
> CONFLICT: see keys. Do not touch desktop/mcp or Catalog-314 without PO.

ROLE: executor (Angular FE).

DEPS: Admin CRUD already on main; role dialog RU/wide polish already shipped.

Verified: user-form-dialog role select; roles-admin; _admin-placeholder;
  SECTION-READINESS Admin row; permission-labels.ru.ts.

---

## CONTEXT

- Users/roles are READY TO USE* for basic CRUD.
- User form role <select> is hardcoded user|manager|admin — missing director + custom roles.
- /admin stub still says "in development".
- Permission checkboxes = capability matrix (read/write/admin by domain), not page-ACL menu.

---

## DO

1. Load roles into user form select from API (PiRolesService / GET admin roles). Show RU label; value matches create-user contract. Include system + custom.
2. Redirect /admin -> /admin/users (or a real hub without fake WIP copy).
3. Smoke: create custom role -> appears in new-user dropdown.
4. FE tsc + focused jest PASS.
5. Touch SECTION-READINESS note if needed.

## DO NOT

- Warehouse-scoped ACL
- Full page-ACL checkbox UI (successor TZ)
- Break system-role freeze / last-admin guard
- Desktop/MCP, Catalog-314, kit removal

## ACCEPTANCE

- [ ] User form role dropdown = live API list (director + custom)
- [ ] /admin does not show false "in development"
- [ ] Custom role assignable to a user
- [ ] FE tsc + focused tests PASS; no unrelated dirty in commit

LAYER: 2
CONFLICT KEYS: frontend/src/app/pages/admin/;frontend/src/app/app.routes.ts;docs/SECTION-READINESS.md;docs/agent-checklists/TZ-ADMIN-306.md;tasks/_active/TZ-ADMIN-306.md;progress.md
