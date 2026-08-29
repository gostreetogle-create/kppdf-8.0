# TZ-DOC-STUDIO-401: Studio editor — editable canvas + text blocks

> **Wave 4** · after Wave 3 shell routes  
> **ADR:** [`docs/architecture/document-studio.md`](../../docs/architecture/document-studio.md)  
> **Page SoT:** [`docs/pages/document-studio.page.md`](../../docs/pages/document-studio.page.md)

## CONFLICT KEYS

`backend/src/modules/template-block/**` (studio list/create/reorder/layouts only)  
`backend/src/modules/studio-document/studio-document.controller.ts` (optional nested blocks facade)  
`frontend/src/app/pages/doc-constructor/studio/**`  
`frontend/src/app/shared/services/pi-template-blocks.service.ts`

**STOP:** `builder.page.ts` logic copy-paste wholesale; KP workspace; document-template CRUD

## Проверено

- `template-block.service.ts` — dual-read, `parentType='studio-document'`
- `builder-canvas.component.ts`, `block-renderer.*`, `snap-engine.ts` — reuse
- `document-studio-editor.page.ts` — shell only, no canvas
- `docs/pages/document-studio.page.md` — target API `PUT .../blocks`

## ЧТО ДЕЛАТЬ

### BE — studio blocks API

1. `GET /api/studio-documents/:id/blocks` — list blocks where `parentType=studio-document`, `parentId=:id`, org-scoped via studio doc.
2. `POST /api/studio-documents/:id/blocks` — create block (default type `text`, normalized layout page 1).
3. `POST /api/studio-documents/:id/blocks/reorder` + `PATCH .../blocks/layouts` — same semantics as template builder.
4. Existing `PATCH /api/template-blocks/:id`, `DELETE` — work for studio blocks (dual-read path).
5. Create DTO: for studio path set `parentType`, `parentId`; **omit** `templateId` null — use studio doc's `sourceTemplateId` as legacy `templateId` when present, else require migration-safe create path per ADR §7 (backfill field from parentId for studio rows only in create()).

### FE — editor becomes usable

1. Replace editor A4 placeholder with reused `BuilderCanvasComponent` + `BlockRendererComponent` inside `kpWsSheet`.
2. New `studio-blocks-state.service.ts` — load blocks, debounced PATCH autosave (~1.5s), layout batch (copy pattern from `builder.page.ts`, not the whole page).
3. Left panel «Элементы»: **+ Текст** (MVP one block type).
4. Right panel or inline: select block → edit text content (minimal inspector — content textarea + geometry readout).
5. Remove placeholder copy «Wave 4» from production UI; keep dev-only if needed.
6. List page unchanged (already wired).

## ACCEPTANCE CRITERIA

- [ ] Create studio doc → open `:id` → click «+ Текст» → block appears on A4
- [ ] Drag/resize block → persists after reload
- [ ] Edit text content → persists after reload
- [ ] Legacy builder templates still open/save (regression)
- [ ] `pnpm exec tsc` FE+BE PASS; focused tests PASS

## НЕ

- Preview multipage, PDF, finalize, dataSets, layers panel, image blocks — later waves
- Fork snap-engine or block-renderer
- PO browser demo route required for PASS
