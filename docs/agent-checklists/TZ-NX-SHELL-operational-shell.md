# TZ-NX-SHELL-operational-shell checklist

> Status: **DONE**
> Marker: archived as `tasks/_archive/2026-08/TZ-NX-SHELL-operational-shell.done.md`
> Commit/push: по `docs/GIT-POLICY.md` — не запушено, ждёт слова PO

## Claim slot

- agent_id: claude
- claimed_at: 2026-08-29T00:00:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable

## Preflight

- [x] `git rev-parse --show-toplevel` → `D:\kppdf-8.0`, branch `main`
- [x] `tasks/_active/` пуст, `_NOW.md` ACTIVE/LIVE пуст — конфликтов нет
- [x] Изучен legacy `frontend/src/app/layout/**`, `app.routes.ts`
- [x] Изучен текущий NX app (`app.routes.ts`, `kit-layout.component.ts`,
      `theme-toggle.component.ts`, `@kppdf/ui/*` aliases, `@kppdf/data-access/*`)
- [x] Claim slot заполнен; `tasks/_active/TZ-NX-SHELL-operational-shell.md` создан

## Acceptance

- [x] Header: brand, quick top-level section links (only for routes that
      really exist), active section highlight, back/forward buttons,
      theme toggle, user/logout (when auth wiring available), a11y (aria-label,
      keyboard focus).
- [x] Sidebar: same category order/labels/icons as legacy
      `frontend/src/app/layout/app-layout.component.ts` `NAV_CATEGORIES`,
      RouterLink/RouterLinkActive, expand/collapse per group (local signal
      state), desktop = permanent, narrow viewport = collapsible.
- [x] Back/forward via a small app-level nav-history service built on
      Angular `Location.back()/forward()` (no custom URL-history reinvention)
      + disabled state when unavailable + aria-label/title.
- [x] Layout: header top / sidebar left / outlet right; `/kit/*` keeps its
      own `KitLayoutComponent`, no double chrome.
- [x] Menu items only for routes that actually exist in NX `app.routes.ts`
      (dynamic filter against the router config) — no dead links.
- [x] Only existing `@kppdf/ui/*` + `lucide-angular` (already a dep) used;
      no new shared UI primitives added to `libs/ui/**`.
- [x] Unit tests: active link, expand/collapse, back/forward behavior,
      router-outlet present, kit route tree isolated from shell.

## Integrity slot

- [x] Type: module (app shell / navigation), NX-only.
- [x] FIC: N/A — pure frontend-nx app-shell scaffolding, no new backend
      permission/pageKey introduced.
- [x] Page docs: N/A (no new business page; shell wraps existing
      `/admin/devices`, `/admin/roles`).
- [x] Section readiness: N/A.
- [x] Conflict keys: `frontend-nx/apps/kppdf-web/src/app/layout/**`,
      `frontend-nx/apps/kppdf-web/src/app/app.routes.ts` — no other WIP touched.
- [x] Coupling map: N/A.
- [x] Канон: docs/DOCS-INTEGRITY.md.

## Gates (факт)

- `pnpm exec nx build kppdf-web`: **PASS** (production build, budgets warnings pre-existing/unrelated).
- `pnpm exec nx test kppdf-web --passWithNoTests`: **PASS** — 5 suites, 29 tests.
- `pnpm exec nx run-many -t lint --all`: **PASS** — 0 errors (pre-existing non-null-assertion warnings only, same pattern as rest of repo).
- `pnpm run architecture:check:nx`: **PASS** — 185 source files, 0 violations.
- `pnpm run ui:tokens:nx`: **PASS** — 53 baseline occurrences, no new raw colors.

## Executor report

Added an app-level operational shell to `frontend-nx/apps/kppdf-web` without
touching legacy `frontend/**` or any shared lib:

- `layout/nav-categories.ts` — `NAV_CATEGORIES` ported 1:1 (labels, icons,
  order, route paths) from legacy `app-layout.component.ts`; `filterNavCategories`
  (route-existence + page-ACL + capability + systemRoles filter, drops empty
  categories) and `matchActiveCategoryId` as pure, unit-tested functions.
- `layout/route-paths.ts` — `collectPageRoutePaths` flattens the live Angular
  `Route[]` config into the set of paths that actually render a page (leaf
  `loadComponent`, no `children`), so the shell only links to routes that
  really exist — currently only `/admin/devices` and `/admin/roles`; every
  other legacy category (catalog, clients, deals, design, supply, production,
  warehouse, docs, reference) is present in the data but renders zero items
  today and will light up automatically as those pages land in NX.
- `layout/nav-history.service.ts` — small `NavHistoryService`: tracks a
  same-app URL stack from `Router` events purely to compute
  `canGoBack`/`canGoForward`; `back()`/`forward()` always delegate to
  Angular `Location.back()/forward()` (real browser history), so there's no
  parallel navigation mechanism.
- `layout/app-shell.component.ts` — header (brand, mobile sidebar toggle,
  back/forward, quick section chips, theme toggle, user name + logout) +
  sidebar (grouped nav, expand/collapse via a local `Set<string>` signal,
  `RouterLink`/`RouterLinkActive`, permanent on desktop / collapsible under
  `md`) + `<router-outlet>`. Auth/capabilities read via
  `@kppdf/data-access/auth` and `@kppdf/data-access/capabilities`; UI only
  via existing `@kppdf/ui/*` design tokens (`global.css`) and
  `lucide-angular` (already a dependency) — no new shared primitives.
- `app.routes.ts` — wired the shell as the parent of the authenticated tree
  (`canMatch: [authGuard]`, same proven pattern as legacy), moved `admin/*`
  under it unchanged, dropped the now-redundant `rootRedirect` function in
  favor of a plain child redirect, added the `**` → `''` fallback. `/kit/*`
  is untouched and NOT nested under the shell — it keeps its own
  `KitLayoutComponent`.

Known limitations:
- Only the Admin section is visible today because only `/admin/devices` and
  `/admin/roles` exist as NX pages; this is by design per the TZ
  ("отсутствующие в NX pages маршруты показывать только если route реально
  существует").
- Header "quick section chips" are `hidden lg:flex` (desktop-only); on
  narrow viewports the sidebar (behind the hamburger) is the primary nav —
  no duplicate chrome.
- No notification bell / desktop-pairing button (legacy-only business
  features, out of scope for a pure shell).

## Closeout (после PASS)

- [x] archive + удалить `_active`
- closed_at: 2026-08-29T00:00:00+03:00
