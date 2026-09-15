# TZ-NX-ORDER-WS-DOCS-CHIPS — DONE

- **Status:** DONE
- **Agent:** claude
- **Closed:** 2026-09-15
- **WAVE STOP — Order Workspace WAVE (6/6) COMPLETE.**

## Delivered

- New dumb `OrderWsDocumentsComponent`: deep-link to document templates (ported verbatim from `order-hub-tray.component.ts`), honest "no related documents" empty state (no filtered list API exists — verified before deciding not to fake one).
- New dumb `OrderWsWorkflowChipsComponent`: Главная/КП/Гант/Снабжение/Отгрузка + current Заказ, ported from `home.page.ts`'s `WORKFLOW_CHIPS`.
- No `setTools` wired — deliberate choice (no genuinely live, non-redundant rail action beyond the header's existing links).
- `docs/pages/orders.page.md`: rewritten final section (layout, hard "nots," one-paragraph operator scenario, wave-closing summary).

## Wave summary (all 6 TZs)

FACADE-SHELL → HEADER → COMPOSITION → EXECUTION → LOGISTICS → DOCS-CHIPS. `/orders/:id` went from a thin read-only card to a full editable workspace: confirm/cancel lifecycle, editable composition with live tree, supply/kit-reserve, production readiness, warehouse reservations, ship/cancel-shipment, document templates, workflow navigation — all built on existing backend endpoints and existing dialogs (`order-hub`, `order-create`, `home`), plus exactly two new thin `PiOrdersService` wrapper methods (`cancel()`, `setLineReady()`) for endpoints that already existed server-side.

## Gates

- `nx test kppdf-web`: PASS, `order-detail.page.spec.ts` 26/26 (24 prior + 2 new, first attempt). Same 2 unrelated pre-existing `app-shell.component.spec.ts` failures as every TZ this session.
- `nx test data-access` / `nx test features`: PASS.
- `nx lint`: baseline FAIL (pre-existing); zero new issues across the whole wave.
- Final `nx build kppdf-web`: PASS.

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
