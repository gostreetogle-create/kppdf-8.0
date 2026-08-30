# TZ-NX-CONSTRUCTOR-PLACEHOLDER-FIX — DONE

## Outcome

**PASS** — Fixed review blockers from `TZ-NX-CONSTRUCTOR-SHELL-REVIEW`:
- B1: back button now navigates via `(click)` + `Router.navigateByUrl` (no `<a><app-pi-button>` nesting)
- P1-1: conditional `aria-labelledby` + sr-only heading for unknown kind
- P1-2: click→navigation test + `constructor-create-placeholder-a11y.spec.ts`

## Changed files

```
frontend-nx/apps/kppdf-web/src/app/pages/constructor/
  constructor-create-placeholder.page.ts
  constructor-create-placeholder.page.spec.ts
  constructor-create-placeholder-a11y.spec.ts (new)

docs/pages/constructor.page.md
docs/agent-checklists/TZ-NX-CONSTRUCTOR-PLACEHOLDER-FIX.md
```

Untouched by design: `ButtonComponent` (no routerLink API), shell rails, Registry Platform, routes, nav.

## Gates

- `pnpm exec nx build kppdf-web`: **PASS**
- `pnpm exec nx test kppdf-web`: **PASS**
- `pnpm exec nx run-many -t lint --all`: **PASS** (0 errors)
- `pnpm run architecture:check:nx`: **PASS** (220 files, 0 violations)
- `pnpm run ui:tokens:nx`: **PASS**

---

ARCHIVE_MARKER
outcome: PASS
closed_at: 2026-08-29
closed_by: cursor
verification:
  - back button click navigates to /constructor: PASS
  - unknown-kind aria-labelledby valid: PASS
  - a11y specs known + unknown kind: PASS
