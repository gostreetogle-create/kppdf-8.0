# TZ-UX-371 — Orders list redesign

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-17T18:50:09+03:00
closed_by: freebuff-gpt-5.6-luna

## Result

- Expanded order row is now a flat Paper & Ink surface using `bg-paper-2`, semantic `hairline` borders, `.eyebrow` section headers, a gold left accent, and wider section spacing.
- Hardcoded `border-ink/10`, `border-ink/5`, `bg-paper-raised/85`, and sunrise-soft expanded-row styling were removed from the redesigned order summary.
- `PiTable` renders a read-only RU `▸/▾` disclosure button for tables that provide `expandedRow`; the existing row-click callback remains the only expansion path.
- Expanded control is gold (`bg-gold`) while open and exposes `aria-expanded` plus RU labels.
- No business logic, API calls, data models, order status, or write paths changed.

## Verification

- acceptance criteria: PASS
- typecheck: `frontend pnpm exec tsc -p tsconfig.app.json --noEmit` PASS
- focused tests: OrdersPage + PiTable, 2 suites / 44 tests PASS
- build: `frontend pnpm run build` PASS; existing Angular budget warnings only
- lint: owned files PASS, 0 errors; one pre-existing OnInit architecture warning
- review diff: PASS
- progress.md: UPDATED
- status synchronization: PASS
- deploy: NO

## Files

- `frontend/src/app/pages/orders/orders.page.ts`
- `frontend/src/app/pages/orders/orders.page.spec.ts`
- `frontend/src/app/shared/ui/pi-table.component.ts`
- `docs/agent-checklists/TZ-UX-371.md`
- `progress.md`
