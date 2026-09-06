# TZ-NX-HOTFIX-SHELL-WAREHOUSE-POPULATE checklist

> Status: **DONE** (WIP verified and completed by executor)
> TZ: `tasks/_ready/nx-warehouse/TZ-NX-HOTFIX-SHELL-WAREHOUSE-POPULATE.md`
> Audit: `docs/audits/2026-09-06-qa-shell-warehouse-populate-audit.md`

## Claim slot

- agent_id: freebuff
- claimed_at: 2026-09-06T10:16:08+03:00
- workspace: D:\\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI exposed in this executor)

## Preflight

- [x] `git status --short`, `git branch --show-current`, `git worktree list --porcelain` checked
- [x] `_NOW.md` + `tasks/_active/` checked; no conflicting active claim at claim time
- [x] TZ, PO canon, project memory, context preflight, page docs and audit read
- [x] Claim slot filled; Status = CLAIMED / IN PROGRESS before code verification
- [x] `tasks/_active/TZ-NX-HOTFIX-SHELL-WAREHOUSE-POPULATE.md` created

### Preflight Check Output

- **Context read:** `docs/how-to-connect-ai.md`, `GEMINI.md`, `.agents/skills/kppdf-executor-loop/SKILL.md`, `.agents/skills/kppdf-context-preflight/SKILL.md`, `docs/PROJECT-MEMORY.md`, `docs/PO-CANON.md`, `docs/CONTEXT.md`, `docs/agent-checklists/_NOW.md`, `docs/audits/2026-09-06-qa-shell-warehouse-populate-audit.md`, `docs/pages/nx-shell.page.md`, `docs/pages/stock-movements.page.md`, `docs/pages/storage-items.page.md`
- **Key Constraints:** Claim + conflict keys; verify existing WIP only; no legacy UI, wipe, seed cleanup, DocStudio layout, or чужой WIP
- **Planned Deliverable:** verify four conflict-key diffs; add the missing StorageItem detail warehouse populate; run backend tsc and focused tests; run NX build last; archive and commit only owned paths
- **Validation Path:** hotfix acceptance criteria; backend tsc; focused Jest; changed-file ESLint; `nx build kppdf-web` last; Integrity slot

## Acceptance

- [x] NX operational shell and `/kit` headers have no `pi-edge-bleed`; brand is not clipped
- [x] StockMovement list populates product/material/from-warehouse/to-warehouse with `options.includeSoftDeleted: true`
- [x] StorageItem list and `findById` populate product/material/warehouse with `options.includeSoftDeleted: true`
- [x] Kit footer typography strings are Hanken Grotesk, Inter, and JetBrains Mono
- [x] Hard-deleted refs remain a known limitation; no wipe was used
- [x] Backend tsc PASS
- [x] Focused backend and NX shell tests PASS
- [x] `nx build kppdf-web` PASS
- [x] commit/push SHA: `c413bef7` (implementation + closeout commit)
- [x] archive + lock created; `_active` cleared

## Integrity slot (до READY / archive)

- [x] Type: page/UI shell + existing backend list behavior; no new route/module/permission/MCP
- [x] FIC §A–E: N/A for new route/permission/module/MCP; existing warehouse list behavior only
- [x] page.md: `docs/pages/nx-shell.page.md`, `docs/pages/stock-movements.page.md`, and `docs/pages/storage-items.page.md` updated
- [x] PAGE-TZ-INDEX: N/A — no route or page inventory change
- [x] DOMAIN-MAP §1.2/§1.4: N/A — no module/route contour change
- [x] SECTION-READINESS: N/A — no user-contour change
- [x] Foreign WIP excluded; only conflict keys and related files are intended for commit
- [x] Coupling map: N/A — no shared status/filter/FK semantics changed
- [x] Canon: `docs/DOCS-INTEGRITY.md`

## Gates / evidence

- [x] `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` — PASS, exit 0
- [x] `cd backend && pnpm test -- --runInBand src/modules/storage-item/storage-item.controller.spec.ts` — PASS, 4 tests
- [x] `cd frontend-nx && pnpm exec jest --config apps/kppdf-web/jest.config.ts apps/kppdf-web/src/app/layout/app-shell.component.spec.ts --runInBand` — PASS, 18 tests
- [x] Changed-file ESLint (backend + frontend-nx) — PASS, exit 0
- [x] `git diff --check` — PASS, exit 0
- [x] `cd frontend-nx && pnpm exec nx build kppdf-web` — PASS, exit 0; known pre-existing Studio NG8102 and Gantt style-budget warnings

## Executor report (auto)

- Hotfix A verified and closed from the pre-existing WIP; added only the missing StorageItem detail `warehouseId` soft-delete populate required by the TZ acceptance criteria.
- Conflict disclosure: the working tree contains unrelated dirty WIP; no unrelated paths are staged.
- Known limitation: hard-deleted references can still render as `—`; local demo orphan cleanup is TZ-OPS-LOCAL-DEMO-ORPHAN-CLEAN (B).
- Implementation commit SHA: `c413bef7`.

## Closeout

- [x] archive created: `tasks/_archive/2026-09/TZ-NX-HOTFIX-SHELL-WAREHOUSE-POPULATE.done.md`
- [x] lock created: `.mimocode/locks/TZ-NX-HOTFIX-SHELL-WAREHOUSE-POPULATE.done.lock`
- [x] active marker cleared after archive
- [x] Status = DONE
- closed_at: 2026-09-06
