# TZ-NX-DOCSTUDIO-D56-SELECTED-RAIL — DONE

- Status: DONE
- agent_id: freebuff
- workspace: `D:\kppdf-8.0`
- claimed_at: `2026-09-05T13:07:00+03:00`
- closed_at: `2026-09-05T13:22:00+03:00`
- team_room_claim: unavailable (no Team Room CLI installed)
- implementation_sha: `efb647b8`
- closeout_metadata_sha: `3792c773`

## Result

Moved the existing «Выбрано» buffer to a second left Studio chrome-rail tool without creating a second buffer or write path. The Data TOC now contains only `Товары`, `Кому`, `Связи`, and `Ещё`; Selected reuses the existing catalog/anchor inputs and `catalogRemove` / `insertTable` outputs in a normal-width overlay. The rail order is Data then Selected, with the selected-count badge when non-zero, and the A4 geometry remains unchanged.

## Verification

- Baseline `pnpm exec nx build kppdf-web`: PASS before D56 implementation.
- Focused Jest: PASS, 4 suites / 36 tests.
- App typecheck: PASS, `pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit`.
- App lint: PASS, 0 errors; existing warnings only.
- `git diff --check`: PASS.
- Final `pnpm exec nx build kppdf-web`: PASS, exit 0; only known pre-existing warnings.

## Scope integrity

Backend, Properties, right rail, product rail, legacy `frontend/`, and unrelated dirty workspace changes were excluded.
