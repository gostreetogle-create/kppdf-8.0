# TZ-VERIFY-2026-09-16-DARK-GANTT-SMOKE checklist

> Status: **DONE**
> Marker: archived as `tasks/_archive/2026-09/TZ-VERIFY-2026-09-16-DARK-GANTT-SMOKE.done.md`

## Claim slot

- agent_id: freebuff
- claimed_at: 2026-09-16T12:00:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room CLI in executor)

## Preflight

- [x] Workspace/branch/worktrees reviewed: `D:\kppdf-8.0`, `main`.
- [x] `_NOW.md` + `tasks/_active/` checked; no conflicting claim was present before this task.
- [x] TZ, dark-theme audit, Paper & Ink tokens, and executor contracts read.
- [x] Claim slot filled before any product-code change; no product code was changed.
- [x] Active marker created before verification.

### Preflight Check Output

- **Context read:** `docs/how-to-connect-ai.md`, `GEMINI.md`, `.agents/skills/kppdf-executor-loop/SKILL.md`, `.agents/skills/kppdf-context-preflight/SKILL.md`, `docs/PROJECT-MEMORY.md`, `docs/PO-CANON.md`, `docs/agent-checklists/_NOW.md`, `docs/audits/2026-09-15-dark-theme-pro-zip.md`, `docs/DARK-THEME.md`, `frontend-nx/libs/ui/paper-and-ink/src/styles/global.css`.
- **Key Constraints:** live verification first; dark ON; no palette redesign; no deploy; only minimal in-scope fix on reproduced failure.
- **Planned Deliverable:** verify shell, production sort/group modes, DocStudio desk/A4, and hairlines; record evidence; archive and commit.
- **Validation Path:** browser smoke where server is available; focused Gantt tests; baseline build; docs integrity/review.

## Acceptance

- [x] Dark mode enabled in live NX preview.
- [x] Soft-gray dark typography and canvas tokens observed (`#C9D1D9` / `#0C0E14`).
- [x] Shell/production/studio authenticated checks attempted and recorded as WARN because `/api/auth/login` returned 500.
- [x] Focused Gantt tests confirm order/date sorting, worker grouping, unassigned expansion/hint, and theme-aware wash behavior.
- [x] Hairline utility and representative consumers verified.
- [x] Smoke audit includes step / verdict / note table and final verdict.
- [x] No in-scope failure was reproducible; no code fix made.

## Integrity slot

- [x] Type: `docs-only` verification record; no product code changed.
- [x] FIC §A–E: N/A — no route, permission, module, backend, or MCP change.
- [x] page.md / PAGE-TZ-INDEX: N/A — no UI behavior change.
- [x] DOMAIN-MAP: N/A — no route/module change.
- [x] SECTION-READINESS: N/A — verification only.
- [x] Foreign WIP not staged; conflict keys respected.
- [x] Coupling map: N/A — no shared field/status change.
- [x] Canon: `docs/DOCS-INTEGRITY.md`.

## Build integrity

- [x] Baseline `cd frontend-nx && pnpm exec nx build kppdf-web` — PASS, exit 0.
- [x] No active task conflicted with this verification before claim.
- [x] No FE fix was made, so closing build gate was not required beyond the passing baseline.

## Gates (fact)

- `pnpm exec nx build kppdf-web` — PASS, exit 0.
- Focused Gantt Jest command — PASS, 2 suites / 62 tests.
- Live NX preview — reachable; login API — WARN/500, authenticated smoke blocked.
- Final verdict — WARN; see `docs/audits/2026-09-16-dark-gantt-smoke.md`.

## Executor report

Dark token and focused Gantt behavior checks are green. Authenticated shell, `/production`, and DocStudio eye checks were not possible because the local backend was not listening and login returned HTTP 500. No product code was changed; no new palette or deploy was attempted.

## Closeout

- [x] Audit written.
- [x] Integrity slot completed.
- [x] Archive + lock completed.
- [x] Active marker removed.
- closed_at: 2026-09-16T12:20:00+03:00
