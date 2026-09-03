# TZ-FRONTEND-QA-LINT-RAW-UI-SLICE-2 — DONE

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-03
closed_by: claude
verification:
  - acceptance criteria: PASS
  - eslint (kppdf-frontend-architecture/no-raw-ui-values): PASS — 35/35 errors fixed, 0 remaining
  - typecheck: PASS via `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`
  - tests: PASS — 6 focused spec suites / 70 tests
  - lint (full `pnpm lint`): eslint stage now PASS; `lint:ui-tokens` stage still fails on
    35 pre-existing, unrelated external-CSS violations (3 files, confirmed present at
    baseline `305eec58` before this TZ) — PARK for slice-3, out of this TZ's scope

10 files with raw px spacing / raw hex color fallbacks in inline component
`styles:` fixed — full remaining batch (not Q4b/slice-1 `fb1fced5`, not
`frontend-nx/**`). Raw px → `--space-N` token scale (`calc()` combinations for
non-scale values, matching the Q4b idiom). Raw hex → dropped dead `var(--x,
#hex)` fallbacks since the token is always defined in `frontend/src/styles.css`.
No new hex/px, no visual value changes.

Details: `docs/agent-checklists/TZ-FRONTEND-QA-LINT-RAW-UI-SLICE-2.md`
