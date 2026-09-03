# Checklist: TZ-FRONTEND-QA-APP-LAYOUT-FLAKY

**TZ:** `tasks/TZ-FRONTEND-QA-APP-LAYOUT-FLAKY.md`
**Status:** DONE

## Claim slot

- agent_id: freebuff
- claimed_at: 2026-09-03T08:00:00Z
- branch: `main`
- baseline_sha: 41cfcde0
- workspace: D:\kppdf-8.0

## Steps

- [x] Isolate fixture/state per it
- [x] Fix 321-FIX assert if needed
- [x] 3× isolated + full suite app-layout green
- [x] tsc PASS
- [x] Archive + commit

## Acceptance

- [x] Isolated и whole-suite: app-layout suite PASS (3× isolated 9/9; full FE suite 196/196)
- [x] `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` PASS

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: other (test-only — stale styling assert updated; no prod code, no UI change)
- [x] FIC §A–E: N/A — только тестовая инфраструктура; прод `app-layout.component.ts` и `pi-chrome-tools.service.ts` не менялись
- [x] page.md / PAGE-TZ-INDEX: N/A (нет UI route)
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (`app-layout.component.spec.ts`)
- [x] Coupling map: N/A (общее поле/статус не тронуты)
- [x] Канон: docs/DOCS-INTEGRITY.md

## Evidence

- Root cause: `TZ-UX-321-FIX` asserted the serialized component source contains `'width: 64px'`, but the rails were tokenized to `width: var(--spacing-16)` (64px per `src/styles.css` line 334) — the assert was stale by construction, so it failed on every deterministic run. Audit's «порядко-зависимость» was two different symptoms (stale assert vs click-leak), only one of which reproduces.
- Fix: assert `width: var(--spacing-16)` in the component source + assert the token resolves to 64px (`--spacing-16: 64px`) in `src/styles.css`. jsdom cannot resolve `var()` into computed width (probed: returns empty string), so computed-style DOM asserts are not viable — token-level assert is deterministic.
- No state-leak fix needed: `beforeEach` already recreates TestBed/fixture, re-signals `canGoBack/Forward`, `jest.clearAllMocks()`, and clears chrome tools (`production-cockpit`, `spec-owner`) before each `it`; 5× repeated runs showed no order dependence.
- `pnpm exec jest --config jest.config.js --testPathPattern="app-layout.component.spec" --runInBand` ×3 → PASS 9/9.
- `cd frontend && pnpm test` → **196 suites / 2091 tests PASS** (audit: 1 suite / 1 test red → now green).
- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS.

## Executor report

- Prod code untouched (no visual layout change for the sake of the test). Only the spec's stale literal assert was repaired.
