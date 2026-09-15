# TZ-NX-SHIPPING-TO-FEATURES

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-15
closed_by: claude
verification:
  - acceptance criteria: PASS (specs green, tsc, build)
  - typecheck: PASS (kppdf-web app + features lib, both clean on first run)
  - architecture check: PASS (1540 files; baseline 17; 2 resolved since baseline)
  - tests: PASS (features 42/42 suites 377/377; kppdf-web full suite 89/89 suites, 615/622 passed, 7 skipped, 0 failed)
  - nx build kppdf-web: PASS (last gate, exit 0, bundle unchanged 503.38 kB; confirmed lazy-only route)
  - checklist: docs/agent-checklists/TZ-NX-SHIPPING-TO-FEATURES.md
  - commit: 99ffadc0
  - status synchronization: PASS (tracker updated)

## Root cause

The TZ asked to move `ShippingFacade` (+ its dialogs, if no illegal app
dependency) into `@kppdf/features/shipping`. Its spec text was lost from
disk before being read (session-resume environment issue — see the
checklist's disclosure); proceeded from `WAVE-MAP.md`'s goal line.

## Fix

Checked every relative import first. All 3 shipment dialogs
(create/edit/doc) had zero relative imports — fully self-contained.
Moved the facade + all 3 dialogs in full; duplicated the facade's one
dependency, `on-dialog-close-once.ts` (19 LOC pure). `shipping.page.ts`
stays in the app as the lazy route host.

## Files changed

- `shipping.facade.ts` → `libs/features/src/lib/shipping/shipping.facade.ts`
- 3 dialogs (+specs) → `libs/features/src/lib/shipping/ui/`
- New: `ui/on-dialog-close-once.ts`, `index.ts`, `ui/index.ts`
- `frontend-nx/tsconfig.base.json` (new `@kppdf/features/shipping` path)
- `shipping.page.ts` — import path
- `docs/agent-checklists/TZ-NX-SHIPPING-TO-FEATURES.md` (new)

## Successor

`TZ-NX-DOCSTUDIO-EDITOR-UI-SPLIT` (P5) — canvas/table-properties split,
Studio Phase 5, now authorized per WAVE-MAP.md. Last TZ in the B5 chain —
STOP after this one per the wave prompt.
