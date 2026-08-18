# TZ-DESK-410 checklist

| Field | Value |
|-------|-------|
| Status | DONE |
| TZ | `tasks/TZ-DESK-410.md` |
| Depends | 402 DONE |

## Claim slot

- agent_id: buffy
- claimed_at: 2026-08-18T22:27:00+0300
- workspace: D:\kppdf-8.0

## Acceptance

- [x] Search/filter/sort on desk queue; default active orders
- [x] focused tsc + specs PASS

## Executor report (auto)

- Toolbar debounced search (`desk-search-input`) reuses `createSearchState`; matches number/client/address/notes.
- L flyout `filter`: status multi-select + presets «Активные» (default) / «Все» + «Обновить» (re-fetch GET /orders).
- L flyout `summary`: read-only status histogram over the search-filtered set (no status filter applied).
- Sort = date/created/updated desc; «ещё N» slice pagination (limit 20, +20).
- `?status=` persists (comma-separated, `all` token; absent/empty = «Активные»).
- typecheck PASS · jest 29/29 (manager-desk 12/12) · eslint 0 errors.
