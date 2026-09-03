# TZ-NX-DOCSTUDIO-S29-FE-LIVEROWS

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-03
closed_by: claude
verification:
  - acceptance criteria: PASS (code review — see checklist Acceptance section)
  - build: PASS (cd frontend-nx && pnpm exec nx build kppdf-web, exit 0)
  - lint: pre-existing baseline failures unrelated to changed lines (see checklist Gates)
  - tests: N/A — no unit-test harness exists for studio-editor.page.ts (heavy DI surface); AC verified by code reading per TZ п.4 fallback
  - checklist: ADDED (docs/agent-checklists/TZ-NX-DOCSTUDIO-S29-FE-LIVEROWS.md)
  - progress.md: NOT UPDATED (root progress.md is a redirect-only stub; tracked via checklist + _archive)
  - status synchronization: CHECKLIST UPDATED

`studio-editor.page.ts`: `onTableSourceChange` now applies live rows from the `putDataSet` response's `dataSets` entry (matching the catalog-selection path from S28) instead of a local empty-rows placeholder. New `refreshLiveDataSetsOnLoad` runs once after document+blocks load: for every `table` block whose `settings.dataSource.type` is an ERP/catalog source (mirrors backend `LIVE_HYDRATABLE_SOURCE_TYPES`), it re-`putDataSet`s the existing entry to trigger backend hydration (GET does not hydrate — only `putDataSet` does, per S28) and applies the returned rows to `settings.liveRows`. Canvas already read `settings.liveRows`; untouched. Only `studio-editor.page.ts` changed (sole CONFLICT KEY needed).
