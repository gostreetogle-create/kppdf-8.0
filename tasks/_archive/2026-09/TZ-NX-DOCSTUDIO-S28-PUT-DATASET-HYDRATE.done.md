# TZ-NX-DOCSTUDIO-S28-PUT-DATASET-HYDRATE

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-03
closed_by: claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit)
  - tests: PASS (studio-data-resolver + studio-document.service: 44; studio-document module regression: 62)
  - lint: PASS (eslint on changed files)
  - checklist: ADDED (docs/agent-checklists/TZ-NX-DOCSTUDIO-S28-PUT-DATASET-HYDRATE.md)
  - progress.md: NOT UPDATED (root progress.md is a redirect-only stub; tracked via checklist + _archive)
  - status synchronization: CHECKLIST UPDATED

`putDataSet` now hydrates live rows into the returned document for quotation/order/catalog dataSet sources: after upsert+revision bump, `StudioDocumentService` reuses the existing `StudioDataResolverService.resolveDataSets(doc, blocks, true)` (same live-read path as Preview/PDF) and substitutes the resolved rows for the updated entry into the response object only — the persisted draft still stores whatever FE sent, and finalize/PDF bakeSnapshot path is untouched. Manual sources and non-hydratable entries are a no-op fast path. Backend tsc + focused specs green.
