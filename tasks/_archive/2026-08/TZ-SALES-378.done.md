# TZ-SALES-378 DONE — multipage bg CSS + full next-page table geometry

```
ARCHIVE_MARKER
task: TZ-SALES-378
outcome: DONE
closed_at: 2026-08-15T07:39:00Z
closed_by: Buffy (closeout)
workspace: D:\kppdf-8.0
implementation_sha: b20944637d62bafe614bc808505137334e6c6e49
closeout_sha: ed57baff
verification:
  - acceptance criteria: PASS (см. checklist docs/agent-checklists/TZ-SALES-378.md)
  - backend tsc: PASS
  - document-template Jest: PASS (70)
  - Cursor verdict: PASS
  - checklist: DONE
  - progress.md: UPDATED
  - active marker: removed after archive
  - deploy: NOT EXECUTED
protected:
  - backend/src/modules/document-template/document-template.service.ts
  - backend/src/modules/document-template/document-template.assets.spec.ts
  - docs/pages/proposals-create.page.md
  - docs/pages/PAGE-TZ-INDEX.md
  - docs/audits/2026-08-15-kp-multipage-table-overflow-audit.md
```

## Delivered

- `buildDocumentContentStyles` hoisted into multipage outer `<head>` — `.doc-bg` / positioned blocks CSS preserved on all pages.
- `.doc-page { position: relative }` — containing block for background and absolute blocks.
- Auto next-page capacity uses full sheet (`layoutHeight ≈ 1.0`), not short first-page frame.
- `remapContinuationTableBlock`: page 2+ table `y ≈ 0`, `height ≈ 1` (full content area).
- Specs (3 new) + docs + audit amendment **378**.

## НЕ

- Deploy / wipe
- ContinuationMode / strip decorations (**TZ-SALES-377** park)
- AUTH-305, frontend product UI

---

# TZ-SALES-378 — active marker (archived)

- task: TZ-SALES-378-kp-multipage-bg-and-full-next-pages
- spec: `tasks/TZ-SALES-378-kp-multipage-bg-and-full-next-pages.md`
- status: DONE
- claimed_by: Buffy (Cursor Agent)
- claimed_at: 2026-08-15T07:40:00Z
- closed_at: 2026-08-15T07:39:00Z
- workspace: D:\kppdf-8.0
- conflict_keys: backend/src/modules/document-template/document-template.service.ts · document-template.assets.spec.ts · docs/pages/proposals-create.page.md · docs/pages/PAGE-TZ-INDEX.md · docs/audits/2026-08-15-kp-multipage-table-overflow-audit.md
- vs AUTH-305: OK (no overlap)
- deploy: NO
- note: Multipage CSS shell; full next-page capacity; continuation table remap. Cursor PASS. SALES-377 PARK.

---

# TZ-SALES-378: Фон на multipage + полная высота таблицы на стр. 2+

РОЛЬ АГЕНТА: Backend document build (+ docs)

ЗАВИСИМОСТИ: TZ-SALES-376 DONE (regression follow-up)

LAYER: 3

PAGES: /proposals/create
PAGE_DOCS: proposals-create.page.md

CONFLICT KEYS: backend/src/modules/document-template/document-template.service.ts ; backend/src/modules/document-template/document-template.assets.spec.ts ; docs/pages/proposals-create.page.md ; docs/pages/PAGE-TZ-INDEX.md ; docs/audits/2026-08-15-kp-multipage-table-overflow-audit.md

Spec: `tasks/TZ-SALES-378-kp-multipage-bg-and-full-next-pages.md`
