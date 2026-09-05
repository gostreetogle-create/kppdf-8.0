# TZ-NX-DOCSTUDIO-D55-LINKS-COPY-CLEAR

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-05
closed_by: freebuff

## Outcome

The Doc Studio Data panel now uses the compact Russian quotation label `КП`, starts every clearable entity select with an explicit empty option, and no longer renders a duplicate inner `Данные` heading. Existing `valueChange` handlers receive the empty string, so no second write path was introduced. D56 selected-rail work was not started in this TZ.

## Acceptance

- AC1: Quotation label and aria label are `КП`; the panel contains no `Коммерческое предложение` text — PASS.
- AC2: КП, Заказ, Клиент, раскрытый Плательщик, and Поставщик begin with a clear option; selecting it emits `''` through existing handlers — PASS.
- AC3: Inner `.heading` is removed; shell remains the sole panel title — PASS.
- AC4: Focused tests and build gates — PASS.

## Verification

- Baseline `cd frontend-nx && pnpm exec nx build kppdf-web`: PASS, exit 0.
- Focused command `pnpm exec nx test kppdf-web --testPathPattern=studio-data-panel.component.spec.ts --runInBand`: PASS, exit 0 (79 suites / 511 passed / 7 skipped due Nx project filter behavior).
- Typecheck `pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit`: PASS, exit 0.
- Changed-file ESLint: PASS, exit 0.
- `git diff --check`: PASS, exit 0.
- Final `cd frontend-nx && pnpm exec nx build kppdf-web`: PASS, exit 0; last D55 gate.
- Known warnings: pre-existing studio canvas NG8102 and Gantt style-budget warning.

## Integrity

- Type: page/UI behavior.
- FIC §A–E: N/A — existing route, permissions, module, and no MCP change.
- `docs/pages/document-studio.page.md`: updated with D55 wording and clear-option contract.
- PAGE-TZ-INDEX and SECTION-READINESS: N/A — existing route and user contour unchanged.
- Coupling map: N/A — no shared status/filter/FK semantics changed.
- Foreign WIP and D56 keys were excluded.

## Executor report (auto)

- D55 complete; only the Data panel, its focused spec, page contract, checklist, archive, and lock are owned here.
- No backend, `putDataSet`, Properties, right rail, legacy `frontend/`, or D56 selected rail files changed.
- Empty-option edge and KP auto-link limitation remain governed by the existing handler/effect contract.
- A4 geometry is unchanged; no reflow or new overlay introduced.
- Commit SHA: `771caf3f`.
