# TZ-NX-DOCSTUDIO-S12-TABLE-TOTALS

Status: DONE

- Added escaped `<tfoot>` totals for columns typed `sum` or keyed `sum`/`total`.
- Disabled data-set rows are excluded from totals.
- Regression coverage verifies numeric sum and disabled-row handling.
- Gates: resolver tests PASS (9 tests); backend typecheck PASS; `nx build kppdf-web` PASS.
