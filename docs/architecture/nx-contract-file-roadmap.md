# Backend Contract file — параллель к KP Family

> **Параллель:** Freebuff #2 · **не** трогает `frontend-nx/apps/kppdf-web/**` и `quotation/**`  
> **SoT:** MASTER-CORE §2.4 `contractStatus: none|file_attached|generated`  
> **Чеклист:** `docs/agent-checklists/WAVE-BACKEND-CONTRACT-FILE.md`

Lifecycle `status` (draft/signed/…) **не менять**. Новый атрибут документа — отдельно.

## Delivered

- **C1 SCHEMA** — `contractStatus: none|file_attached|generated`, `attachmentFileId`, `attachmentUrl`.
- **C2 WRITE-PATH** — conditional validation, create/update semantics, explicit `none` clear.
- **C3 ATTACH-FILE** — audited admin/manager multipart `PUT`/`DELETE`, `Photo` metadata, `/uploads/contracts/...` storage.
- **C4 SPECS** — focused DTO/controller/service regressions.
- **C5 DOCS** — page/coupling/backlog/queue synchronization; NX `/contracts` remains successor/PARK.

The lifecycle `Contract.status` and future `generated` path remain separate and unchanged.
