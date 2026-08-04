═══════════════════════════════════════════════════════════════
TZ-UX-306: /people route + nav + Person card — DONE
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-04
closed_by: Cursor (executor while CATALOG-302 parallel)
acceptance_status: PASS
verification:
  - frontend jest pi-workers.service.spec.ts: 6/6 PASS
  - frontend tsc -p tsconfig.app.json --noEmit: PASS
protected_files:
  - frontend/src/app/pages/people/people.page.ts
  - frontend/src/app/pages/people/people-form-dialog.component.ts
  - frontend/src/app/shared/services/pi-workers.service.ts
  - frontend/src/app/shared/services/pi-workers.service.spec.ts
  - frontend/src/app/app.routes.ts
  - frontend/src/app/layout/app-layout.component.ts
  - docs/pages/people.page.md
checklist: docs/agent-checklists/TZ-UX-306.md
lock: .mimocode/locks/TZ-UX-306-people-route.lock
source: tasks/_backlog/TZ-UX-306-people-route-align.md

---

## Summary

Закрыт WORKERS-302.FOLLOWUP: страница `/people`, nav «Люди», dialog по
DIALOG-COOKBOOK. Service приведён к реальному Worker API (не fictional `name`).

known_limitation: supplierId/workTypeIds/ratePerHour не в форме Phase 1.
