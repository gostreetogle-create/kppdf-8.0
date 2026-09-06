# TZ-NX-DOCSTUDIO-S15-DATA-VITRINA-UNIFIED

Status: DONE

## Delivered
- Unified catalog vitrina into the Data rail with four category segments and search.
- Data rail uses the wide workspace panel.
- Catalog cards use `app-pi-showcase-card` with `size="md"`.
- Removed the standalone Showcase rail/component from the editor path.
- Catalog selection emits into the editor; the sole manual table is auto-bound to the matching catalog source.
- Successful dataset updates refresh live table rows and active preview state.
- Existing ERP anchor selectors remain in the unified panel.

## Gates
- `cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern=studio-data --runInBand` — PASS (54 suites, 294 passed, 7 skipped).
- `cd frontend-nx && pnpm exec nx build kppdf-web` — PASS.

## Notes
- Build retains pre-existing Angular CSS-budget warnings only.
- No backend change was required: `putDataSet` already returns the updated document and live resolver hydration is used by output rendering.
