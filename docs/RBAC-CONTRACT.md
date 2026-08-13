# RBAC-CONTRACT

> Canonical reference for role-based access control in kppdf-8.0.
> Author: senior-orchestrator · TZ-254 · 2026-07-31 · Status: CANONICAL

This file is the operator- and developer-facing manual for the project's
RBAC model. It is the **single source of truth** that downstream TZs
(`TZ-251` object-level authz, `TZ-255` server-side permissions, `TZ-256`
frontend capabilities, `TZ-257` admin module, `TZ-258` onboarding) reference
in their own contract sections.

The runtime implementation lives in
[`backend/src/common/contracts/rbac-contract.ts`](../backend/src/common/contracts/rbac-contract.ts).
The seeded catalog lives in
[`backend/src/common/seed/permissions.constants.ts`](../backend/src/common/seed/permissions.constants.ts).
The contract **re-exports** the catalog rather than redefining it, so
seed-time and runtime-time cannot drift.

---

## 1. Permission key format

```
<section>:<action>
```

- `<section>` is one of the named entities in the catalog (see §6).
- `<action>` is one of `read`, `write`, `admin` (see §2).
- The wildcard character `*` (see §4) is the single exception to this
  two-token shape.

Examples (taken verbatim from the seeded catalog):

| Key | Section | Action |
|-----|---------|--------|
| `user:read` | user | read |
| `product:write` | product | write |
| `finance:admin` | finance | admin |
| `*` | (any) | (any) |

### `user:read` vs `user:admin` (self-service boundary)

> Peer-audit 2026-08-02 Finding 5 — см. также `TZ-RBAC-304`,
> `docs/audits/2026-08-02-rbac-capability-gap-audit.md`.

| Key | Allowed surfaces | Forbidden |
|-----|------------------|-----------|
| `user:read` | Self-service: `GET /auth/me`; optional self profile read paths that never enumerate other users | `GET /api/admin/users` list (enumerates all accounts) |
| `user:admin` | Admin user directory list/create/role/password resets (`/api/admin/users*`) | Must not be confused with «any authenticated user» |

Code already documents this split (`frontend/.../app.routes.ts` admin/users gate;
`users-admin.controller.ts` comments). `/auth/me` returns `permissions[]` **and**
`pages: string[]` (effective role page ACL via `AuthService.toAuthUser` —
TZ-ACCESS-301 + TZ-RBAC-304). Empty array is valid when the role has no pages.

There is **no** dedicated `/users/me` CRUD endpoint — self-service stays on
`GET /auth/me`; do not invent a parallel surface.

## 2. Three-action semantics

| Action | Scope | Typical surface |
|--------|-------|-----------------|
| `read` | SELECT / list / detail (no mutation) | `GET /api/<section>` |
| `write` | INSERT / UPDATE / soft-activate (row-scoped mutation) | `POST /api/<section>`, `PATCH /api/<section>/:id` |
| `admin` | DELETE / role assignment / status overrides / bulk sweeps | `DELETE /api/<section>/:id`, `POST /api/users/:id/role` |

Surfaces marked `admin` MUST NOT be reachable with only `write`. The
`TZ-255 PermissionsGuard` enforces this; do not bypass with manual
guards in feature controllers.

## 3. Effective permissions algorithm

Given a `(user, role)` pair, the **effective** permission set is:

1. **Start empty.**
2. **Add** every key in `user.permissions`.
3. **Add** every key in `role.permissions`.
4. **Wildcard promotion:** if any of the following holds, add the **entire
   catalog**:
   - `user.permissions` contains `*`
   - `role.permissions` contains `*`
   - `role.name === 'admin'`

Computed by `effectivePermissions(user, role)` in
`rbac-contract.ts`. Returns `Set<string>` for O(1) `has(...)` checks.

### Why does admin get every permission implicitly?

Convention over configuration: the seeded `admin` role has `permissions: []`
(empty array) yet is expected to *do everything*. The `role.name === 'admin'`
shortcut avoids seeding/redundant 30+ keys array and is the single place
where the canonical "all-powerful" check lives.

## 4. Wildcard (`*`) rules

- The literal string `*` on EITHER `user.permissions` or `role.permissions`
  promotes every catalog key.
- Wildcard is **role-aware**: a `manager`-role user with `*` in
  `user.permissions` ALSO gets admin-level access. Use sparingly.
- Operators must NOT place `*` on the seeded `manager` role; it is reserved
  for break-glass admin override.

## 5. System roles + invariants

Canonical system role names (frozen, seeded at first boot):

