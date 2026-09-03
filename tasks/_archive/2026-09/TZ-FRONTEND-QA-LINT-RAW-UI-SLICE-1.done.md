# TZ-FRONTEND-QA-LINT-RAW-UI-SLICE-1

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-03T14:05:00Z
closed_by: freebuff
head_sha: pending Q4b commit
lock_file: CREATED
verification:
  - acceptance criteria: PASS
  - focused frontend lint: PASS, 0 errors / 0 warnings across 15 files
  - frontend typecheck: PASS
  - frontend tests: PASS, 196 suites / 2091 tests
  - browser smoke: PASS, 4 routes / 0 console errors each
  - full legacy frontend lint: known limitation, 35 errors / 17 warnings outside slice
  - diff check: PASS
  - checklist: UPDATED
  - progress.md: redirect-only, live state in checklist/_NOW
  - status synchronization: PASS after commit

lint_counts:
  audit_baseline: 200 no-raw-ui-values errors / 17 lifecycle warnings
  after_q4b_slice: 35 errors / 17 lifecycle warnings
  in_scope_after_q4b: 0 errors / 0 warnings

summary:
  - Replaced raw spacing and hex color values in the capped 15-file legacy frontend batch with existing Paper & Ink CSS variables and equivalent token calculations.
  - Preserved fixed canvas dimensions, typography, and behavior; no route, API, capability, or lifecycle changes.
  - Verified `/doc-constructor/tables`, `/proposals/create`, `/production`, and `/desk` with a read-only Puppeteer smoke against the existing local services.

known_limitation:
  - Full legacy frontend lint remains non-green because 35 raw-UI errors remain outside the capped batch; 17 existing page lifecycle warnings remain parked.
  - Successor cleanup belongs to Slice-2 or a later frontend lint slice.
  - `scripts/with_server.py` is absent; direct Puppeteer was used because local frontend/backend services were already available.
  - `frontend-nx/**` and deploy paths were not touched.

conflict_keys:
  - frontend/src/app/pages/doc-constructor/tables/table-template-dialog.component.ts
  - frontend/src/app/pages/doc-constructor/texts/text-block-editor.component.ts
  - frontend/src/app/pages/doc-constructor/texts/data-field-picker-dialog.component.ts
  - frontend/src/app/pages/doc-constructor/builder/builder-tool-pane.component.ts
  - frontend/src/app/pages/doc-constructor/builder/builder.page.ts
  - frontend/src/app/pages/production/blocks/gantt-bars.component.ts
  - frontend/src/app/shared/ui/card/pi-showcase-card.component.ts
  - frontend/src/app/pages/commercial/proposals/proposal-create-table-editor.component.ts
  - frontend/src/app/pages/commercial/proposals/proposal-product-rail.component.ts
  - frontend/src/app/pages/commercial/proposals/proposal-create-inspector.component.ts
  - frontend/src/app/pages/commercial/proposals/proposal-create-recipient.component.ts
  - frontend/src/app/pages/commercial/proposals/proposal-create-template-center.component.ts
  - frontend/src/app/pages/commercial/proposals/proposal-create-template-picker.component.ts
  - frontend/src/app/pages/commercial/proposals/proposal-create-terms.component.ts
  - frontend/src/app/pages/desk/manager-desk.page.ts
