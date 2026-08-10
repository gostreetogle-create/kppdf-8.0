# TZ-UX-DIALOG-306 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-UX-DIALOG-306.md` (removed at closeout)
> Commit/push: wave-authorized

## Claim slot

- agent_id: Buffy/freebuff-259639d6
- claimed_at: 2026-08-10T17:53:15.8644271Z
- workspace: `D:\\kppdf-8.0`
- team_room_claim: unavailable — `Unknown task; sync tasks first`

## Preflight

- [x] Worktree and branch verified; logical canonical workspace recorded.
- [x] `_active-map.md` and `tasks/_active/` checked; no competing claim.
- [x] TZ and dependency PRODUCTS-310 read.
- [x] Claim slot and marker created before code changes.

## Acceptance

- [x] Picker has narrow `Кол-во` number field, minimum `0.001`, default `1`.
- [x] Picker result carries `quantity`; BOM add path persists the supplied quantity instead of hardcoded `1`.
- [x] Session list shows quantity and supports consecutive adds with different quantities.
- [x] Add-and-continue clears selection and resets quantity to `1`.
- [x] `docs/pages/ui-add-and-continue.md` documents quantity behavior.

## Integrity

- [x] UI/page canon updated; no route change required.
- [x] Conflict keys respected; foreign WIP excluded.
- [x] Forbidden `deploy.ps1`, `desktop/**`, and `mcp-runtime/**` paths untouched.
- [x] Change type: page/component + docs/tests; no permission or backend contract change.

## Gates (fact)

- `frontend pnpm exec tsc -p tsconfig.app.json --noEmit` — PASS.
- `frontend pnpm exec jest src/app/pages/products/product-composition-picker-dialog.component.spec.ts src/app/pages/products/product-bom-panel.component.spec.ts --runInBand` — PASS, 2 suites / 22 tests.
- `frontend pnpm exec eslint` on changed picker/BOM files — PASS.
- `frontend pnpm exec prettier --check` on changed picker/BOM files — PASS.
- `git diff --check` — PASS; only CRLF conversion warnings from repository working-tree normalization.

## Executor report

- Added per-line quantity to picker UI, result/session payloads, validation, and reset behavior.
- Wired BOM POST DTOs to `result.quantity`; added acceptance coverage for quantity 3 and different consecutive quantities.
- Updated the canonical Add & continue documentation.
- Conflict disclosure: no foreign active task or forbidden path included; existing DICT-320 label expectation was aligned in the BOM spec only.
- Known limits: no changes to unit-price override or multi-select behavior.

## Closeout

- [x] archive + lock + progress + remove active marker
- [x] Status DONE
- closed_at: 2026-08-10T17:54:56.7912096Z
