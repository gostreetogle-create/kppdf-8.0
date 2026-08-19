═══════════════════════════════════════════════════════════════
TZ-DESK-407: стол — view=gantt/combine (fallback stub)
═══════════════════════════════════════════════════════════════

PAGES: /desk
PAGE_DOCS: manager-desk.page.md

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-18
closed_by: Buffy/codebuff-freebuff

result:
- `?view=desk|gantt|combine` query → `view` signal (safe-guarded via `isDeskView`); reconcile keeps unknown values at `desk`.
- Non-desk views render an honest stub: crumbs (`desk/` + view label, `data-test="desk-view-crumb"`), section `data-test="desk-<view>-view"`, and a studio-link «Открыть „…“» → `/production` (gantt) or `/design/combine` (combine) with `orderId` + `from=desk`. Embed deferred per TZ fallback path.
- Workflow chips: `desk` and `combine` route to `/desk` with `view` query; `gantt` chip keeps `view=gantt` and gains `orderId` when an order is expanded. Rail tools «На Ганте»/«В комбайне» become `viewTool(...)` → `openView` (in-page switch + query nav; `view=desk` clears the param via `null`).

verification:
  - acceptance criteria: PASS
  - typecheck: PASS (`pnpm exec tsc -p tsconfig.app.json --noEmit`, exit 0)
  - tests: PASS (manager-desk suite green, 26/26 in desk/orders scope; 3 new 407 tests)
  - lint: PASS (eslint desk + changed orders files, 0 errors)
  - checklist: DONE
  - deploy/wipe: not run (VPN off)

commit: pending
