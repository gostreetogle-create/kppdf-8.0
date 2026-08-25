# TZ-CATALOG-377: категории — единый справочник + name-path + UX справочников

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-25T21:35:00+03:00
closed_by: cursor-task-resume

## Outcome

Category `fullPath` is name-based on create/rename (descendants rebuilt via parentId BFS → `Сплавы/Лист`, not slug suffix). Seed + bootstrap one-shot migrate slug-era paths. `/categories` shows path hint, `?type=` filter, copy-slug, material empty hint. Material/supply write-through POST `type=material`; pickers use shared `categoryPickerLabel`.

## Changed surface

- `backend/src/modules/category/category.service.ts` (+ spec)
- `backend/src/common/seed/categories.seed.ts`
- `frontend/src/app/pages/dictionaries/categories.page.ts`
- `frontend/src/app/pages/materials/material-form-dialog.component.ts`
- `frontend/src/app/pages/products/product-form-dialog.component.ts`
- `frontend/src/app/pages/supply/supply-quick-order.component.ts` / `.mock.ts`
- `frontend/src/app/shared/services/categories.service.ts` (`categoryPickerLabel`)
- `docs/pages/categories.page.md`, `docs/CONTEXT.md`, `docs/pages/PAGE-TZ-INDEX.md`
- `scripts/architecture-check.baseline.json` (line-key refresh for known cross-page imports)
- checklist / queue / progress / lock

## Verification

- BE: `tsc` PASS; `category.service.spec.ts` 3/3 PASS (name create + rename descendants + cycle)
- FE: `tsc` PASS; `supply-quick-order.mock.spec` 3/3 PASS (`categoryPickerLabel`)
- focused ESLint PASS; `architecture:check` PASS (baseline only)
- FIC §A N/A new route; §C existing category API; Integrity: page.md + PAGE-TZ-INDEX + CONTEXT

## Known limits

Live browser smoke not run. Deploy НЕ. Product form still opens CategoryFormDialog (grandfathered baseline); material uses inline POST to avoid new cross-page import.
