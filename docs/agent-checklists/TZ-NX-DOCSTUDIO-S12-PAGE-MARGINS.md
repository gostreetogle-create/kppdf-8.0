# TZ-NX-DOCSTUDIO-S12-PAGE-MARGINS

Status: DONE

- Added revision-gated `pageMargins` persistence to StudioDocument schema and DTOs.
- Propagated margins into Studio render input and non-canvas document content CSS as millimetres.
- Existing zero-padding canvas mode remains unchanged for screen/PDF positional parity.
- Gates: backend typecheck and focused studio-document/output tests PASS (45 tests); `nx build kppdf-web` PASS.
