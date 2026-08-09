# TZ-SALES-325: Create КП — draftLines → line-items table на бланке

PAGES: /proposals/create
PAGE_DOCS: proposals-create.page.md
Аудит: `docs/audits/2026-08-09-kp-create-preview-wave2.md` §C
LAYER: 3

CONFLICT KEYS: backend/src/modules/document-template/dto/build-document.dto.ts; backend/src/modules/document-template/document-template.service.ts; backend/src/modules/table-template/table-template.service.ts; frontend/src/app/pages/commercial/proposals/proposal-create.page.ts; frontend/src/app/pages/commercial/proposals/proposal-create.page.spec.ts; frontend/src/app/shared/services/pi-document-templates.service.ts; docs/pages/proposals-create.page.md

STATUS: READY FOR REVIEW
Claim slot:
- agent_id: agent-6c3d05b80e
- claimed_at: 2026-08-09T12:56:32Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable — Team Room registry reports unknown task

Preflight:
- canonical `main` synced/rebased to `origin/main` at `557c8f73`; 323, 324, 326, 327, 329 and DOC-344 are DONE/archived
- TZ-SALES-325, wave audit §C, Spec §0, GEMINI, AI-Agent Guide, and PO-DIARY §1–§4 read
- `_active-map` and canonical `_active` scanned; only DOC-TABLES-305 remains active and has no overlapping keys
- `pi-document-templates.service.ts` is free after DOC-344 closeout
- canonical has foreign dirty `document-template.service.ts` orientation WIP; it will be preserved and excluded from the scoped commit
- 322, 320, BuilderCanvas, DOC-344, snapshot refresh, Save persistence, and deploy are out of scope

Acceptance scope:
- send optional `previewLines` from in-memory `draftLines` on Create КП preview rebuilds
- automated gates are green; Cursor/PO visual PASS remains required before archive
- map draft fields only by the TZ column-key aliases, never by labels
- target explicit `settings.kpLineItems === true` / line-items role, otherwise exactly one live table; multiple unflagged live tables remain skeletons
- never modify snapshot-mode or non-target tables; empty lines retain the 324 skeleton
- preview payload remains request-only and is not persisted to Mongo/Quotation
