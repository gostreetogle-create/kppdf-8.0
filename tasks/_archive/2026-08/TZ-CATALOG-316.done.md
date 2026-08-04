═══════════════════════════════════════════════════════════════
TZ-CATALOG-316: Material FE — поля 301 — DONE
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-04
closed_by: Cursor (closeout after interrupted Gemini executor; 302 left alone)
acceptance_status: PASS
verification:
  - frontend jest material-form-dialog + materials.service + materials.page.spec + materials.page-316: 52/52 PASS
  - frontend tsc -p tsconfig.app.json --noEmit: PASS
  - git diff --check on conflict keys: PASS (CRLF warnings only)
protected_files:
  - frontend/src/app/shared/services/materials.service.ts
  - frontend/src/app/shared/services/materials.service.spec.ts
  - frontend/src/app/pages/materials/material-form-dialog.component.ts
  - frontend/src/app/pages/materials/material-form-dialog.component.spec.ts
  - frontend/src/app/pages/materials/materials.page.ts
  - frontend/src/app/pages/materials/materials.page.spec.ts
  - frontend/src/app/pages/materials/materials.page-316.spec.ts
  - docs/pages/materials.page.md
  - docs/agent-checklists/TZ-CATALOG-316.md
checklist: docs/agent-checklists/TZ-CATALOG-316.md
lock: .mimocode/locks/TZ-CATALOG-316-material-fe-301.lock
source: tasks/_backlog/catalog/TZ-CATALOG-316.md

---

## Summary

FE Material выровнен с BE TZ-CATALOG-301: materialKind / weightKg /
assortment / standardRef / materialGrade в service + form dialog,
колонка «Тип» и toolbar-фильтр `?materialKind=` на `/materials`.
Исполнитель оборвался на NG0101 в page.spec; closeout: pageSig
guard + отдельный suite `materials.page-316.spec.ts`.
