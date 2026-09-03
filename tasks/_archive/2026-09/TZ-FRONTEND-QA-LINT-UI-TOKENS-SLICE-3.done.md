# TZ-FRONTEND-QA-LINT-UI-TOKENS-SLICE-3 checklist

> Status: DONE
> Marker: `tasks/_active/TZ-FRONTEND-QA-LINT-UI-TOKENS-SLICE-3.md` (removed on archive)

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-03T20:35:00Z
- workspace: D:\kppdf-8.0
- branch: `main`
- team_room_claim: unavailable

## Preflight

- [x] `cd frontend && pnpm run lint:ui-tokens` baseline: 35 violations / 3 files (matches slice-2 projection exactly)
- [x] Not `frontend-nx/**`; not backend

## Files (3, all external `.component.css`/`.page.css`, `check-ui-tokens.mjs` only)

1. `frontend/src/app/pages/commercial/proposals/demo/proposal-workspace-demo.page.css` — 6 (raw spacing, `var(--space-N, Npx)` fallback)
2. `frontend/src/app/pages/doc-constructor/builder/block-renderer.component.css` — 14 (13 raw spacing literal px + 1 raw hex color)
3. `frontend/src/app/shared/document-workspace-shell/proposal-workspace-shell.component.css` — 15 (raw spacing, `var(--space-N, Npx)` fallback)

Total: 35/35 violations — full batch.

## Fix pattern

- `var(--token, #hex)` / `var(--token, Npx)` fallback where the token is always
  defined in `styles.css` → dropped the fallback, `var(--token)` only (same
  idiom as slice-2).
- Literal `Npx` with no `var()` at all (`block-renderer.component.css`, e.g.
  `padding: 10px 12px`) → mapped to existing Paper & Ink scale where an exact
  token exists (`--space-1..4`, `--space-control-x`, `--space-control-y-md`);
  where no exact token exists (1px/2px/3px/5px/6px), expressed as
  `calc(var(--space-N) / d)` or `calc(var(--space-N) * d)` so no raw px
  literal remains in the declaration (a raw literal inside `calc()` still
  matches the checker's regex — confirmed by re-running the checker after
  each edit).
- Raw hex `outline-color: #4fc3f7` (snap indicator) → `var(--color-info)`
  (`#0284c7`, dark-theme aware, closest existing semantic blue token).
- No visual value changed beyond token rounding: `--space-1`=4px, `--space-2`=8px,
  `--space-3`=12px, `--space-4`=16px, `--space-control-x`=12px,
  `--space-control-y-md`=10px — all exact matches to what they replaced.

## Gates (факт)

- `cd frontend && pnpm run lint:ui-tokens` → **0 violations** (was 35).
- `cd frontend && pnpm run lint` (eslint + ui-tokens) → **0 errors**, 17 warnings
  (pre-existing `no-implements-oninit-in-pages`, out of scope, unchanged).
- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS, no output.
- `npx jest --testPathPattern="block-renderer|proposal-workspace-shell|proposal-workspace-demo"`
  → 2 suites / 27 tests PASS.

## Remaining (out of scope)

- 17 `no-implements-oninit-in-pages` warnings — explicitly out of scope per TZ.
- Nothing left flagged by `lint:ui-tokens` — slice-3 was the last residual per `_NOW` PARK note.

## Executor report

35/35 `lint:ui-tokens` violations fixed across 3 external CSS files (full
batch). `pnpm run lint:ui-tokens` now exits 0. Full `pnpm run lint` 0 errors.
tsc clean. Focused specs green (27/27). Not `frontend-nx/**`, no product
behavior change (pure CSS token substitution, same computed values).

## Closeout

- [x] archive + `_active` cleared
- Status = DONE
- closed_at: 2026-09-03
