# TZ-NX-DOCSTUDIO-S7-TEXT-LEGACY-PARITY - DONE

**agent_id:** freebuff-s7-text-legacy  
**completed_at:** 2026-08-30T21:50:00+03:00

## Outcome

- pi-studio-text-properties: fontFamily select (Times New Roman, Arial, Calibri) via styleChange / patchBlockStyle.
- Optional compact lineHeight input (0.8-3.0).
- **Поле ERP** button opens StudioDataFieldPickerDialogComponent (ported from legacy); inserts {{token}} through PiRichText insertContent / SubstitutionToken.
- pi-studio-blocks-canvas: applies ontFamily + lineHeight on text block article.
- @kppdf/data-access: extended RegistryDataSource with optional ields for picker API.

## Gates (exit 0)

- pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit
- pnpm exec nx test kppdf-web --testPathPattern=studio
- pnpm exec nx build kppdf-web

## Files

- frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-text-properties.component.ts
- frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-blocks-canvas.component.ts
- frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-data-field-picker-dialog.component.ts
- frontend-nx/libs/data-access/src/lib/doc-studio/table-template.types.ts

## S7-4 blockers (not this TZ)

- Multi-column text layout remains out of scope (known_limitation).
- docTypeId picker still PARK (TZ-NX-DOCSTUDIO-S7-DOCTYPE-PICKER) — save-as-template guard unchanged.
- Table polish / column chrome deferred to TZ-NX-DOCSTUDIO-S7-TABLE-POLISH.
