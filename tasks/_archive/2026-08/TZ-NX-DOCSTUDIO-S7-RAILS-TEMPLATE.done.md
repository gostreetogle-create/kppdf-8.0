# TZ-NX-DOCSTUDIO-S7-RAILS-TEMPLATE — DONE

**agent_id:** freebuff-s7-rails-template  
**completed_at:** 2026-08-30T21:45:00+03:00

## Outcome

- Rail **Шаблон** (LayoutTemplate) in `STUDIO_RAIL_ITEMS` / `StudioWorkspaceSection` + shell tool rail after «Данные».
- `pi-studio-template-panel`: CTA «Сохранить как шаблон» → shared `openSaveAsTemplateDialog()`.
- Ribbon «Шаблон» uses same dialog flow; removed `window.prompt` from `studio-editor.page.ts`.
- Reused `StudioSaveAsTemplateDialogComponent` (name + keepDataBindings). Backend `SaveAsTemplateDto` has no docTypeId — guard uses `StudioDocument.docTypeId` on document + toast.
- `@kppdf/data-access`: optional `docTypeId` on `StudioDocument`.

## Gates (exit 0)

- `pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit`
- `pnpm exec nx test kppdf-web --testPathPattern=studio`
- `pnpm exec nx build kppdf-web`

## Files

- frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-workspace-chrome.ts
- frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-template-panel.component.ts
- frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-template-panel.component.spec.ts
- frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts
- frontend-nx/libs/data-access/src/lib/doc-studio/studio-document.types.ts
- docs/pages/document-studio.page.md

## S7-3 blockers (not this TZ)

- No NX UI to assign/patch `docTypeId` on studio document (save-as-template blocked until type set elsewhere).
- Text/table tier-L rails, deep-link quotation prefill, legacy parity items in `TZ-NX-DOCSTUDIO-S7-TEXT-LEGACY-PARITY`.
