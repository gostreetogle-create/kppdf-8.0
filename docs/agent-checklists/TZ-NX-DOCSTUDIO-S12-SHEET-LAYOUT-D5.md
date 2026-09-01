# TZ-NX-DOCSTUDIO-S12-SHEET-LAYOUT-D5

Status: DONE

- Added `sheetLayout` to StudioDocument and copied template default layout on create-from-template and duplicate.
- Multipage planner honors configured first/next page row capacities.
- Regression test verifies first-page capacity of five rows.
- Gates: studio multipage tests PASS (4 tests); backend typecheck PASS; `nx build kppdf-web` PASS.
