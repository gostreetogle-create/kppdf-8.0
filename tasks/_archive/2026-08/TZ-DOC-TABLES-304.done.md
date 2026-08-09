# TZ-DOC-TABLES-304 — DONE

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-09
closed_by: buffy-doc-tables-304
verification:
  - acceptance criteria: PASS
  - backend typecheck: PASS
  - tests: PASS — registry unit 2 tests and registry e2e 8 tests
  - lint: PASS — registry files
  - checklist: UPDATED
  - progress.md: UPDATED
  - status synchronization: PASS

## Delivered

- Product registry fields now derive from `ProductSchema.paths` instead of a duplicated Product descriptor array.
- Added an explicit deny-list for internal/ref/composition paths and a special `photoIds` text-slot exception.
- Added deterministic RU label overrides, humanized fallback labels, Number/Boolean/Date mapping, and configured currency mapping.
- Kept the entity source allowlist explicit; only Product fields auto-sync.
- Added a unit test proving a new mock scalar path appears without editing a descriptor array.

## Gates

- Backend tsc: PASS.
- Registry unit Jest: 1 suite / 2 tests PASS.
- Registry e2e: 1 suite / 8 tests PASS.
- Registry ESLint: PASS.
- Prettier: PASS.
- `git diff --check`: PASS.

No admin registry CRUD, EAV, ModuleMaterials, or deploy changes. Browser/PO visual review was not applicable.
