# TZ-NX-DOCSTUDIO-S17A-TABLE-TEMPLATE-COLUMN-LOCK

Status: DONE

## Result
- Column structure editor is available only for manual tables without a selected registry template.
- Applied template or non-manual source displays a read-only summary.
- Visibility toggles remain available.

## Verification
- `cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern=studio-table --runInBand` — PASS (54 suites, 295 passed, 7 skipped).
- `cd frontend-nx && pnpm exec nx build kppdf-web` — PASS.
