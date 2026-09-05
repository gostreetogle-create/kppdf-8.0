# TZ-NX-MODULE-WT-DAYS-SOT

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-05
closed_by: claude

## Verification

- acceptance criteria: PASS — module↔workType binding `days` is the Gantt duration SoT (module A 4д vs module B 1д on the same WorkType read different bar lengths); order resize stays scoped to `estimate-days`; Person skills form stays days-free (S-TZ); WorkType form label is now «Дней по умолчанию» (seed only).
- backend typecheck: PASS — `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit`.
- backend tests: PASS — `cd backend && pnpm test -- product-module` (2 suites / 18 tests, including 4 new days-binding cases).
- frontend build: PASS — `cd frontend-nx && pnpm exec nx build kppdf-web` (only pre-existing unrelated warnings).
- frontend tests: PASS — `cd frontend-nx && pnpm exec nx test kppdf-web` (80 suites / 521 passed, 7 skipped, 0 failed); covers `module-form-dialog`, `production-read.facade`, `production-cockpit.page.write`, `worker-form-dialog`.

## Delivered

- `ModuleWorkTypeSchema.days?: number|null` (backend schema/service/DTO), validated >=1 when set, null/absent = fallback.
- `product-module.types.ts`: `WorkTypeInModule.days` (read) + `ProductModuleWorkTypePayload.days` (write).
- `module-form-dialog.component.ts`: «Дней» field per work-type row; seeds from `WorkType.days` catalog on selection only when empty; never clobbers an explicit override; updated hint copy.
- `production-read.facade.ts` `mapModuleWorkTypes`: binding days (finite, >=1) wins over catalog/populated fallback.
- `work-type-form-dialog.component.ts`: label «Дней» → «Дней по умолчанию» + seed-only hint.
- Removed the Gantt work-detail «Изменить в справочнике» catalog-days button (`gantt-bars.component.ts`, `production-cockpit.page.ts`) — option (A) per the TZ's own PO-canon default, since this exact button caused the bug the TZ fixes (global WorkType write breaking per-module days). Deleted the now-fully-dead `blocks/order-inspector.component.ts` helper.
- Docs: `modules.page.md`, `work-types.page.md`, `docs/COUPLING-MAP.md`, `docs/pages/PAGE-TZ-INDEX.md` — one-line SoT/label notes.

## Scope disclosure

- Person/Worker skills payload, `estimatedHours` semantics, `Order.estimateDayOverrides` API shape, legacy `frontend/` dual-site, deploy/DB — not touched.
- Orders hub tray / `order-hub-tray` files were never opened (explicit exclusion from this prompt).
- `production-cockpit.page.md` (historical journal, not in TZ CONFLICT KEYS) was intentionally left untouched.

## Commit

- see git log (this TZ; S TZ `TZ-NX-REGISTRIES-WORKER-SKILLS-NO-DAYS` was committed/pushed separately as 8b3b683b before this one started)
