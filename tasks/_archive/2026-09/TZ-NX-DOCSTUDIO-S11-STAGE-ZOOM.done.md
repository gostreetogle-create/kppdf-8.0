# TZ-NX-DOCSTUDIO-S11-STAGE-ZOOM — DONE

Implemented Fit/100% controls in the workspace toolbar.

- Fit and 100% are enabled and expose `data-test` hooks.
- Active zoom mode is reflected on the toolbar.
- Fit uses the observed sheet host dimensions; 100% uses logical A4 dimensions (794×1123).
- Panel layout and background layers remain unchanged.

Validation:
- `pnpm exec nx build kppdf-web` — PASS.
- Existing Angular style-budget and nullish-coalescing warnings remain non-blocking.
