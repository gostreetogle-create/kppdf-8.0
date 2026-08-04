# TZ-ACCESS-304 checklist

> Status: **DONE** · archived 2026-08-04

## Acceptance

- [x] Every `NAV_CATEGORIES` item has `pageKey` (typed `AppNavItem`)
- [x] `navCategories` filters by `user.pages` + capabilities
- [x] Kit/public routes unchanged
- [x] Executor report + archive

## Executor report (auto) — TZ-ACCESS-304

gates: fe-tsc=PASS; type AppNavItem requires pageKey
archive: tasks/_archive/2026-08/TZ-ACCESS-304.done.md
lock: .mimocode/locks/TZ-ACCESS-304-nav-pagekey-filter.lock
note: filter logic pre-existed (ACCESS-302); this TZ = completion AC