| Name | isSystem | Permissions | Notes |
|------|----------|-------------|-------|
| `admin` | `true` | (effective `*` via role-name check) | Cannot be deleted; cannot be the only-active-then-deactivated admin. |
| `manager` | `true` | `[]` (gets explicit perms via @Permissions scope or seed) | Cannot be deleted. |
| `user` | `true` | `[]` | Cannot be deleted. |

Invariants enforced by `lastAdminInvariant()` (a pure helper at
`rbac-contract.ts`) and materialized by `TZ-257`:

1. `admin`-role accounts cannot be deleted if they are the last active admin.
2. The last active admin cannot be `isActive=false`-transitioned or demoted.
3. Custom roles MUST NOT collide on `name` with system roles.

`TZ-257` will wire these helpers into `LastAdminGuard` and the admin
HTTP surface. Until that TZ lands, the `RoleService.remove()` already
refuses `isSystem` deletes (TZ-91 baseline).

## 5b. Single hidden owner invariant (TZ-AUTH-306)

The system has **exactly one** hidden owner. It is NOT a role and NOT a
permission checkbox — it is the immutable `User.isOwner` flag.

| Fact | Value |
|------|-------|
| Field | `User.isOwner` (default `false`) |
| DB invariant | partial unique index on `{ isOwner: 1 }` with `partialFilterExpression: { isOwner: true }` → at most one `true` |
| Pinning | idempotent bootstrap backfill binds it to the exact `ADMIN_USERNAME` active bootstrap admin; 0 matches / mismatch / >1 owner → **fail-closed startup error** |
| Exposure | never in `CreateUserDto` / `UpdateUserDto` / `RegisterDto`; global `whitelist+forbidNonWhitelisted` rejects unknown fields |
| Guards | owner bypasses `RolesGuard` / `PermissionsGuard` / page ACL (always full access) without an owner-only role name |
| Visibility | owner is **hidden** from non-owner `list`/`count`/`search`/`getById` (404 for direct id) |
| Mutation | non-owner cannot PATCH/delete/deactivate/reset-password/demote the owner (404); owner cannot self-delete/deactivate/demote (403 `OWNER_SELF_PROTECTED`) |
| Owner-only surfaces | role CRUD + permissions/pages matrix (`OwnerOnlyGuard`, 403 `OWNER_ONLY`); grant/revoke of admin power (`OwnerTargetGuard`) |
| Break-glass | owner password login is preserved |

Owner-only pages are stripped from `/auth/me` `pages[]` for non-owners
(`admin-roles`), so the role editor never renders for ordinary admins and
no role can grant it. `isOwner` is hydrated server-side by `JwtStrategy`
from the DB — it is never trusted from a JWT claim.

## 5c. Device credential model (TZ-AUTH-303)

The device (a named browser/PC) is a first-class access subject. Two
separate entities back it — **never** mix invite secrets with device
credentials:

| Entity | Purpose | Storage | Lifetime |
|--------|---------|---------|----------|
| `DeviceInvite` | one-time, admin-issued; `regular` carries a preselected ACTIVE `role`, `owner-device` carries an immutable `ownerUserId` | SHA-256 hash + display prefix only | 1/3/7 days (default 3d); owner-device 15m |
| `BrowserDeviceGrant` | browser-only credential bound to a `userId` | SHA-256 hash only | 365d default, per-invite overridable |

Hard rules:

- The grant secret is delivered in a `__Host-` cookie (`Secure + HttpOnly +
  SameSite=Lax`, `Path=/`, no `Domain`). It is **never** accepted as
  `Authorization: Bearer`, `X-Access-Token`, JWT, or a Desktop `kppd_` key.
- The cookie-only session endpoint issues a normal access JWT capped at 5m
  and issues **no refresh token**; renewal always re-checks the grant. So
  revoke / role-change / device-User deactivation takes effect within 5m.
- Regular activation creates a `User(accountType: 'device')` with a random,
  never-issued password hash and exactly the invite's role — the role is
  **never** accepted from the public client. Owner-device activation binds
  to the existing single owner and never creates a second owner.
- Admin power stays owner-only: ordinary admins cannot mint an `admin`-role
  invite nor PATCH a device to/from the `admin` role.
- `passwordHash` is required for device Users too; admin password reset for
  `accountType: 'device'` is rejected (409).
- Device credentials never appear in audit/access messages (only hashes,
  device names, and grant ids).

## 6. OWNERSHIP_BY_ENTITY matrix

