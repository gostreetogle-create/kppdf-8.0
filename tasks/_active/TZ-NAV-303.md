# TZ-NAV-303 — CLAIMED

- id: TZ-NAV-303-combine-to-design-home-stats
- claimed_at: 2026-08-16T13:20:00+03:00
- workspace: D:\kppdf-8.0
- status: READY FOR REVIEW (awaiting Cursor PASS; no archive)
- checklist: docs/agent-checklists/TZ-NAV-303.md
- keys: frontend/src/app/layout/app-layout.component.ts(.spec.ts), app-layout.nav-order.spec.ts, app.routes.ts, deals-group-chips.ts(.spec.ts), design-group-chips.ts, dashboard.page.ts (crumbs), docs/pages/{dashboard,design,design-combine,page-chrome,PAGE-TZ-INDEX}.md
- Не трогать: inventory label, kanban write-path SWEEP-401, CATALOG-375 / UX-344 / PHOTO frame, DASHBOARD-401, deploy

## BLOCKER / FINDING (from TZ-OPS-SITE-SMOKE-401)

- **S1:** `frontend/src/app/pages/dashboard/dashboard-stats.page.ts` — `statCards as const` → TS2339 on `card.destructive` (only `overdue` has it).
- **Fix before land (NAV-303 owns the file):** add `destructive?: boolean` or `destructive: false` on non-overdue cards.
- Do **not** leave this for SITE-SMOKE; AOT will fail until fixed.
