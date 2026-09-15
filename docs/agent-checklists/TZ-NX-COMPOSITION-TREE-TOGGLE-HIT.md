# TZ-NX-COMPOSITION-TREE-TOGGLE-HIT checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-COMPOSITION-TREE-TOGGLE-HIT.md` (removed after archive)
> Commit/push: executor closeout by `docs/GIT-POLICY.md`

## Claim slot

- agent_id: freebuff
- claimed_at: 2026-09-15T22:05:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI exposed)

## Preflight

- [x] Repository, branch, worktree, dirty paths and active keys checked.
- [x] Prior module TZ archived/committed as `9ff1563d`; composition conflict keys free.
- [x] Source TZ, composition tree, order workspace composition, focused specs, context and integrity docs read.
- [x] Baseline `nx build kppdf-web` PASS before wave code.
- [x] Claim slot filled before product code.

### Preflight Check Output

- **Context read:** `tasks/_ready/2026-09-15-po-hotfix-wave/TZ-NX-COMPOSITION-TREE-TOGGLE-HIT.md`, `frontend-nx/libs/features/src/lib/composition/ui/composition-tree.component.ts`, `frontend-nx/libs/features/src/lib/composition/ui/composition-tree.component.spec.ts`, `frontend-nx/libs/features/src/lib/order-workspace/ui/order-ws-composition.component.ts`, `.agents/skills/kppdf-context-preflight/SKILL.md`, `docs/DOCS-INTEGRITY.md`.
- **Key Constraints:** selectedId-null tree must toggle open/closed; row hit remains honest; product line title toggles tree but qty/ready/delete controls remain independent; no BOM/API changes and no dark-theme files.
- **Planned Deliverable:** inspect handlers/templates, add red-green focused assertions, implement minimal toggle/hit changes, run focused tests/typecheck/lint, build last, archive and commit owned files.
- **Validation Path:** composition tree and order workspace specs, app typecheck, lint baseline review, final `nx build kppdf-web`.

## Acceptance

- [x] selectedId=null: first row click opens, second same row click closes.
- [x] Tree name/kind row hit toggles same state; row hit remains `min-h-11`, chevron hit is `w-9 h-9`.
- [x] Order composition line title/chevron is one expansion hit target; qty/ready remain separate.

## Integrity slot (до READY / archive)

- [x] Type: page UI polish / other; no route/API/permission change.
- [x] FIC §A–E: N/A; no route, API, permission, or domain contour change.
- [x] Page/domain/section/coupling docs: N/A.
- [x] Foreign WIP and conflict keys excluded.
- [x] `docs/DOCS-INTEGRITY.md` reviewed.

## Build integrity

- [x] Baseline `nx build kppdf-web` PASS.
- [x] Final `nx build kppdf-web` PASS and was last code gate.

## Gates (fact)

- Focused composition/tree + order workspace specs → **7/7 PASS**.
- `pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → PASS.
- `pnpm exec nx lint features` → baseline FAIL: existing 28 boundary errors and 208 warnings.
- `pnpm exec nx build kppdf-web` → PASS, exit 0 (last gate).

## Executor report

- Composition tree now toggles by current expansion state, independent of `selectedId`.
- Tree chevron hit area is `w-9 h-9`; row remains `min-h-11`; name/kind row clicks use the same toggle handler.
- Order workspace product line chevron and title share a single `min-h-11` expansion button; qty and ready controls remain independent.
- No BOM/API writes, dark-theme files, or unrelated dirty work were touched.

## Closeout

- [x] archive + lock + remove `_active`
- [x] Status = DONE
- closed_at: 2026-09-15
