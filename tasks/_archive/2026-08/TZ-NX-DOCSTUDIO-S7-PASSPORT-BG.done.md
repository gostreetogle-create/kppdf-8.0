# TZ-NX-DOCSTUDIO-S7-PASSPORT-BG - DONE

**agent_id:** freebuff-s7-passport-bg
**claimed_at:** 2026-08-30T20:00:00Z
**completed_at:** 2026-08-30T22:02:00+03:00

## Outcome

- Image blocks with settings.overlay=true render in passport background layer (z-index 0, pointer-events none).
- setImageFullPage sets full sheet, overlay true, zIndex 0.
- Legacy builder-canvas canvas-passport-bg for doc-constructor studio parity.
- PDF/preview stacking via layout z-index (no backend change).

## Gates (exit 0)

- cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit -> 0
- cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern=studio -> 0
- cd frontend-nx && pnpm nx build kppdf-web -> 0

## Files

- frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-block-helpers.ts
- frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-block-helpers.spec.ts
- frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-blocks-canvas.component.ts
- frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts
- frontend/src/app/pages/doc-constructor/builder/builder-canvas.component.ts
- frontend/src/app/pages/doc-constructor/studio/document-studio-editor.facade.ts

## PARK (post-S7)

- TZ-NX-DOCSTUDIO-S7-DOCTYPE-PICKER (docTypeId picker on save-as-template)
