# TZ-NX-ORDER-WS-HEADER — DONE

- **Status:** DONE
- **Agent:** claude
- **Closed:** 2026-09-15

## Delivered

- New dumb `OrderWsHeaderComponent` (`libs/features/src/lib/order-workspace/ui/`): status banner, Заказчик (link)/Объект/Наша фирма/дата grid, КП, isPaid checkbox, «← К списку»/«На Главную».
- Two new live lifecycle CTAs, both behind `AlertDialogComponent` confirm:
  - **Подтвердить заказ** (`draft` only) → `PATCH { status: 'confirmed' }` (existing PATCH graph).
  - **Отменить заказ** (hidden once cancelled/shipped/delivered) → new `PiOrdersService.cancel()` wrapping existing `POST /orders/:id/cancel`.
- `OrderWorkspaceFacade` extended: `organizationName` (live via `PiOrganizationsService.getById`), `confirming`/`cancelling`, `canConfirm()`/`canCancel()`, `confirmOrder()`/`cancelOrder()`, `fmtDate()`.
- `docs/pages/orders.page.md`: TZ2-landed note.

## Scope guard

- No status/transition rule changes — both new writes reuse existing, already-tested backend endpoints (verified by reading `order.controller.ts`/`order.service.ts` before wiring).
- `PiOrdersService.cancel()` addition is additive-only (new method, zero existing signature changes).
- No free lifecycle-status dropdown, no composition/lines work (that's TZ3).

## Gates

- `nx test kppdf-web`: PASS, `order-detail.page.spec.ts` — 8 original assertions unmodified + 2 new tests (confirm flow, cancel flow) — all pass. Same 2 unrelated pre-existing `app-shell.component.spec.ts` failures as every TZ this session.
- `nx test data-access`: PASS, 25/25 suites, 134/134 tests.
- `nx test features`: PASS, 52/52 suites, 455/455 tests.
- `nx lint kppdf-web` + `nx lint features`: baseline FAIL (pre-existing); zero new issues.
- Final `nx build kppdf-web`: PASS.

Successor: `TZ-NX-ORDER-WS-COMPOSITION`.

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
  - progress.md: N/A (refactor + additive live write-paths)
  - status synchronization: PASS
