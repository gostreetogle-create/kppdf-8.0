# ACTIVE: TZ-FRONTEND-302-A1

Lane: A
Parent: TZ-FRONTEND-302
Owner: Buffy-TZ-FRONTEND-302-A
Status: blocked / needs shared API owner decision
Exact keys: `frontend/src/app/pages/admin/users-admin.page.ts`, `frontend/src/app/pages/admin/users-admin.page.spec.ts`, `frontend/src/app/pages/admin/roles-admin.page.ts`, `frontend/src/app/pages/admin/roles-admin.page.spec.ts`

Blocker: `PiUsersService` and `PiRolesService` expose only `list()`. Removing page `HttpClient` requires shared mutation methods outside approved A1 keys. STOP per canonical shared API serial/conflict rule.

Baseline: focused users + roles specs PASS, 27 tests. No product edits.
