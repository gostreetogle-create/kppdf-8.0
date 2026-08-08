# TZ-UI-SELECT-301 checklist

> Status: **DONE** · Wave: CATALOG-UX-C
> Source: `tasks/TZ-UI-SELECT-301-catalog-overflow-search-migrate.md`
> Conflict keys: catalog/reference form selectors and `docs/pages/ui-overflow-select.md`

## Claim slot
- agent_id: Buffy (openai/gpt-5.6-luna)
- claimed_at: 2026-08-08T14:45:00Z
- closed_at: 2026-08-08T15:20:00Z
- workspace: D:\\kppdf-8.0 main
- team_room_claim: unavailable (task was not synced in CLI)

## Acceptance
- [x] Growing category, supplier, counterparty, site, organization and product picks use `app-pi-overflow-select`; fixed enums remain native selects.
- [x] All migrated consumers pass loaded `{id,label}` items and `searchable="auto"`.
- [x] Search appears at 10+ items and is absent below the threshold; query resets on close.
- [x] Existing form values, change handlers, dirty state and submit payload contracts are preserved.
- [x] `docs/pages/ui-overflow-select.md` inventory table updated.

## Gates
- [x] Targeted Jest: overflow-select, product-module-picker, product-form-dialog — 35 tests PASS.
- [x] Targeted ESLint — 0 errors; one pre-existing raw-HttpClient warning in order form.
- [x] Prettier check — PASS for all touched selectors and docs.
- [x] `git diff --check` — PASS.
- [!] Full frontend tsc is currently blocked by pre-existing unrelated WIP: `materials.page.ts` imports the untracked `shared/util/material-dimensions.ts`. No selector migration file appears in the compiler errors.

## Closeout
- [x] Archive + lock + progress/checkpoint
- [x] Commit and push main

## Scope guard
- FACT-304 / FORM-307, orders peer, supply/** and desktop/** were not staged.
