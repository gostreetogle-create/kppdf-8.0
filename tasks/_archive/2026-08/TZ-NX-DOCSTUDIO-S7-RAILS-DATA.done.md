# TZ-NX-DOCSTUDIO-S7-RAILS-DATA — DONE

**agent_id:** freebuff-s7-rails-data / cursor executor closeout  
**completed_at:** 2026-08-30T21:40:00+03:00

## Outcome

- Rail **Данные** (Database icon) in shell tool rail + STUDIO_RAIL_ITEMS / StudioWorkspaceSection.
- pi-studio-data-panel: issuer org read-only, counterparty / КП / заказ selects with data-test hooks.
- studio-editor.page.ts: loads counterparties (200), quotations, orders; PATCH context via PiStudioDocumentsService.update + expectedRevision.
- @kppdf/data-access: StudioDocument + UpdateStudioDocumentPayload context; new read-only PiCounterpartiesService, PiQuotationsService, PiOrdersService.

## Gates (exit 0)

- pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit
- pnpm exec nx test kppdf-web --testPathPattern=studio
- pnpm exec nx build kppdf-web

## Files

- frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-workspace-chrome.ts
- frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-data-panel.component.ts
- frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-data-panel.component.spec.ts
- frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts
- frontend-nx/libs/data-access/src/lib/doc-studio/studio-document.types.ts
- frontend-nx/libs/data-access/src/lib/sales/* (new)
- frontend-nx/libs/data-access/src/index.ts
- docs/pages/document-studio.page.md

## Not in scope (S7-2+)

- Template rail, deep-link quotationId prefill, table tier-L putDataSet.