Each entity is either **user-owned** (a row is conceptually owned by its
`createdBy`) or **shared** (corporate data — section-level permission is
sufficient). `TZ-251` consumes this matrix to decide when an IDOR-style
ownership check applies:

| Entity | Ownership |
|--------|-----------|
| documentTemplate | `createdBy` |
| generatedDocument | `createdBy` |
| photo | `createdBy` |
| counterparty | `null` (shared) |
| product | `null` (shared) |
| material | `null` (shared) |
| category | `null` (shared) |
| warehouse | `null` (shared) |
| order | `null` (shared) |
| contract | `null` (shared) |
| organization | `null` (shared) |

`isUserOwnedEntity(key)` returns `true` when `OWNERSHIP_BY_ENTITY[key] === 'createdBy'`.
`ownershipColumnFor(key)` returns the column name or `null` when the key
is unknown OR explicitly shared.

`TZ-251` extends this matrix to the full entity list. The current rows
above reflect the entities most commonly observed in current
controllers; adding a new row is additive and does not change the
shape.

## 7. Custom role caveats

When creating a non-system role:

| Constraint | Reason |
|------------|--------|
| `name` MUST be unique across both system AND custom roles | Avoids accidental collision with `admin` / `manager` / `user`. |
| `name` MUST match `/^[a-z][a-z0-9_.-]{1,63}$/` | Stable identifier for audit logs and `effectivePermissions`. |
| `permissions[*]` MUST be drawn from the canonical catalog (TZ-255 will reject unknown keys) | Drift between role definition and runtime expectation is the canonical source of "ghost access denied" bugs. |
| `sectionIds[]` is treated as an **informational hint only**; the runtime check is keyed off `permissions[*]` | Section hints help surface which controller groups a role has access to in `/kit/admin` UI. |
| `sortOrder` must be unique within the `(isSystem, sortOrder)` pair to support stable ordering on `/api/roles` | Avoids UI flicker in role pickers. |

## 8. Migration safety

`User.role` is a single `string` field per TZ-04. **Multi-role migration
is OUT OF SCOPE** for `TZ-254`. When the team eventually needs multi-role
users, the migration is a separate TZ that touches:

- `User.schema` (rename `role: string` → `roleIds: ObjectId[]`)
- `RoleService.findOrCreateManyForUser()`
- Auth layer (`JWT payload role` → `JWT payload roles[]`)
- `effectivePermissions` (loop over all roles instead of one)

Markers: do not introduce `pendingRoleIds[]` as a stop-gap — that
contradicts `effectivePermissions`'s single-source contract.

## 9. Examples

### 9.1 Typical manager role

```
name:        manager-procurement
permissions: ['procurement:read', 'procurement:write']
isSystem:    false
sortOrder:   50
sectionIds:  ['procurement']
```

Effective permissions for a user with `manager-procurement`: exactly
the two keys above.

### 9.2 Typical user role

```
name:        user-readonly
permissions: ['document:read', 'product:read']
isSystem:    false
sortOrder:   200
sectionIds:  ['document', 'product']
```

### 9.3 Break-glass admin

If an operator needs temporary admin power without touching the `admin`
role's seed:

```
user: { permissions: ['*'] }  // break-glass override
```

This promotes the user to every catalog key on next `effectivePermissions`
call. **Use sparingly** — every `*` should be paired with a
`User.permissions` row audit entry.

## 10. Cross-references

| TZ | What it consumes / produces |
|----|-----------------------------|
| `TZ-91` (RBAC sweep) | Re-exports `SYSTEM_ROLE_NAMES` and uses `effectivePermissions` for `@Roles()` checks. |
| `TZ-251` (Object-level authorization) | `OWNERSHIP_BY_ENTITY` + `isUserOwnedEntity` for IDOR guard. |
| `TZ-255` (Server-side permissions enforcement) | Canonical catalog validation + `@Permissions()` decorator. |
| `TZ-256` (Capability-aware routes) | Re-exports `effectivePermissions` for frontend capability checks. |
| `TZ-257` (Admin module) | `lastAdminInvariant` + system-role surfaced in `users-admin` / `roles-admin`. |
| `TZ-258` (Protected-page onboarding) | Reference contract that protected pages must cite. |

## 11. Admin permissions catalog endpoint

`GET /api/admin/permissions` returns the complete canonical permission catalog
used by the admin role editor. Because this response exposes every available
capability, it is not a general role-read endpoint:

- the authenticated user must have the `admin` role (the legacy role guard);
- the user must also satisfy `role:write` in effective permissions (the
  capability used for role creation and editing); `role:read` alone is
  insufficient and receives `403`. The seeded admin role is promoted to the
  full catalog by the canonical effective-permissions algorithm, so its
  empty explicit permissions array is intentional;
