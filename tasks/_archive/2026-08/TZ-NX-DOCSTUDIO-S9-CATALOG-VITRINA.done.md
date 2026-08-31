# TZ-NX-DOCSTUDIO-S9-CATALOG-VITRINA

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-01
closed_by: Claude

## Outcome
- Added the `Витрина` rail section with four tabs: Изделия, Модули, Детали, Материалы.
- Wired real catalog list APIs and material-kind separation.
- Added multi-selection persistence into `context.catalogSelections`.
- Extended table source options with catalog source types.

## Verification
- `cd backend && pnpm test -- studio-data-resolver --runInBand`: PASS, 7 tests, exit 0.
- `cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern=studio`: PASS, exit 0.
- `cd frontend-nx && pnpm exec nx build kppdf-web`: PASS, exit 0, final gate.
- Known limitation: resolver-side catalog row hydration and automatic data-set row sync are not implemented in this slice; selections and source bindings are persisted for the existing resolver contract.
