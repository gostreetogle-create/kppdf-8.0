# TZ-UX-FORM-305 — Dialog sections sweep

> Status: **DONE** — Wave A complete
> Commit/push: required by frozen session wave

## Claim slot

- agent_id: `agent-acfffc1331` (Buffy)
- claimed_at: `2026-08-08T09:16Z`
- workspace: `D:\kppdf-8.0\.freebuff\worktrees\27b6af5d-6e1c-4846-ad15-e1bb83be400c`
- `_active/`: only FORM-305 during implementation

## Preflight

- [x] FORM-302 primitive is stable and already committed.
- [x] FORM-304 committed/pushed as `7817959` before claim.
- [x] Wave A inventory read from TZ and repository grep.
- [x] No same-key competitor found.

## Conflict keys

- `frontend/src/app/shared/ui/form-section/**`
- Wave A `frontend/src/app/pages/**/**form*dialog*.ts`
- `docs/audits/2026-08-08-dialog-layout-canon.md`
- this checklist and `_active-map.md`

## Acceptance

- [x] Wave A dialogs use shared PiFormSection wrappers or are explicitly covered in the outliers audit.
- [x] FormControl names, payloads, API calls, and business logic were not changed.
- [x] Kind A confirm/delete dialogs were not touched.
- [x] Outliers table updated.
- [x] Targeted Jest, tsc, Angular build and scoped lint pass.

## Wave A files

- [x] product-form-dialog
- [x] module-form-dialog
- [x] color-references-form-dialog
- [x] category-form-dialog
- [x] document-template-category-form-dialog
- [x] text-block-category-form-dialog
- [x] order-form-dialog
- [x] proposal-form-dialog
- [x] people-form-dialog
- [x] warehouse-form-dialog
- [x] stock-movement-form-dialog

## Gates (fact)

- [x] `pnpm exec tsc -p tsconfig.app.json --noEmit`
- [x] `pnpm exec ng build --configuration development`
- [x] scoped ESLint: 0 errors; one pre-existing architecture warning in order dialog raw HttpClient import
- [x] `git diff --check`
- [x] targeted Jest — 5 suites / 58 tests PASS
- [x] scoped Prettier check — all Wave A source files PASS

## Closeout

- [x] archive: `tasks/_archive/2026-08/TZ-UX-FORM-305.done.md`
- [x] lock: `.mimocode/locks/TZ-UX-FORM-305-dialog-sections-sweep.lock`
- [x] progress.md updated
- [x] `_active-map.md` updated
- [x] `_active/` removed

## Known limitations

- Wave B remains deferred; untouched form dialogs are listed in the audit.
- The new section wrappers do not have dedicated DOM assertions in every legacy spec; Angular build plus existing behavior suites cover template validity and business behavior.
- Material dialog remains the visual reference and was not rewritten.
