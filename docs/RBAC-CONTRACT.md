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

## 11. Maintenance

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
