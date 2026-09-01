# TZ-NX-DOCSTUDIO-S17-RIBBON-PAGES-PANEL

Status: DONE

## Result
- Ribbon reduced to document identity and actions; geometry controls removed.
- Added right-rail Pages panel with page list, navigation, add page, numbering, background, opacity, and orientation controls.
- Existing page update handlers remain revision-gated.

## Verification
- `cd frontend-nx && pnpm exec nx build kppdf-web` — PASS.
