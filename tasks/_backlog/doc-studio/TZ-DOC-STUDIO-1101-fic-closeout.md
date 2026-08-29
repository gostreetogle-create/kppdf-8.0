# TZ-DOC-STUDIO-1101: FIC closeout + demo cleanup (Wave 11)

> **Wave 11** · after Wave 10 PASS

## CONFLICT KEYS

`frontend/src/app/app.routes.ts`, `frontend/.../studio/**`, `frontend/src/app/layout/app-layout.component.ts`, `backend/src/common/seed/**`, `docs/FEATURE-INTEGRATION-CHECKLIST.md`

## ЧТО ДЕЛАТЬ

1. **Remove demo:** delete `/doc-constructor/studio/demo`, `document-studio-demo.page.ts`, all «Geometry demo» links/chips.
2. **Nav naming:** top nav + TOC chip **«Студия документов»** (not «Студия» alone).
3. **pageKey** `doc-studio` in PAGE_KEYS + admin/director/manager seeds (already partial — verify).
4. **architecture:check:** extract `ProposalWorkspaceShellComponent` usage to `shared/document-workspace-shell/` OR documented exception removed by extract.
5. Update `document-studio.page.md` status → production MVP.
6. FIC checklist sections B/A for doc-studio.

## ACCEPTANCE

- [ ] No demo route in app.routes.ts
- [ ] PO path: Документы → Студия документов → работающий редактор
- [ ] architecture:check PASS (studio violations resolved)
