# TZ-UX-341 DONE — catalog grid pager → app-pi-pagination

```
ARCHIVE_MARKER
task_id: TZ-UX-341
outcome: DONE
closed_at: 2026-08-16T09:50:00Z
agent_id: cursor-composer (TZ-UX-341 frontend executor)
workspace: D:\kppdf-8.0
branch: main
```

## Что сделано

- Products / modules / materials: custom `grid-pager` (Назад/Далее) → `<app-pi-pagination>` (канон UX-340).
- Products `PAGE_SIZE` 15 → `PI_DEFAULT_PAGE_SIZE` (10); server `limit` follows `pageSizeSig`.
- `pageSizeChange` on grid + pi-table → update size + reset page 1 (all three pages).
- Modules grid now slices via `paginatedRows()` (was showing full `data()`).
- Specs: products + modules + materials-373 pager tests; page.md + PAGE-TZ-INDEX.

## Gates

- `pnpm exec tsc -p tsconfig.app.json --noEmit` PASS
- `pnpm test -- --testPathPattern="products.page.spec|modules.page.spec|materials.page" --coverage=false` PASS (69 tests)

## Не трогали

- Chrome filters-rail, backend, UX-342 pages, app-layout. Deploy нет.

## Review

REVIEW not required in TZ → archive after gates PASS.
