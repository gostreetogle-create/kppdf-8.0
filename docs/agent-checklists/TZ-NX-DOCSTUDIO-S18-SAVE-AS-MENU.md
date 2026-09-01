# TZ-NX-DOCSTUDIO-S18-SAVE-AS-MENU

Status: DONE

## Result
- Added explicit Save and Save as… actions to the ribbon.
- Save remains a lightweight confirmation because autosave is already active.
- Save-as-template dialog now uses structural-only semantics and no longer exposes keepDataBindings.

## Verification
- `cd frontend-nx && pnpm exec nx build kppdf-web` — PASS.
