# TZ-CATALOG-373 DONE — materials list vitrine parity

```
ARCHIVE_MARKER
task: TZ-CATALOG-373
outcome: DONE
closed_at: 2026-08-15T11:25:00Z
closed_by: Buffy (closeout)
workspace: D:\kppdf-8.0
implementation_sha: 528e3cf9fb21eb283b076893e627097a3736ffea
closeout_sha: TBD
verification:
  - acceptance criteria: PASS (см. checklist docs/agent-checklists/TZ-CATALOG-373.md)
  - frontend tsc (tsconfig.app.json): PASS
  - materials.page Jest: PASS (3 suites / 18 tests)
  - Cursor verdict: PASS
  - checklist: DONE
  - progress.md: UPDATED
  - active marker: removed after archive
  - deploy: NOT EXECUTED
protected:
  - frontend/src/app/pages/materials/materials.page.ts
  - frontend/src/app/pages/materials/materials.page-373.spec.ts
  - docs/pages/materials.page.md
  - docs/pages/PAGE-TZ-INDEX.md
  - docs/audits/2026-08-15-catalog-list-vitrine-parity.md
```

## Delivered

- `/materials` list↔grid toggle with `pi-materials-view-mode` persistence (canon products TZ-PRODUCTS-305).
- Filters-rail overlay (Тип + Сбросить; shared `kindFilterSig` with toolbar / TZ-CATALOG-316).
- Grid via `PiShowcaseCard size="md"`; table `@ViewChild` templates hoisted for static resolution.
- `materials.page-373.spec.ts` (12 tests) + page docs + audit amendment.

## Known limits

- Rail sort not wired (backend `/materials` has no sortBy); column narrowing = successor.

## НЕ

- Deploy / wipe
- modules.page.ts (372)
- backend changes

---

# TZ-CATALOG-373 — active marker (archived)

- task: TZ-CATALOG-373-materials-list-vitrine-parity
- status: DONE
- claimed_by: Buffy
- claimed_at: 2026-08-15T07:37:08Z
- closed_at: 2026-08-15T11:25:00Z
- workspace: D:\kppdf-8.0
- conflict_keys: frontend/src/app/pages/materials/materials.page.ts · materials.page-373.spec.ts · docs/pages/materials.page.md · docs/pages/PAGE-TZ-INDEX.md · docs/agent-checklists/TZ-CATALOG-373.md
- vs CATALOG-372: OK (no overlap)
- deploy: NO

---

# TZ-CATALOG-373 — spec reference

See `tasks/TZ-CATALOG-373-materials-list-vitrine-parity.md` (retained in repo).
