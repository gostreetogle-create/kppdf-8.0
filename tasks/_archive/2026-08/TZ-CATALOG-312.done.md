═══════════════════════════════════════════════════════════════
TZ-CATALOG-312: Material detail page /materials/:id — DONE
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-05
closed_by: Buffy
acceptance_status: PASS
commit: 7eb60f4
verification:
  - frontend tsc: PASS
  - jest material-detail: 6/6 PASS
protected_files:
  - frontend/src/app/pages/materials/material-detail.page.ts
  - frontend/src/app/pages/materials/material-detail.page.spec.ts
  - frontend/src/app/pages/materials/materials.page.ts
  - frontend/src/app/app.routes.ts
checklist: docs/agent-checklists/TZ-CATALOG-312.md
lock: .mimocode/locks/TZ-CATALOG-312-material-detail.lock
source_was: tasks/_backlog/catalog/TZ-CATALOG-312.md (stub removed after archive hygiene 2026-08-06)

---

## Summary

Карточка материала `/materials/:id` (основное, габариты, склад, where-used).
Роут + ссылка из списка. Паттерн product/module detail.

## Hygiene note (2026-08-06)

Код и progress DONE были раньше; `_active` claim и backlog stub ошибочно
остались. Исправлено при hygiene pass: archive + lock + удаление stale active/backlog.
