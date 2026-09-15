# TZ-NX-ORDER-WS-COMPOSITION — DONE

- **Status:** DONE
- **Agent:** claude
- **Closed:** 2026-09-15

## Delivered

- New dumb `OrderWsCompositionComponent`: editable line list (qty, ready toggle, delete-with-confirm), lazy per-line composition tree (cached after first expand), dual CTA (focus inline controls / catalog deep-link), «+ Добавить позицию» select picker.
- `OrderWorkspaceFacade` extended: `addLine`/`updateQty`/`removeLine`/`toggleReady`/`toggleLineTree`, `canEditComposition()`, `toItemPayload()` (field-preservation fix for backend's index-based `mapItems`).
- New `PiOrdersService.setLineReady()` wrapping the existing dedicated `PATCH .../items/:lineIndex/ready` endpoint.
- `docs/pages/orders.page.md`: TZ3-landed note.

## Scope guard

- Honest freeze: items writable only `draft`/`confirmed` (matches backend `PLAN_EDITABLE_FROZEN`/`HARD_FROZEN` exactly, not a naive approximation).
- No unitPrice/total columns; no inline catalog-BOM editing (pencil = deep-link only, unchanged elsewhere).
- Line delete trailing-only, enforced server-side, not duplicated client-side.

## Gates

- `nx test kppdf-web`: PASS, `order-detail.page.spec.ts` 16/16 (8 original + 2 TZ2 + 6 new, all passed on first implementation attempt). Same 2 unrelated pre-existing `app-shell.component.spec.ts` failures as every TZ this session.
- `nx test data-access`: PASS, 134/134. `nx test features`: PASS, 455/455.
- `nx lint`: baseline FAIL (pre-existing); 2 real new issues found and fixed (intra-project import boundary, non-null-assertion warnings) — zero new issues remain.
- Final `nx build kppdf-web`: PASS.

Successor: `TZ-NX-ORDER-WS-EXECUTION`.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-15
closed_by: claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS
  - lint: BASELINE FAIL (pre-existing, zero new issues)
  - checklist: ADDED
  - progress.md: N/A (feature build, reuses existing backend endpoints)
  - status synchronization: PASS
