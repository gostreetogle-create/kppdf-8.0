# TZ-NX-B0-1-ui-public-api checklist

> Status: **DONE**
> Marker: archived as `tasks/_archive/2026-08/TZ-NX-B0-1-ui-public-api.done.md`

## Claim slot
- agent_id: freebuff-b0-1
- claimed_at: 2026-08-29T13:35:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: N/A

## Acceptance
- [x] PiThemeEditor: standalone:true + @kppdf/ui/* imports.
- [x] Secondary entries: drawer, sheet, tabs, breadcrumb, tooltip, popover, hover-card.
- [x] tsconfig.base.json paths for all seven entries.
- [x] Root barrel slimmed (no table/row-actions re-exports).
- [x] PiRichTextEditor / PiNotificationCenterService remain non-public.
- [x] All gates PASS.

## Integrity slot
- [x] Тип изменения: frontend-nx UI public API only.
- [x] FIC: N/A — no runtime behavior change.
- [x] page.md / PAGE-TZ-INDEX: N/A.
- [x] SECTION-READINESS: N/A.
- [x] Чужой WIP не в коммите; conflict keys: paper-and-ink, tsconfig.base.json.
- [x] Coupling map: N/A.
- [x] Канон: docs/DOCS-INTEGRITY.md.

## Gates
- `nx build paper-and-ink`: PASS.
- `nx test paper-and-ink`: PASS (31 suites, 332 tests).
- `nx run-many -t lint --all`: PASS (0 errors).
- `pnpm run architecture:check:nx`: PASS, 0 violations.
- `pnpm run ui:tokens:nx`: PASS, 53 baseline.

## Executor report
- Added seven secondary entry barrels + tsconfig paths for drawer/sheet/tabs/breadcrumb/tooltip/popover/hover-card.
- PiThemeEditor now standalone with public `@kppdf/ui/*` imports; eslint override for intra-lib boundary rule.
- Root god-barrel slimmed to scaffold-only export.
- **Outcome: PASS.**

## Closeout
- [x] Archive created.
- [x] Active marker removed.
- closed_at: 2026-08-29T13:42:00+03:00
