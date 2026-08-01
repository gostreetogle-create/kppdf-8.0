# Protected Page Onboarding Contract (TZ-258)

> **Audience:** backend contributors adding new `@Permissions`-gated routes; frontend contributors wiring capability-aware nav and route guards; operators verifying CI gates on the policy audit script.
> **Status:** MANDATORY-for-all-new-routes. Pre-existing untagged routes are documented in `backend/scripts-fields-helpers/LEGACY_RBAC_EXCEPTIONS.json` with remediation plans.

This contract unifies TZ-255 (backend permissions enforcement), TZ-256
(frontend capability gates), and TZ-251 (object-level authorization)
into a single onboarding checklist. It exists so that future
contributors cannot ship a protected route that:

- lacks `@Permissions` (server cannot enforce capability);
- lacks `@OwnerOnly` (server cannot enforce IDOR);
- lacks `data.capabilities` on the frontend route (capability guard silently bypasses);
- lacks the corresponding UTC frontend nav metadata (admin links visible to non-admins);
- lacks the new TZ-258 `audit-policy-metadata` exit-zero (CI gate).

---

## 1. Capability key format

Canonical format: **`<section>:<action>`**.

- `section` is lowercase snake_case. It is derived from the catalog in
  `backend/src/common/seed/permissions.constants.ts` and mirrored on
  the frontend at `frontend/src/app/core/capabilities/capabilities.metadata.ts`.
- `action` is one of three:
  - `read` — SELECT / list / detail fetch (idempotent, no mutation)
  - `write` — INSERT / UPDATE / soft-activate (mutation, scoped to row)
  - `admin` — DELETE / role assignment / status overrides / DB-level sweeps

Wildcard `*` is reserved for `AdminSeed` (canonical role) and for
explicit user-level overrides. It is NOT a section identifier — do
NOT create keys with shape `*:read` or `system:*`.

---

## 2. Server-side: `@Permissions(...)` decorator

Backend decorator pattern:

```typescript
@Post()
@Roles('admin', 'manager')             // legacy role gate (TZ-91 compat)
@Permissions('product:write')          // new capability gate (TZ-255)
@AuditAction({ action: 'create', entityType: 'Product' })
async create(@Body() dto: CreateProductDto) { ... }
```

Composition rules:

1. **`@Roles()`** — keep for legacy endpoints; backward-compat with TZ-91.
2. **`@Permissions()`** — MANDATORY for any new protected route. The
   guard is registered globally as `APP_GUARD` (between `JwtAuthGuard`
   and `RolesGuard`), see `backend/src/app.module.ts`.
3. **`@Roles()` + `@Permissions()` AND-compose**: BOTH must pass.
   Order matters; missing capability surfaces a precision 403, not
   a generic role-error.
4. **Canonical-key validation** — decorator factory
   `assertCanonicalKeys` rejects unknown keys at construction time.
   The boot-time validator `PermissionsBootValidator` runs in
   production and exits if any controller has a non-canonical key;
   relaxable via `BOOT_RELAX_PERMISSIONS=1` for emergency dev only.
5. **Object-level auth** — for routes that mutate a single existing
   resource (`PATCH /api/x/:id`, `DELETE /api/x/:id`, etc.), pair with
   `@OwnerOnly('x')` so ownership mismatch returns **404** (TZ-251
   §ШАГ 4) and avoids enumeration.

---

## 3. Frontend: route metadata `data: { capabilities: [...] }`

Capability gating wires via `app.routes.ts`:

```typescript
{
  path: 'admin/users',
  canMatch: [authGuard, capabilityRouteGuard],
  data: { capabilities: ['user:read'] },
  loadComponent: () => import('./pages/admin/users-admin.page').then((m) => m.UsersAdminPage),
  title: 'KPPDF — Пользователи',
}
```

Composition rules:

1. **Always pair with `canMatch: [authGuard, capabilityRouteGuard]`**
   unless the route is `/kit/*` (public showcase) or `/forbidden`.
2. **`data.capabilities` is OR-semantics** (matches TZ-255
   PermissionsGuard). Empty array bypasses (no gate).
3. **Wildcard not directly supported on the route** — admin-class
   bypass is auto-handled by `CapabilitiesService` when
   `user.role === 'admin'`. Operators do NOT need to write
   `data: { capabilities: ['*'] }`.

---

## 4. Frontend navigation

`PiNavDropdownItem.capabilities?: PermissionKey[]` field controls
visibility:

- Omit → always visible inside dropdown (caller gates at route level).
- Empty array → always visible.
- Non-empty `['x']` → visible iff `CapabilitiesService.hasAny(['x'])`.
- The `'admin'` category drops entirely when the user lacks ALL
  nested item capabilities.

Avoid per-component `if (role === 'admin')` checks. Always go through
`CapabilitiesService.hasAny(key)`.

