# TZ-OPS-START-DIAGNOSTICS checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-OPS-START-DIAGNOSTICS.md` (removed after archive)
> Commit/push: executor closeout by `docs/GIT-POLICY.md`

## Claim slot

- agent_id: freebuff
- claimed_at: 2026-09-15T23:32:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI exposed)

## Preflight

- [x] Repository state checked; main; print commit completed first (`2cd9d100`).
- [x] `_NOW.md` + `tasks/_active/` checked; Claude's `TZ-NX-ORDER-WS-META-INLINE` has no overlap with ops keys.
- [x] Prompt, TZ, context, and start diagnostics scope read.
- [x] Claim slot filled; Status = CLAIMED / IN PROGRESS.
- [x] `tasks/_active/TZ-OPS-START-DIAGNOSTICS.md` existed before implementation.

### Preflight Check Output

- **Context read:** `tasks/_ready/PROMPT-FREEBUFF-PRINT-COMMIT-THEN-START-DIAG.md`, `tasks/_ready/2026-09-15-po-hotfix-wave/TZ-OPS-START-DIAGNOSTICS.md`, `docs/how-to-connect-ai.md`, `GEMINI.md`, `.agents/skills/kppdf-executor-loop/SKILL.md`, `docs/PROJECT-MEMORY.md`, `docs/PO-CANON.md`, `docs/agent-checklists/_NOW.md`, `tasks/_active/TZ-NX-ORDER-WS-META-INLINE.md`.
- **Key Constraints:** ops-only; no frontend/order-workspace/WAVE-GANTT-DARK; preserve ports 3000/4201; fix reuse truth, stage diagnostics, timeout dump, syntax check.
- **Planned Deliverable:** inspect launcher paths, patch minimally, validate with syntax/helper checks, archive and commit only start/docs.
- **Validation Path:** `node --check start.mjs`, launcher helper smoke, diff and integrity review.

## Acceptance

- [x] Stale `frontendReused` is revalidated with HTTP/html probe and respawned when invalid.
- [x] Frontend wait logs stage + last evidence on periodic ticks.
- [x] Timeout emits last 20 frontend log lines, pid/port status, and recovery hint.
- [x] Existing happy path/ports are preserved; no deploy or frontend product files touched.
- [x] Gates, archive, and ops-only commit recorded.

## Integrity slot (до READY / archive)

- [x] Type = other / ops tooling.
- [x] FIC §A–E: N/A except ops documentation; no product route/API/permission.
- [x] Page docs / DOMAIN-MAP / SECTION-READINESS / Coupling map: N/A.
- [x] `docs/how-to-connect-ai.md` updated with launcher log/stage one-liner.
- [x] Foreign WIP and Claude conflict keys excluded.
- [x] `docs/DOCS-INTEGRITY.md` reviewed.

## Gates (fact)

- `node --check start.mjs` → PASS, exit 0.
- Launcher helper smoke (`shouldReuseFrontendOnPort` + `evaluateFrontendProbe`) → PASS, exit 0.
- `git diff --check` → PASS, exit 0.
- Frontend/backend tests and deploy → N/A: ops-only TZ; no product UI/API changed.

## Executor report (auto)

- **Result:** stale `frontendReused` is invalidated during frontend wait when port or HTML probe fails, then the existing direct Nx spawn path is invoked and PID metadata refreshed.
- **Diagnostics:** periodic frontend ticks now show elapsed seconds, `stage=spawn|compiling|listening|http-up|ready|reuse-stale`, and the latest frontend log line.
- **Timeout:** frontend failure prints the last 20 `.logs/launcher-frontend.log` lines, PID, port LISTEN state, and `--stop`/`--nx` recovery hint.
- **Docs/scope:** added one operational paragraph to `docs/how-to-connect-ai.md`; no `frontend-nx/**`, order-workspace, WAVE-GANTT-DARK, deploy, or backend app logic touched.

## Closeout

- [x] archive + lock + remove `_active`
- [x] Status = DONE
- closed_at: 2026-09-15
