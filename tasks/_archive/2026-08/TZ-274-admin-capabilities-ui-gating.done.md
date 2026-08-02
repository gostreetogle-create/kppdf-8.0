═══════════════════════════════════════════════════════════════
TZ-274: Admin pages — gating UI-кнопок по capabilities
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-02
closed_by: Buffy
protected_files:
  - frontend/src/app/pages/admin/users-admin.page.ts
  - frontend/src/app/pages/admin/users-admin.page.spec.ts
  - frontend/src/app/pages/admin/roles-admin.page.ts
  - frontend/src/app/pages/admin/roles-admin.page.spec.ts
  - frontend/src/app/shared/ui/pi-row-actions/pi-row-actions.component.ts
  - frontend/src/app/shared/ui/pi-row-actions/pi-row-actions.component.spec.ts
verification:
  - acceptance criteria: PASS
  - targeted frontend Jest: PASS (3 suites, 29 tests)
  - frontend typecheck: PASS (`pnpm exec tsc -p tsconfig.app.json --noEmit`)
  - frontend ng build development: PASS (`pnpm exec ng build --configuration=development`)
  - git diff --check: PASS
  - independent review: PASS
  - checklist: ADDED (`docs/agent-checklists/TZ-274.md`)
  - browser: MANUAL_BROWSER_CHECK_REQUIRED (no live authenticated browser flow)
notes:
  - Existing CapabilitiesService remains the UX visibility source; backend authorization remains authoritative.
  - PiRowActions `showDelete` defaults to true so existing consumers retain their behavior.
