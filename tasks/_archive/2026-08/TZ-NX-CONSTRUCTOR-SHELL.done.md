# TZ-NX-CONSTRUCTOR-SHELL — DONE

## Outcome

**PASS** — Constructor shell: `/constructor` route, header chip, four create-kind CTAs,
typed placeholder routes, domain copy (part = Material kind `part`, Complex not a create kind).

## Changed files

```
frontend-nx/apps/kppdf-web/src/app/pages/constructor/
  constructor.types.ts
  constructor.routes.ts
  constructor.page.ts
  constructor.page.spec.ts
  constructor-create-placeholder.page.ts
  constructor-create-placeholder.page.spec.ts
  constructor.routes.spec.ts
  constructor-a11y.spec.ts

frontend-nx/apps/kppdf-web/src/app/app.routes.ts
frontend-nx/apps/kppdf-web/src/app/layout/nav-categories.ts
frontend-nx/apps/kppdf-web/src/app/layout/nav-categories.spec.ts
frontend-nx/apps/kppdf-web/src/app/layout/app-shell.component.spec.ts
frontend-nx/apps/kppdf-web/src/app/layout/app-shell-constructor-nav.spec.ts
frontend-nx/apps/kppdf-web/src/app/layout/route-paths.spec.ts

docs/pages/constructor.page.md
docs/pages/PAGE-TZ-INDEX.md
docs/agent-checklists/TZ-NX-CONSTRUCTOR-SHELL.md
```

Untouched by design: `backend/**`, legacy `frontend/**`, rails, Registry Platform, permissions, API.

## Route matrix

| Route | Component | Guard |
|-------|-----------|-------|
| `/constructor` | `ConstructorPage` | `authGuard` (shell child) |
| `/constructor/create/:kind` | `ConstructorCreatePlaceholderPage` | same; unknown kind → alert |

Create kinds: `material`, `part`, `module`, `product`. No `complex`.

## Gates

- `pnpm exec nx build kppdf-web`: **PASS**
- `pnpm exec nx test kppdf-web`: **PASS** (all suites green)
- `pnpm exec nx run-many -t lint --all`: **PASS** (0 errors)
- `pnpm run architecture:check:nx`: **PASS** (209 files, 0 violations)
- `pnpm run ui:tokens:nx`: **PASS**

---

ARCHIVE_MARKER
outcome: PASS
closed_at: 2026-08-29
closed_by: cursor
verification:
  - route /constructor: PASS
  - header chip: PASS
  - four CTAs + placeholder: PASS
  - no Complex create kind: PASS
  - registries/kit routes intact: PASS
