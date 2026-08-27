# TZ-QA-445C checklist

> Status: **DONE**
> Marker: archived — `tasks/_archive/2026-08/TZ-QA-445C.done.md`

## Claim slot
- agent_id: freebuff-2
- claimed_at: 2026-08-27T18:28:41Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable

## Acceptance
- [x] AC from TZ `tasks/TZ-QA-445C*.md`
- [x] Focused gates; archive + lock

### Preflight Check Output
- **Context read:** `tasks/TZ-QA-445C-doc-template-pdf-photo.md`, `docs/PO-CANON.md`, `.agents/skills/kppdf-executor-loop/SKILL.md`, `backend/.../quotation-output.service.ts`, `backend/.../document-template.service.ts`, `backend/.../table-template.service.ts`, `frontend/.../builder/builder.page.ts`, `docs/pages/documents.page.md`
- **Key Constraints:** Conflict `pages/doc-constructor/*` + PDF service; no inventory/proposal-workspace/product-detail/gantt/work-types
- **Planned Deliverable:** PDF live rebuild; document `<base>`; builder flush+srcdoc uploads; photo-column `[img]`/URL cells
- **Validation Path:** FIC N/A (bugfix); focused tsc + jest

## Gates / Executor report
- backend tsc PASS; frontend tsc PASS
- jest quotation-output + table-template + document-template.assets: 25/25
- jest builder.page.spec: 31/31
- Archive: `tasks/_archive/2026-08/TZ-QA-445C.done.md`
- Lock: `.mimocode/locks/TZ-QA-445C-doc-template-pdf-photo.lock`
- Deploy: NO
