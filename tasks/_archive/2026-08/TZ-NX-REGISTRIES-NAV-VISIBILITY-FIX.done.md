# TZ-NX-REGISTRIES-NAV-VISIBILITY-FIX — header «Реестры» visibility

## Problem

`/registries` route exists and works, but the header chip was hidden for users
with restrictive `user.pages[]` allow-lists that omit `pageKey: 'registries'`
(no backend page-ACL seed exists for this NX-local platform).

## Root cause

`filterNavCategories()` line:
`if (pages && !pages.includes(item.pageKey)) return false;`

The registries nav item honestly uses `pageKey: 'registries'` but that key is
never seeded in backend RBAC — so any role with explicit `pages[]` filtering
lost the chip even though the route is real.

## Fix

Added `skipPageAcl?: boolean` to `AppNavItem`. When true, the item stays
visible if its route exists in NX, bypassing `pages[]` filtering only — no
fake backend permission, capabilities/systemRoles gates unchanged.

Set `skipPageAcl: true` on the registries catalog item.

## Changed files

```
modified:
  frontend-nx/apps/kppdf-web/src/app/layout/nav-categories.ts
  frontend-nx/apps/kppdf-web/src/app/layout/nav-categories.spec.ts
  frontend-nx/apps/kppdf-web/src/app/layout/app-shell.component.spec.ts

new:
  frontend-nx/apps/kppdf-web/src/app/layout/app-shell-registries-nav.spec.ts
  docs/agent-checklists/TZ-NX-REGISTRIES-NAV-VISIBILITY-FIX.md
  tasks/_archive/2026-08/TZ-NX-REGISTRIES-NAV-VISIBILITY-FIX.done.md
```

## Gates

- `pnpm exec nx build kppdf-web`: **PASS**
- `pnpm exec nx test kppdf-web`: **PASS** — 90/90 (15 suites)
- `pnpm exec nx run-many -t lint --all`: **PASS** — 0 errors
- `pnpm run architecture:check:nx`: **PASS**
- `pnpm run ui:tokens:nx`: **PASS**

## Explicit non-goals

- No backend permission/pageKey added
- No shell rail changes
- Dead-link filter for business routes preserved

---

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-29
closed_by: cursor