- the endpoint is decorated with the explicit audit action
  `admin.permissions.catalog` for entity type `Permission`.

The audit interceptor keeps ordinary `GET` requests unaudited to avoid noisy
read logging. This endpoint opts in with `auditRead: true`, so successful
catalog access produces an audit record without changing behavior for other
read-only routes.


## Page ACL (TZ-ACCESS-301)

Page-level access control sits **above** fine-grained permission keys. A
role's `pages: string[]` array determines which navigation sections are
visible in the UI.

### Canonical PAGE_KEYS catalog

Defined in `backend/src/common/seed/permissions.constants.ts` (1:1 with
`app-layout.component.ts` nav items):

| Page key | Nav section | Description |
|----------|-------------|-------------|
| `products` | Catalog | Products registry |
| `modules` | Catalog | Product modules |
| `materials` | Catalog | Materials dictionary |
| `work-types` | Catalog | Work types |
| `organizations` | Admin | Our legal entities (not customers) |
| `proposals` | Deals | Commercial proposals (KP) |
| `contracts` | Deals | Contracts |
| `orders` | Deals | Orders |
| `counterparties` | Clients | Customers (TZ-NAV-301) |
| `design` | Design | Design queue stub (TZ-NAV-301) |
| `supply` | Supply | Procurement stub (TZ-NAV-301) |
| `shipping` | Warehouse | Shipping stub (TZ-NAV-301) |
| `dictionaries` | Reference | All dictionaries |
| `categories` | Reference | Categories / classification |
| `doc-template-categories` | Reference | Template categories |
| `color-references` | Reference | Color references (RAL) |
| `doc-templates` | Documents | Document templates |
| `doc-texts` | Documents | Text blocks |
| `doc-tables` | Documents | Table templates |
| `doc-documents` | Documents | Document archive |
| `inventory` | Warehouse | Inventory overview |
| `storage-items` | Warehouse | Storage items |
| `stock-movements` | Warehouse | Stock movements |
| `people` | Production | People / workers directory |
| `production` | Production | Production cockpit / Gantt |
| `admin-users` | Admin | User management |
| `admin-roles` | Admin | Role management |

### Default page assignments

| Role | Pages |
|------|-------|
| `admin` | All 23 pages (full access) |
| `director` | All except `admin-users`, `admin-roles` |
| `manager` | Catalog + Deals + Dictionaries + Documents + Inventory + People |
| `user` (Worker) | `doc-texts`, `doc-documents` |

### Delivery

`GET /auth/me` returns `pages: string[]` in the `AuthUserPayload`. The
frontend `app-layout.component.ts` filters `NAV_CATEGORIES` using these
pages (via `CapabilitiesService`). Roles seeded at first boot via
`admin.seed.ts`.

### Extension

Adding a new page **or** a new permission key — follow
[`FEATURE-INTEGRATION-CHECKLIST.md`](./FEATURE-INTEGRATION-CHECKLIST.md)
(mandatory). Short form:

Adding a new page:
1. Add the key to `PAGE_KEYS` in `permissions.constants.ts`.
2. Add the nav item to `NAV_CATEGORIES` in `app-layout.component.ts`.
3. Update default role pages in `admin.seed.ts`.
4. Add `docs/pages/<name>.page.md` + index row.

Adding a new `section:action` permission:
1. Append to `PERMISSIONS` in `permissions.constants.ts`.
2. Add RU label in `frontend/src/app/pages/admin/permission-labels.ru.ts`
   (keep seed descriptions ASCII; UI copy is Unicode-escaped).
3. Wire `@Permissions` + FE capabilities as needed.

Removing a page: remove from all PAGE_KEYS / nav / seed locations and audit existing
role documents for stale keys.

## 12. Maintenance

`TZ-254` is the **last chance** to fix contract semantics WITHOUT a
schema migration. After this TZ ships:

- Adding a new section → append PERMISSIONS entry + update `Section` union.
- Removing a permission key → must update ALL role seeds AND every
  `@Permissions(...)` site that references it (TZ-255 audit sweep).
- Renaming a section → coordinate with TZ-255 + TZ-256 in a paired
  PR; requires user-data audit if any role already references the old
  key.

Authored: 2026-07-31 · TZ-254 implementation pass. Verified against
`backend/src/common/seed/permissions.constants.ts` and
`backend/src/common/contracts/rbac-contract.ts` on 2026-07-31.
