═══════════════════════════════════════════════════════════════
TZ-UI-TABLE-305: Raw registry tables → Flat app-pi-table — DONE
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-05
closed_by: openai/gpt-5.6-luna (Buffy)
acceptance_status: PASS
verification:
  - fe tsc: PASS (exit 0)
  - jest targeted: 11 suites / 86 tests PASS
  - raw registry scan: PASS (no raw registry <table> in the seven page templates)
protected_files:
  - frontend/src/app/pages/doc-constructor/texts/texts.page.ts
  - frontend/src/app/pages/doc-constructor/templates/templates.page.ts
  - frontend/src/app/pages/doc-constructor/tables/tables.page.ts
  - frontend/src/app/pages/doc-constructor/documents/documents.page.ts
  - frontend/src/app/pages/forms/forms.page.ts
  - frontend/src/app/pages/inventory/inventory-dashboard.page.ts
  - frontend/src/app/pages/dictionaries/text-block-categories.page.ts
  - matching page specs and docs
checklist: docs/agent-checklists/TZ-UI-TABLE-305.md
lock: .mimocode/locks/TZ-UI-TABLE-305-flat-kit.lock

---

## Summary

All seven raw registry tables from table-kit SoT §4.2 now use the shared
`app-pi-table` Flat primitive. CRUD actions, filters, status/default controls,
loading/empty states, sorting ownership, and client-side pagination were kept
or wired to the kit contract. Dedicated smoke specs cover Documents, Forms and
Inventory Dashboard; existing page/kit specs cover the other migrations.

## Known limits

No browser screenshot smoke was run. The shared expandable-row contract and
ProductsPage changes are recorded under the sequential TZ-UI-TABLE-303 claim,
not this archive.
