# TZ-NX-HAIRLINE-EDGE-UTILS checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-HAIRLINE-EDGE-UTILS.md` (removed after archive)
> Commit/push: executor closeout by `docs/GIT-POLICY.md`; commit contains only owned CSS/docs paths.

## Claim slot

- agent_id: freebuff
- claimed_at: 2026-09-15T22:10:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI exposed)

## Preflight

- [x] Repository, branch, worktree, dirty paths and active keys checked.
- [x] Module and composition TZs archived/committed as `9ff1563d` and `ef8ce668`; hairline conflict key free.
- [x] Source TZ, global Paper & Ink CSS, consumers, context and integrity docs read.
- [x] Baseline `nx build kppdf-web` PASS before wave code.
- [x] Claim slot filled before product code.

### Preflight Check Output

- **Context read:** `tasks/_ready/2026-09-15-po-hotfix-wave/TZ-NX-HAIRLINE-EDGE-UTILS.md`, `frontend-nx/libs/ui/paper-and-ink/src/styles/global.css`, `docs/PO-CANON.md`, `.agents/skills/kppdf-context-preflight/SKILL.md`, `docs/DOCS-INTEGRITY.md`.
- **Key Constraints:** add only `hairline-top` / `hairline-bottom` beside existing utilities; use `--color-rule`; preserve `hairline`; no dark-theme redesign or consumer churn.
- **Planned Deliverable:** add utilities, verify consumer grep and CSS smoke, run focused build/type checks, build last, archive and commit owned paths.
- **Validation Path:** CSS inspection/grep + frontend typecheck + final `nx build kppdf-web`; integrity N/A for route/domain.

## Acceptance

- [x] `hairline-top` and `hairline-bottom` exist as real utilities.
- [x] Utilities use 1px solid longhands with `var(--color-rule)` and therefore work with light/dark rule tokens.
- [x] Existing `hairline`, `hairline-t`, and `hairline-b` semantics unchanged; grep recorded 1 `hairline-top` definition and 30 `hairline-bottom` consumer/definition matches.

## Integrity slot (до READY / archive)

- [x] Type: other / shared UI utility; no route/API/permission change.
- [x] FIC §A–E: N/A; no page route or domain contract change.
- [x] Page/domain/section/coupling docs: N/A.
- [x] Foreign WIP and conflict keys excluded.
- [x] `docs/DOCS-INTEGRITY.md` reviewed.

## Build integrity

- [x] Baseline `nx build kppdf-web` PASS.
- [x] Final `nx build kppdf-web` PASS and was last code gate.

## Gates (fact)

- `pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → PASS.
- `pnpm exec nx lint paper-and-ink` → PASS, 0 errors / 41 existing warnings.
- CSS utility grep → PASS: definitions present; 30 `hairline-bottom` matches in consumers + definition.
- `pnpm exec nx build kppdf-web` → PASS, exit 0 (last gate).

## Executor report

- Added `hairline-top` and `hairline-bottom` aliases beside the existing short edge utilities.
- Used longhand border declarations so color overrides remain reliable and `--color-rule` remains the source token.
- No consumer churn, dark-theme files, Gantt files, or unrelated WIP touched.

## Closeout

- [x] archive + lock + remove `_active`
- [x] Status = DONE
- closed_at: 2026-09-15
