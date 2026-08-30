# TZ-NX-SHELL-operational-shell — done

> Archived: 2026-08-29. Checklist: `docs/agent-checklists/TZ-NX-SHELL-operational-shell.md`.

## Задача

Добавить в `frontend-nx/apps/kppdf-web` полноценный operational app shell
(header + collapsible sidebar + router outlet) по образцу старого
`frontend/src/app/layout/**`, не меняя legacy `frontend/**`.

## Источники (read-only reference)

- `frontend/src/app/layout/app-layout.component.ts` — `NAV_CATEGORIES`
  (labels/icons/order/paths), `matchActiveCategoryId`, back/forward gutter
  buttons, header composition.
- `frontend/src/app/layout/kit-layout.component.ts` — mobile sidebar
  toggle pattern (`isMobile` via `window.resize`), sticky header shape.
- `frontend/src/app/shared/navigation/app-history.store.ts` — back/forward
  design reference (stack index derived from Router events, actual
  navigation delegated to `Location.back()/forward()`); reimplemented
  fresh (not copied) as a smaller app-level service, per scope ("не
  копировать старые domain services в layout").
- `frontend/src/app/app.routes.ts` — full legacy route table (source of
  truth for nav item labels/paths/pageKeys/systemRoles/capabilities).

## Новые NX-файлы

- `frontend-nx/apps/kppdf-web/src/app/layout/nav-categories.ts`
- `frontend-nx/apps/kppdf-web/src/app/layout/nav-categories.spec.ts`
- `frontend-nx/apps/kppdf-web/src/app/layout/route-paths.ts`
- `frontend-nx/apps/kppdf-web/src/app/layout/route-paths.spec.ts`
- `frontend-nx/apps/kppdf-web/src/app/layout/nav-history.service.ts`
- `frontend-nx/apps/kppdf-web/src/app/layout/nav-history.service.spec.ts`
- `frontend-nx/apps/kppdf-web/src/app/layout/app-shell.component.ts`
- `frontend-nx/apps/kppdf-web/src/app/layout/app-shell.component.spec.ts`

## Изменённые файлы

- `frontend-nx/apps/kppdf-web/src/app/app.routes.ts` — shell wired as the
  parent of the authenticated route tree; `admin/*` moved under it
  unchanged; removed the now-redundant `rootRedirect` `CanActivateFn`
  (authGuard on the shell's `canMatch` + a plain child redirect cover the
  same two cases); added `{ path: '**', redirectTo: '' }` fallback
  (legacy parity). `/kit/*` route block untouched, not nested under shell.

## Route / menu matrix

| Category (legacy order) | Label | Icon | Items ported | Items rendered today | Why |
|---|---|---|---|---|---|
| catalog | Каталог | Package | 4 | 0 | none of `/products`, `/modules`, `/materials`, `/catalog/appearance` exist in NX yet |
| clients | Клиенты | Users | 2 | 0 | `/counterparties`, `/people` not in NX yet |
| deals | Сделки | Briefcase | 3 | 0 | `/proposals/create`, `/contracts`, `/orders` not in NX yet |
| design | Проектирование | PenLine | 2 | 0 | `/design/combine`, `/design` not in NX yet |
| supply | Снабжение | ShoppingCart | 1 | 0 | `/supply` not in NX yet |
| production | Производство | Factory | 2 | 0 | `/production`, `/work-types` not in NX yet |
| warehouse | Склад | Warehouse | 5 | 0 | inventory/storage/movements/warehouses/shipping not in NX yet |
| docs | Документы | FileText | 7 | 0 | doc-constructor pages not in NX yet |
| reference | Справочники | BookOpen | 7 | 0 | dictionaries/categories pages not in NX yet |
| admin | Администрирование | ShieldCheck | 3 (`/admin/devices`, `/admin/roles`, `/organizations`) | **2** (`/admin/devices`, `/admin/roles`) | only these two exist as real NX pages; `/organizations` filtered out (no route yet) |

Filtering is dynamic (`collectPageRoutePaths(router.config)` +
`filterNavCategories`), not a hardcoded "admin-only" shell — as more pages
land in `frontend-nx/apps/kppdf-web/src/app/pages/**` with a matching
`path`, the corresponding nav item/category appears automatically with no
further layout changes, as long as the path matches an `AppNavItem.path`
already present in `nav-categories.ts`.

## Gates

- `pnpm exec nx build kppdf-web` → **PASS** (production build; two
  pre-existing bundle-budget warnings on `nx-welcome.ts` and
  `pi-showcase-card.component.ts`, unrelated to this change).
- `pnpm exec nx test kppdf-web --passWithNoTests` → **PASS** — 5 suites,
  29 tests (nav-categories, route-paths, nav-history.service,
  app-shell.component, plus the pre-existing app.spec.ts).
- `pnpm exec nx run-many -t lint --all` → **PASS** — 0 errors (warnings
  only: `@typescript-eslint/no-non-null-assertion` in spec files, same
  pre-existing pattern used across the rest of the NX workspace).
- `pnpm run architecture:check:nx` → **PASS** — 185 source files, 0
  violations.
- `pnpm run ui:tokens:nx` → **PASS** — 53 baseline occurrences (unchanged),
  no new raw hex/rgb colors introduced.

## Known limitations

- Only the Admin section is visible in the running app today — this is by
  design (menu items are ported ahead of pages, one wave at a time; TZ
  explicitly forbids showing links to routes that don't exist).
- Header quick-nav chips are desktop-only (`hidden lg:flex`); on narrow
  viewports the collapsible sidebar (behind the header hamburger) is the
  only nav surface — avoids duplicate chrome on small screens.
- No notification bell / desktop-pairing button — legacy business features
  out of scope for a pure app-shell TZ.
- Not committed/pushed — per `docs/GIT-POLICY.md`, awaiting explicit PO
  word before commit.
