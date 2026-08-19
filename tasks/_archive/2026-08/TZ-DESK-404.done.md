═══════════════════════════════════════════════════════════════
TZ-DESK-404: На Ганте / В комбайне + возврат на стол
═══════════════════════════════════════════════════════════════

PAGES: /desk ; /production ; /design/combine
PAGE_DOCS: manager-desk.page.md ; production-cockpit.page.md ; design-combine.page.md

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-18
closed_by: Buffy/codebuff-freebuff

result:
- Desk rail tools «На Ганте» / «В комбайне» (only when an order is expanded) now deep-link into the real studios: `viewTool` (in-page stub switch) replaced by `studioTool` → `openStudio` → `Router.navigate(['/production' | '/design/combine'], { queryParams: { orderId, from: 'desk' } })`. Dead `openView`/`navigateView` removed. The `?view=` stub + crumbs from 407 stay for the workflow chips.
- Production cockpit: reactive `from=desk` + `orderId` query → visible RU bar «Вы перешли со стола» + button **«На стол»** (`data-test="desk-return"`) → `/desk?orderId=<id>` via RouterLink. Renders only when `from=desk`; normal cockpit untouched.
- Combine = shared `DashboardPage` (lazy same component) — return button there not cheap.
  known_limitation: назад браузера (зафиксировано в checklist/docs).

verification:
  - acceptance criteria: PASS
  - typecheck: PASS (`pnpm exec tsc -p tsconfig.app.json --noEmit`, exit 0)
  - tests: PASS (manager-desk + production-cockpit.page — 42/42 in focused scope; 3 new 404 tests)
  - lint: PASS (eslint changed files, 0 errors; 1 pre-existing OnInit warning in cockpit)
  - checklist: DONE
  - deploy/wipe: not run (VPN off)

commit: pending
