# TZ-NX-REGISTRIES-CATALOG-SPEC-FIX checklist

> Status: **DONE**
> Marker: `tasks/_archive/2026-09/TZ-NX-REGISTRIES-CATALOG-SPEC-FIX.done.md`
> Commit/push: completed by Freebuff/Buffy after gates

## Claim slot

- agent_id: freebuff (Buffy)
- claimed_at: 2026-09-05T08:03:36+03:00
- closed_at: 2026-09-05T08:12:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room CLI in environment)
- conflict keys: `frontend-nx/apps/kppdf-web/src/app/pages/registries/data/registries.catalog.spec.ts`

## Preflight Check Output

- **Context read:** `GEMINI.md`, `.agents/skills/kppdf-executor-loop/SKILL.md`, `.agents/skills/kppdf-context-preflight/SKILL.md`, `docs/PROJECT-MEMORY.md`, `docs/PO-CANON.md`, `docs/CONTEXT.md`, `docs/agent-checklists/WAVE-NX-GANTT-POLISH.md`, `tasks/_ready/nx-gantt/INDEX.md`, `tasks/_ready/nx-gantt/TZ-NX-REGISTRIES-CATALOG-SPEC-FIX.md`, `frontend-nx/apps/kppdf-web/src/app/pages/registries/data/registries.catalog.spec.ts`, `frontend-nx/apps/kppdf-web/src/app/pages/registries/data/registries.catalog.ts`.
- **Key Constraints:** test-only change; preserve `vat-rate` and `formulas`; no registry UX changes; no unrelated dirty files staged.
- **Planned Deliverable:** update expected catalog order; relax undefined `rowActions` assertion; run focused/full Jest and NX gates; archive and push.
- **Validation Path:** focused catalog spec, full `apps/kppdf-web` Jest, app typecheck, targeted ESLint, final NX build.

## Acceptance

- [x] `registries.catalog.spec.ts` 2/2 green.
- [x] Catalog factory retains `vat-rate` and `formulas` in factory order.
- [x] No registry UX or product-code change.

## Integrity slot (до READY / archive)

- [x] Тип изменения: other (test-only).
- [x] FIC/page/PAGE-TZ-INDEX/SECTION-READINESS: N/A — assertion-only change, no user-visible route change.
- [x] Чужой WIP не в коммите; conflict key соблюдён.
- [x] Coupling map: N/A — no shared field/status/filter change.
- [x] Канон: `docs/DOCS-INTEGRITY.md`.

## Build integrity

- [x] Baseline workspace state and active-task conflict check completed before code.
- [x] No other active TZ with this conflict key.
- [x] Final `cd frontend-nx && pnpm exec nx build kppdf-web` passed and was the last P1 gate command.

## Gates (fact)

- [x] Focused Jest: `cd frontend-nx && pnpm exec jest apps/kppdf-web/src/app/pages/registries/data/registries.catalog.spec.ts --runInBand` → PASS, 1 suite, 2/2 tests.
- [x] Full Jest: `cd frontend-nx && pnpm exec jest apps/kppdf-web --runInBand --silent` → PASS, 69/69 suites, 437 passed, 7 skipped.
- [x] App typecheck: `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → PASS.
- [x] Targeted lint: `cd frontend-nx && pnpm exec eslint apps/kppdf-web/src/app/pages/registries/data/registries.catalog.spec.ts` → PASS, 0 errors, 4 existing unused-import warnings.
- [x] Final build: `cd frontend-nx && pnpm exec nx build kppdf-web` → PASS.
- [x] Workspace `nx lint kppdf-web` → known baseline FAIL, 32 unrelated errors in existing Gantt/Studio sources; no error in the changed P1 assertion file.
- [x] `git diff --check` → PASS for P1-owned changes.

## Executor report

- Added `vat-rate` and `formulas` to the expected catalog key order.
- Changed the constructor-action check from strict `false` to `toBeFalsy()` so absent `rowActions` is accepted while a real action remains rejected.
- No changes to `registries.catalog.ts` or registry UX.
- Foreign dirty/untracked files were not staged.

## Closeout

- [x] Archive marker created.
- [x] Active and ready P1 task removed after archive.
- [x] WAVE P1 marked `[x]`.
- [x] Commit and push completed.
