═══════════════════════════════════════════════════════════════
TZ-UI-TABLE-303: Expandable row polish — DONE
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-05
closed_by: openai/gpt-5.6-luna (Buffy)
acceptance_status: PASS
verification:
  - fe tsc: PASS (exit 0)
  - jest targeted: 4 suites / 45 tests PASS
protected_files:
  - frontend/src/app/shared/ui/pi-table.component.ts
  - frontend/src/app/shared/ui/pi-table.component.spec.ts
  - frontend/src/app/pages/products/products.page.ts
  - frontend/src/app/pages/products/products.page.spec.ts
  - docs/pages/products.page.md
  - docs/superpowers/specs/2026-08-04-table-kit-design.md
checklist: docs/agent-checklists/TZ-UI-TABLE-303.md
lock: .mimocode/locks/TZ-UI-TABLE-303-expandable.lock

---

## Summary

The shared Flat table now has an explicit active-row predicate (`expandedRowWhen`)
and accessible detail-region label (`expandedRowLabel`). Products keeps its
single-expand composition behavior and now exposes keyboard activation,
`aria-expanded`, one active detail row, and a named region.

## Known limits

ModulesPage was not migrated; no browser screenshot smoke was run.
