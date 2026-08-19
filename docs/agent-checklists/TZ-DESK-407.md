# TZ-DESK-407 checklist

| Field | Value |
|-------|-------|
| Status | DONE |
| TZ | `tasks/TZ-DESK-407.md` |
| Depends | 403 DONE |

## Claim slot

- agent_id: buffy
- claimed_at: 2026-08-18T22:45:00+0300
- workspace: D:\kppdf-8.0

## Acceptance

- [x] `?view=gantt|combine` embed or stub per TZ; crumbs updated
- [x] focused tsc + specs PASS

## Executor report (auto)

- Implemented honest fallback: `?view=desk|gantt|combine` query drives a `view` signal; non-desk views render a stub section (crumbs + studio-link) since embed is deferred. Workflow chips `desk`/`combine` now route to `/desk` with `view` query; `gantt` chip also gets `orderId`. Rail tools «На Ганте»/«В комбайне» call `openView` (view switch + query nav, `view=desk` clears from URL). Studio-link stub: «Открыть „Гант“/„Комбайн“» → `STUDIO_ROUTES` (`/production`, `/design/combine`) with `orderId` + `from=desk`.
- Spec: 3 new tests (gantt view+crumbs, combine view, openView back to desk). Gates PASS.