---

## 5. The 403 / 401 / 404 distinction

Frontend UX rules:

| HTTP status | Trigger                                       | UX path                                            |
|-------------|------------------------------------------------|----------------------------------------------------|
| `401`       | No JWT or refresh-token expired                 | `/login` via `authInterceptor` → redirect, refresh-and-retry on subsequent calls |
| `403`       | Valid JWT but wrong role/permission            | `/forbidden` via `authInterceptor` (single /forbidden page; no per-route 403 states) |
| `404`       | Resource missing OR ownership mismatch (TZ-251) | Implicit — the URL never resolves; client should not show "exists but not yours" |

Server rules (canonical, see TZ-251 §ШАГ 4):

- **401 Unauthorized** in `JwtAuthGuard`/ownership guard Step 4.
- **403 Forbidden** in `PermissionsGuard`/`RolesGuard`.
- **404 Not Found** in `OwnershipGuard` Step 6/9 (no enumeration).

Never let `OwnershipGuard` return 403 — that's an enumeration leak.
Use `NotFoundException` from `@nestjs/common` instead.

---

## 6. Audit action conventions

For any mutation that should appear in the audit log, follow
`{entity}:{verb}`:

- `user:create`, `user:patch`, `user:delete`, `user:change-password`
- `role:create`, `role:patch`, `role:delete`
- `document:patch`, `template:create`, etc.

Sensitive field redaction is enforced by `LoggerModule` redact list
in `app.module.ts` — `password`, `passwordHash`, `token`, `secret`,
`refreshToken`, `accessToken`, and all wildcard `*.*` variants are
removed from audit log lines automatically.

---

## 7. Test conventions

Each protected route requires:

- **Unit** — Guard/decorator test (TZ-255 `permissions.guard.spec.ts`);
- **Component** — for the frontend route (TZ-256 capability-route.guard
  is testable with `TestBed.runInInjectionContext`);
- **E2E** — deferred to TZ-251.A / TZ-255.A pending Mongo harness
  availability.

A test matrix entry covers: `user-with-perm → 200`, `user-without-perm → 403`,
`admin-wildcard → 200`, `unauthenticated → 401`, `malformed-id → 404`.

---

## 8. Onboarding checklist (one-page summary)

When adding a new protected route, run this checklist before merging:

| Step | Files                                                         | Verifies                                           |
|------|---------------------------------------------------------------|----------------------------------------------------|
| 1    | Backend `*.controller.ts` — add `@Permissions(...)`           | Service-side capability enforcement               |
| 2    | Backend `*.controller.ts` — add `@OwnerOnly(...)` if `:id` mutation | TZ-251 IDOR protection for the route     |
| 3    | Frontend `app.routes.ts` — add `data: { capabilities: [...] }` | Capability guard on the route                       |
| 4    | Frontend `app.routes.ts` — pair `canMatch: [authGuard, capabilityRouteGuard]` | Auth + Capability check |
| 5    | Frontend `*/nav` — add `capabilities?: PermissionKey[]`  on the related nav item | Hide from non-permitted users                |
| 6    | Backend — extend unit specs for the guard                       | Capability-positive AND capability-negative paths |
| 7    | CI — `pnpm exec ts-node backend/scripts/audit-policy-metadata.ts` exits 0 | New route covered or listed in LEGACY_RBAC_EXCEPTIONS.json |
| 8    | Frontend — extend `capability-route.guard.spec.ts` for the new route | Frontend defense-in-depth |
| 9    | Backend — extend `permissions.guard.spec.ts` for the new key composition | OR-semantics regression-pin |
| 10   | Frontend — extend `capabilities.service.spec.ts` for the new section | Admin shortcut, wildcard shortcut, role-only |

Items 1-4 are mandatory for ship. Items 5-10 are mandatory for ship in
any future TZ; for the current TZ-258 close-out, items 1-4 are
gradual adoption tracked by the audit script.

---

## 9. Cross-references

- **TZ-254 RBAC contract** — `docs/RBAC-CONTRACT.md` (canonical format + algorithm).
- **TZ-255 PermissionsGuard** — `backend/src/common/guards/permissions.guard.ts`.
- **TZ-256 Capability gates** — `frontend/src/app/core/capabilities/capability-route.guard.ts`.
- **TZ-251 OwnershipGuard** — `backend/src/common/guards/ownership/ownership.guard.ts`.
- **TZ-257 Admin module** — populates `/api/admin/*` endpoints; references this contract for the user/role ACL testing matrix.
- **Audit script** — `backend/scripts/audit-policy-metadata.ts` (boot-time gate in production).
- **Legacy exceptions** — `backend/scripts-fields-helpers/LEGACY_RBAC_EXCEPTIONS.json`.
