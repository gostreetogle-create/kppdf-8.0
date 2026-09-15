# TZ-NX-ORDER-WS-EXECUTION — DONE

- **Status:** DONE
- **Agent:** claude
- **Closed:** 2026-09-15

## Delivered

- New dumb `OrderWsExecutionComponent`: Снабжение (live counters, honest empty/error, «Подтвердить материалы» reusing `KitReserveConfirmDialogComponent`, deficit short-list from already-loaded data) + Производство (plannedDate, готовность X/Y, deep-link).
- `OrderWorkspaceFacade` extended: `supplyLoading`/`supplyError`/`supplyCounters`/`pendingSupplyRequests` signals, `loadSupply()` (public, called from `load()`), `openKitReserveConfirm()`, `readyLineCount()`/`totalLineCount()`.
- `docs/pages/orders.page.md`: TZ4-landed note.

## Scope guard

- No mini boardLane kanban / % bars, no Excel supply OPS, no fake audit.
- Deficit derivation adds zero extra HTTP calls (no per-line `getKitAvailability` fan-out).
- Deep-links verified against real query-param handling in `supply.facade.ts`/`production-cockpit.facade.ts` before wiring.

## Gates

- `nx test kppdf-web`: PASS, `order-detail.page.spec.ts` 20/20 (16 prior + 4 new). Same 2 unrelated pre-existing `app-shell.component.spec.ts` failures as every TZ this session.
- `nx test data-access` / `nx test features`: PASS.
- `nx lint`: baseline FAIL (pre-existing); zero new issues (proactive relative import for the reused dialog).
- Final `nx build kppdf-web`: PASS.

Successor: `TZ-NX-ORDER-WS-LOGISTICS`.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-15
closed_by: claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS
  - lint: BASELINE FAIL (pre-existing)
  - checklist: ADDED
  - progress.md: N/A (feature build, reuses existing backend endpoints)
  - status synchronization: PASS
