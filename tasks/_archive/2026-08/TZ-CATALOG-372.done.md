# TZ-CATALOG-372 DONE — modules list vitrine parity

```
ARCHIVE_MARKER
task: TZ-CATALOG-372
outcome: DONE
closed_at: 2026-08-15T11:30:00Z
closed_by: Buffy (closeout)
workspace: D:\kppdf-8.0
implementation_sha: 3b460f4517cfae01b40722c9b4229ba7717e6552
closeout_sha: 1ba6382ef4647e860653bac92e24fe0b227ffb9b
verification:
  - acceptance criteria: PASS (см. checklist docs/agent-checklists/TZ-CATALOG-372.md)
  - frontend tsc: PASS
  - modules.page Jest: PASS (17/17)
  - Cursor verdict: PASS
  - checklist: DONE
  - progress.md: UPDATED
  - active marker: removed after archive
  - deploy: NOT EXECUTED
protected:
  - frontend/src/app/pages/modules/modules.page.ts
  - frontend/src/app/pages/modules/modules.page.spec.ts
  - frontend/src/app/shared/services/pi-product-modules.service.ts
  - docs/pages/modules.page.md
  - docs/pages/PAGE-TZ-INDEX.md
  - docs/audits/2026-08-15-catalog-list-vitrine-parity.md
```

## Delivered

- `/modules` vitrine parity with `/products`: photo column, name link, toolbar (Состав / Обновить / list↔grid), filters-rail overlay, PiShowcaseCard md grid, `pi-modules-view-mode` persistence.
- `ProductModule` type: optional `mainPhotoId` / `photoIds` (schema mirror).
- Specs expanded to 17 tests; page doc updated.

## НЕ

- Deploy / wipe
- Server envelope `/modules` (successor)
- materials/products pages (373/372 parallel)

---

# TZ-CATALOG-372 — active marker (archived)

- task: TZ-CATALOG-372-modules-list-vitrine-parity
- spec: `tasks/TZ-CATALOG-372-modules-list-vitrine-parity.md`
- status: DONE
- claimed_by: Buffy
- claimed_at: 2026-08-15T07:36:56Z
- closed_at: 2026-08-15T11:30:00Z
- workspace: D:\kppdf-8.0
- conflict_keys: frontend/src/app/pages/modules/modules.page.ts · modules.page.spec.ts · pi-product-modules.service.ts · docs/pages/modules.page.md · PAGE-TZ-INDEX.md · TZ-CATALOG-372.md
- deploy: NO
- note: Cursor PASS; catalog vitrine wave 372/373.
