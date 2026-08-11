# TZ-OPS-312 checklist

> Status: **DONE**
> Marker: `tasks/_archive/2026-08/TZ-OPS-312.done.md`
> Commit/push: **YES** per TZ; deploy: **NO**

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: `buffy-ops-312`
- claimed_at: `2026-08-11T17:37:41Z`
- workspace: `D:\kppdf-8.0` (Freebuff worktree; `HEAD == origin/main` at claim)
- team_room_claim: `unavailable` — Team Room joined, but task registry has not synced TZ-OPS-312

## Preflight

- [x] Get-Location + git rev-parse → worktree root under `D:\kppdf-8.0`; `HEAD == origin/main` (`f8c55ae965bf4e792a9ee251b0eb3dc8a33bcd18`)
- [x] Read `_active-map.md` + all `tasks/_active/` — no existing active marker or conflicting claim
- [x] TZ / canon / dependencies read; TZ-DICT-320 and TZ-OPS-311 are DONE
- [x] Claim slot filled; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-OPS-312.md` created
- [x] Team Room joined; claim attempted and unavailable because task registry is unsynced

## Acceptance

- [x] Products page spec closes dictionary-label GET requests with array-shaped labels.
- [x] Module-detail page spec closes dictionary-label GET requests with array-shaped labels and never poisons them with `{}`.
- [x] Products suite passes: 21/21.
- [x] Module-detail suite passes all four tests consecutively: 4/4.
- [x] Combined two-suite Jest command passes: 25/25.
- [x] Frontend app typecheck passes.
- [x] ESLint passes; Prettier code style passes with `--end-of-line crlf` matching the repository checkout (default LF check reports only the existing CRLF working-tree mismatch).
- [x] Diff contains only the two conflict-key specs plus board/checklist/archive/lock closeout.
- [x] Deploy is not run.

## Integrity slot (до READY / archive)

- [x] Тип изменения: **other** — test harness/spec-only; no product behavior or route change.
- [x] FIC §A–E: N/A — no new page, permission, module, API, or MCP capability.
- [x] page.md / PAGE-TZ-INDEX: N/A — fix-only specs; page behavior unchanged.
- [x] SECTION-READINESS: N/A — no user-visible section behavior changed.
- [x] Чужой WIP не в коммите; conflict keys соблюдены.
- [x] Канон: `docs/DOCS-INTEGRITY.md`.

## Gates (факт)

- `cd frontend && pnpm exec jest pages/products/products.page.spec.ts --no-coverage --runInBand` — PASS (21/21)
- `cd frontend && pnpm exec jest pages/modules/module-detail.page.spec.ts --no-coverage --runInBand` — PASS (4/4)
- `cd frontend && pnpm exec jest pages/modules/module-detail.page.spec.ts pages/products/products.page.spec.ts --no-coverage --runInBand` — PASS (25/25)
- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` — PASS
- `cd frontend && pnpm exec prettier --check --end-of-line crlf src/app/pages/products/products.page.spec.ts src/app/pages/modules/module-detail.page.spec.ts` — PASS
- `cd frontend && pnpm exec eslint src/app/pages/products/products.page.spec.ts src/app/pages/modules/module-detail.page.spec.ts` — PASS
- `git diff --check` — PASS

## Executor report

- Primary signal: both catalog page-spec suites are green with valid dictionary-label response shapes.
- Scope: specs only; production pages/services/BOM untouched.
- Known limits: other page-specs with leftover `flush({})` are out of scope; authenticated browser smoke is not applicable.
- `bash OrchestratorKit/verify-status.sh` — FAIL on 72 pre-existing historical FWD archive/STATUS mismatches; no OPS-312-specific mismatch was reported.

## Review handoff

- [x] READY FOR REVIEW evidence recorded in archive/checklist; no separate Cursor visual verdict required for fix-only specs.
- [x] Archive created after gates; no product UI review was applicable.

## Closeout (после PASS)

- [x] Archive + lock + progress + remove `_active`
- [x] Status = DONE
- closed_at: `2026-08-11T17:45:00Z`
