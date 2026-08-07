═══════════════════════════════════════════════════════════════
TZ-PRODUCTION-303.1b: Land Gantt hotfix + merge deep-link to main — DONE
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-07
closed_by: Buffy / agent-3e757640b7
workspace: D:\\kppdf-8.0
branch: main
base_at_claim: 12672678fcd5866bd942902edae3b92cc40f7906

## Delivered

- Gantt hotfix is present on main from `cde23a5`: rail↔bars filter synchronization, confirmed WorkType.days update with rollback, order/product/status context on bars, legend/palette, toolbar actions, and production write UX gate.
- Orders deep-link is present on main from `c622db5`: inspector link `/orders?q=<number>` and OrdersPage consumption through the existing search state, including clearing when `q` is removed.
- Catalog polish from the base (`cde23a5`, including `products/**`) was preserved; 303.1b made no products changes.
- The duplicate compact inspector link was removed during final landing cleanup; the existing full «Открыть в списке заказов» link remains the single producer-side link.

## Verification

- Frontend TypeScript: PASS — `pnpm exec tsc -p tsconfig.app.json --noEmit`
- Targeted Jest: PASS — 4 suites / 23 tests (`gantt-bars`, `orders-rail`, `gantt-bar.model`, `orders.page`)
- Scoped ESLint: PASS — touched production/orders TypeScript and specs, without `--fix`
- Angular development build: PASS, with pre-existing `NG8113` warning for unused `ButtonComponent` in `DocumentsPage`
- `git diff --check`: PASS
- `verify-status.sh`: PASS before closeout synchronization
- Deploy: NOT PERFORMED

## Known limitations

- No dedicated producer-side `OrderInspectorComponent` unit spec exists; the template contract is verified by source review and the OrdersPage consumer is covered by regression tests. A dedicated component spec is a follow-up when its test path is within scope.
- No production page integration test directly asserts that the same filtered collection feeds both rail and bars; isolated model/rail/bars tests pass. This remains a follow-up hardening item.
- Browser/PO smoke remains to be run from `docs/pages/production-cockpit.page.md`.
- No drag/resize/reschedule or PRODUCTION-304…310 work was performed.

## Commits

- `cde23a5` — preserved base Gantt hotfix and catalog polish
- `c622db5` — landed 303.1 deep-link implementation
- `c6e2a29` — prior closeout evidence on main
- landing closeout commit: recorded in checklist after commit

checklist: `docs/agent-checklists/TZ-PRODUCTION-303.1b-land-hotfix-main.md`
lock: `.mimocode/locks/TZ-PRODUCTION-303.1b-land-hotfix-main.lock`
