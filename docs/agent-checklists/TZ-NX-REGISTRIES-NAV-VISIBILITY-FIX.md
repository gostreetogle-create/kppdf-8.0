# TZ-NX-REGISTRIES-NAV-VISIBILITY-FIX checklist

> Status: **DONE**
> Marker: archived as `tasks/_archive/2026-08/TZ-NX-REGISTRIES-NAV-VISIBILITY-FIX.done.md`

## Claim slot

- agent_id: cursor
- claimed_at: 2026-08-29T20:10:00+03:00

## Preflight

- [x] Read archived TZ docs, inspected nav-categories/app-shell/route-paths/app.routes
- [x] Root cause: `pages[]` ACL hides registries despite existing route

## Acceptance

- [x] `skipPageAcl` on registries item — visible when route exists, regardless of restrictive `pages[]`
- [x] No fake backend permission
- [x] Dead-link filter preserved for other routes
- [x] Active state on `/registries` and `/registries/:key`
- [x] Tests: restrictive pages[], route absent, other routes filtered, click navigation, active state
- [x] Gates PASS

## Gates

- [x] build, test (90/90), lint, architecture:check:nx, ui:tokens:nx — all PASS

## Executor report

**Fix:** `AppNavItem.skipPageAcl` + `skipPageAcl: true` on `/registries` item; `filterNavCategories` skips page ACL check when flag set.

**Tests:** 3 new nav-categories cases, 3 new app-shell cases, 1 RouterTestingHarness click integration spec.

**Outcome: PASS.**

## Closeout

- [x] archive done
- [x] active claim deleted
- closed_at: 2026-08-29T20:15:00+03:00
