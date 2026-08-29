# TZ-DOC-STUDIO-201b: StudioDocument persistence + org scope

> **Wave 2b** · after 2a PASS  
> **ADR:** [`docs/architecture/document-studio.md`](../../docs/architecture/document-studio.md) §2b, §5, §6 design

## CONFLICT KEYS

`backend/src/modules/studio-document/**`; `generated-document.schema.ts` (read-only audit doc in TZ, no migrate)

## ЧТО ДЕЛАТЬ

1. `StudioDocument` schema + indexes.
2. `organizationId` from auth context on create; all list/get/patch org-scoped.
3. `docTypeId` optional on create; validate required on finalize transition only.
4. PATCH/bulk: **`expectedRevision`** → 409 `STUDIO_DOCUMENT_REVISION_CONFLICT`.
5. dataSets PUT — same revision gate (**not** LWW).
6. **Deliverable doc:** `GeneratedDocument` migration contract (fields: `sourceType=studio`, `studioDocumentId`, `sourceRevision`) — **no production migration yet**.

## ACCEPTANCE CRITERIA

- [ ] API tests: CRUD, org isolation, stale revision 409
- [ ] Migration contract markdown in ADR or `docs/architecture/document-studio-generated-document-migration.md`
