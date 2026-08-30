# TZ-NX-DOCSTUDIO-S7-TABLE-POLISH - DONE

**agent_id:** freebuff-s7-table-polish  
**completed_at:** 2026-08-30T22:00:00+03:00

## Outcome

- Studio table properties: column structure editor (add/remove/reorder, key, label, type, width, align) emits `tableTemplateColumns` + remapped `tableTemplateSampleRows` + pruned `tableHiddenColumnKeys` via existing `patchTableSettings`.
- Save as table template: opens `TableTemplateFormDialogComponent` with category picker (`TABLE_TEMPLATE_CATEGORIES`); prefills `category` from `block.settings.tableTemplateCategory` when set.
- Registry table-template dialog: stable `@for` track via per-row `clientId` on FormArray groups (avoids index reconcile TypeError on remove/reorder).

## Gates (exit 0)

- `pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` -> 0
- `pnpm exec nx run kppdf-web:test --testPathPattern=studio-table|table-template-form` -> 0
- `pnpm exec nx run kppdf-web:build` -> 0

## Files

- frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-table-properties.component.ts
- frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-table-defaults.ts
- frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-table-defaults.spec.ts
- frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts
- frontend-nx/apps/kppdf-web/src/app/doc-studio/dialogs/table-template-form-dialog.component.ts

## S7-5 blockers (RIBBON-EXPORT)

- Depends on stable preview/PDF API wiring on `studio-editor.page.ts` (conflict key with ribbon work).
- Live smoke needs auth + `/studio/:id` with draft document and unlocked table block for meaningful PDF bytes check.
- PARK remains: `TZ-NX-DOCSTUDIO-S7-DOCTYPE-PICKER` for docTypeId on save-as-template guard (from S7-2 notes).
