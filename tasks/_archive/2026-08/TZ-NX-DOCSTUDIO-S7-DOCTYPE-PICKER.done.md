# TZ-NX-DOCSTUDIO-S7-DOCTYPE-PICKER - DONE

**agent_id:** freebuff-s7-doctype  
**completed_at:** 2026-08-30T22:05:00+03:00

## Outcome

- `@kppdf/data-access`: `PiDocTypesService` GET `/doc-types`, `DocType` type; `UpdateStudioDocumentPayload.docTypeId`.
- `pi-studio-template-panel`: doc type select (`data-test="studio-template-doc-type"`), save CTA disabled until `docTypeId` set.
- `studio-editor.page.ts`: loads doc types, `onDocTypeChange` PATCH with `expectedRevision`; wires panel inputs/outputs.

## Save-as-template

**Unblocked** once operator selects a document type (persisted via PATCH; backend still requires `docTypeId` on document).

## Gates (exit 0)

- `pnpm exec tsc -p libs/data-access/tsconfig.lib.json --noEmit`
- `pnpm exec nx run kppdf-web:test --testPathPattern=studio`
- `pnpm exec nx run kppdf-web:build`

## Files

- frontend-nx/libs/data-access/src/lib/doc-studio/doc-type.types.ts
- frontend-nx/libs/data-access/src/lib/doc-studio/pi-doc-types.service.ts
- frontend-nx/libs/data-access/src/lib/doc-studio/index.ts
- frontend-nx/libs/data-access/src/lib/doc-studio/studio-document.types.ts
- frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-template-panel.component.ts
- frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-template-panel.component.spec.ts
- frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts
