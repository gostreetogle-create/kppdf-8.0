# TZD-68: Desktop Excel — скачать реестр с данными

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-05
closed_by: claude

## Verification

- acceptance criteria: PASS — export mode adds data rows from API (material/workType pilot), template mode unchanged, export disabled without pairing.
- desktop typecheck: PASS — `cd desktop && npx tsc --noEmit`.
- desktop svelte-check: PASS (0 errors/warnings) — extra check since bare `tsc` does not cover `.svelte` files.
- desktop tests: PASS — `npx tsx --test src/core/*.test.ts src/importers/*.test.ts` (88 tests, 4 suites, 0 fail); `excel-form-template.test.ts` alone: 21/21 (14 prior + 7 new).

## Delivered

- `buildFormWorkbook`/`serializeFormWorkbook` accept `{ mode: 'template'|'export', rows? }`; export mode fills the «Данные» sheet from API rows mapped by column key.
- `_kppdf` fingerprint carries an optional `mode` (backward compatible with older forms).
- `EXPORT_PILOT_TARGET_KEYS = ['material', 'workType']` gates both the builder and the UI.
- New «Скачать с данными» button in `App.svelte` next to «Скачать Excel-форму», reusing the existing `/api/materials` + `/api/work-types` GET calls already used by dedupe-checking.
- `desktop/docs/MCP.md` — one paragraph documenting the new button.

## Scope disclosure

- `frontend-nx/**`, Nest backend, and `/registries` Excel buttons were not touched (there are none — canon respected).
- Export pilot is material+workType only; other targets (product/module/counterparty/etc.) are successor scope.
- Worker/units are TZD-69 scope, not touched here.

## Commit

- see git log
