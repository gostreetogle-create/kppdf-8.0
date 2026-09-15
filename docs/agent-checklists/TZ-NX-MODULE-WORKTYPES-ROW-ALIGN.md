# TZ-NX-MODULE-WORKTYPES-ROW-ALIGN checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-MODULE-WORKTYPES-ROW-ALIGN.md` (removed after archive)
> Commit/push: executor closeout by `docs/GIT-POLICY.md`

## Claim slot

- agent_id: freebuff
- claimed_at: 2026-09-15T22:00:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI exposed)

## Preflight

- [x] `D:\kppdf-8.0`, branch `main`, worktree and dirty paths checked.
- [x] `_NOW.md` and `tasks/_active/` checked; stale Claude claim had no code and no competing active key remained.
- [x] TZ, module form files, context preflight, docs integrity, and module page path read.
- [x] Baseline `cd frontend-nx && pnpm exec nx build kppdf-web` PASS before code.
- [x] Claim slot filled before product code.

### Preflight Check Output

- **Context read:** `tasks/_ready/2026-09-15-po-hotfix-wave/TZ-NX-MODULE-WORKTYPES-ROW-ALIGN.md`, `frontend-nx/libs/features/src/lib/registry-forms/ui/module-form-dialog.component.ts`, `frontend-nx/libs/features/src/lib/registry-forms/ui/module-form-dialog.component.spec.ts`, `docs/pages/modules.page.md`, `.agents/skills/kppdf-context-preflight/SKILL.md`, `docs/DOCS-INTEGRITY.md`.
- **Key Constraints:** module-form-only; preserve facade/seed behavior; one aligned row; remove row eyebrow; keep hint/add above rows; no order-workspace or dark-theme files.
- **Planned Deliverable:** align row controls, add focused DOM assertions, run focused test/type/lint, build last, archive and commit only owned files.
- **Validation Path:** focused features test + app typecheck/lint + `nx build kppdf-web` last; integrity N/A for routes/domain.

## Acceptance

- [x] Work type row is one aligned compact line using `items-center`.
- [x] `Вид работы` eyebrow removed while select aria-label remains.
- [x] Gantt hint and add button remain above rows.
- [x] Focused spec covers row alignment, aria labels, and absence of eyebrow.

## Integrity slot (до READY / archive)

- [x] Type: page UI polish / other; no route/API/permission change.
- [x] FIC §A–E: N/A, no route/permission/module/API contract change.
- [x] `docs/pages/modules.page.md`: no semantic route change; N/A.
- [x] DOMAIN-MAP / SECTION-READINESS / Coupling map: N/A.
- [x] Foreign WIP and conflict keys excluded.
- [x] `docs/DOCS-INTEGRITY.md` reviewed.

## Build integrity

- [x] Baseline `nx build kppdf-web` PASS before code.
- [x] Final `nx build kppdf-web` PASS and was the last code gate.

## Gates (fact)

- `pnpm exec jest --config libs/features/jest.config.ts libs/features/src/lib/registry-forms/ui/module-form-dialog.component.spec.ts --runInBand` → PASS, 15/15.
- `pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → PASS.
- `pnpm exec nx lint features` → baseline FAIL: existing 28 boundary errors and 208 warnings; no new errors attributable to this change beyond existing module-form boundary violation.
- `pnpm exec nx build kppdf-web` → PASS, exit 0 (last gate).
- `git diff --check` → baseline FAIL from foreign dirty docs whitespace; owned code diff reviewed separately.

## Executor report

- Replaced the work-type row's mixed label/form-field layout with a compact centered grid row.
- Kept accessible labels through select `aria-label` and `app-pi-input` `ariaLabel`; preserved form controls and facade behavior.
- Kept Gantt hint and add CTA above the rows.
- Scope excludes order-workspace, composition, hairline utilities, dark theme, and foreign WIP.

## Closeout

- [x] archive + lock + remove `_active`
- [x] Status = DONE
- closed_at: 2026-09-15
