# TZ-NX-PASSPORT-DISCOVERY-IMPLEMENTATION checklist

> Status: **DONE**

## Claim slot

- (cleared)

## Acceptance

- [x] Field map from `data/Pasports.xlsx` (`passport-field-map.ts`)
- [x] Live auto-fill from Product + composition tree + Units
- [x] Read-only preview in Product edit dialog
- [x] Live catalog vs `ProductPassport` snapshot separation (notice + snapshot-only markers)
- [x] Missing values → «Не указано»; no invented backend fields
- [x] Backend blockers → `tasks/TZ-BACKEND-PASSPORT-SNAPSHOT-FIELDS.md`
- [x] Tests + gates PASS

## Integrity slot

- [x] No backend/schema/API changes
- [x] No XLSX import, print/export, snapshot write
- [x] Registries/composition dialogs unchanged except Product preview embed
- [x] Only fields from `PRODUCT_PASSPORT_FIELD_MAP` rendered

## Executor report

PASS — closed 2026-08-29. See `tasks/_archive/2026-08/TZ-NX-PASSPORT-DISCOVERY-IMPLEMENTATION.done.md`.

Preview: `pi-product-passport-preview` in `ProductFormDialogComponent` (edit mode). Builder: `build-product-passport-preview.ts`.

Blockers: passport №/date/warranty/product №/supplier need `ProductPassport` read path — draft `TZ-BACKEND-PASSPORT-SNAPSHOT-FIELDS.md`.
