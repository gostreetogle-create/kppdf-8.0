# TZ-NX-SHIP-S3-HUB-SHIP: Hub «Отгружено» without document

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-08
closed_by: claude
implementation_sha: cfd5292c

## Verification

- acceptance criteria: PASS — operator ships whole order from hub without leaving `/orders`;
  no cancel button in hub; summary reloads after ship.
- typecheck: PASS — `tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` exit 0.
- tests: PASS — `nx test kppdf-web` 102 suites / 669 passed, 7 pre-existing skipped, 0 failed.
- nx build: PASS — exit 0, same 2 pre-existing baseline warnings as S0/S1/S2.
- checklist: `docs/agent-checklists/TZ-NX-SHIP-S3-HUB-SHIP.md` — filled.
- status synchronization: `WAVE-NX-SHIPPING.md` S0–S3 all DONE; `_NOW.md` Claude → IDLE.

## Delivered

- `pages/orders/ship-confirm-dialog.component.ts` (+spec) — recipient/address prefilled from
  order counterparty/site, optional note; mirrors legacy `ShipConfirmDialogComponent`
  (TZ-DESK-430).
- `order-hub-tray.component.ts`: `canMarkShipped()` gate + `openShipConfirm()` →
  `PiOrdersService.ship()` → reload via S2's `loadShipments()`; «Отгружено» button
  (`order-ship-button`) is the one deliberate hub-write exception this wave.
- Docs: `orders.page.md`, `shipping.page.md` Hub expand section.

## WAVE-NX-SHIPPING closeout

S0 (`d1e0a04b`) → S1 (`d027275c`) → S2 (`ae22acff`) → S3 (this commit) — all DONE.
S4 (hub cancel до dispatch) stays a separate prompt (`PROMPT-CLAUDE-NX-SHIP-S4-CANCEL.md`),
not part of this wave's scope per `WAVE-NX-SHIPPING.md`.

## Known limits / next

- No live-browser/Playwright pass across S0–S3 (continuous 4-TZ queue) — DOM-level Jest
  (TestBed + fixture) and successful AOT production builds are the verification evidence
  at each step.
