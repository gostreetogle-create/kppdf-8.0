# TZ-FRONTEND-QA-APP-LAYOUT-FLAKY

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-03
closed_by: freebuff
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS (196 FE suites, 2091 tests; app-layout 9/9 ×3 isolated)
  - lint: N/A (test-only change, no new lint surface)
  - checklist: ADDED
  - progress.md: N/A (redirect journal; wave tracked in WAVE-QA-GATES-2026-09.md)
  - status synchronization: PASS (wave Q3 row → DONE)

## Outcome

Repaired the `app-layout.component.spec.ts` failure from audit `docs/audits/2026-09-03-qa-deep-test-audit.md` ТЗ-3.
The root cause was a stale assert in `TZ-UX-321-FIX`: it required the serialized component source to contain
literal `width: 64px`, but the rails were tokenized to `width: var(--spacing-16)` (`--spacing-16: 64px` in
`src/styles.css`) — the assert was false on every deterministic run, not order-dependent. The other symptom the
audit saw (`TZ-UX-317` «back called despite disabled») did not reproduce across 5 repeated runs — the file already
recreates TestBed/fixture and signals per `it`, clears mocks and chrome tools in `beforeEach`.

Fix: assert the tokenized rule `width: var(--spacing-16)` in the component source **and** assert the token value
`--spacing-16: 64px` in `src/styles.css` (jsdom cannot compute `var()` — probed and confirmed — so a computed-style
DOM assert is not viable here). No prod code was touched.

## Gates

- `cd frontend && pnpm exec jest --config jest.config.js --testPathPattern="app-layout.component.spec" --runInBand` — PASS ×3 (9/9).
- `cd frontend && pnpm test` — PASS: **196 suites passed, 2091 tests passed**.
- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` — PASS.

## Scope disclosure

Only `frontend/src/app/layout/app-layout.component.spec.ts` + wave/checklist records were owned by this TZ.
Prod `app-layout.component.ts` / `pi-chrome-tools.service.ts` untouched. Foreign dirty WIP was not staged.
