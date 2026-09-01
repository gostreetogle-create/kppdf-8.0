# TZ-NX-DOCSTUDIO-S12-PAGE-BACKGROUND

Status: DONE

- Added background selection and opacity controls to the document-studio page rail.
- Persisted `defaultBackgroundIndex` and `backgroundOpacity` through the revision-gated document PATCH.
- Existing background arrays and passport image layers remain unchanged.
- Gates: backend build typecheck PASS; `nx build kppdf-web` PASS.
