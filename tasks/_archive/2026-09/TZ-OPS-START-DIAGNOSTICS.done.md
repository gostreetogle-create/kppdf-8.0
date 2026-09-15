# TZ-OPS-START-DIAGNOSTICS — DONE

- **Status:** DONE
- **Agent:** freebuff
- **Closed:** 2026-09-15

## Delivered

- Fixed false `frontendReused`: during frontend wait, a reused :4201 server is rechecked for port and healthy Angular HTML; stale reuse logs `REUSE INVALID → spawn`, clears reuse state, starts the existing Nx child path, and refreshes PID metadata.
- Added periodic frontend wait diagnostics with `stage=` and the latest log line.
- Added timeout dump with the last 20 frontend log lines, PID, port LISTEN state, and recovery hint.
- Added the operational launcher troubleshooting note to `docs/how-to-connect-ai.md`.

## Gates

- `node --check start.mjs` → PASS, exit 0.
- Launcher helper smoke → PASS, exit 0.
- `git diff --check` → PASS, exit 0.
- Frontend/backend product gates → N/A: ops-only TZ.

## Scope disclosure

Only `start.mjs`, `docs/how-to-connect-ai.md`, this checklist, and this archive belong to this TZ. Claude's `TZ-NX-ORDER-WS-META-INLINE`, all `frontend-nx/**`, order-workspace, WAVE-GANTT-DARK, and deploy paths were excluded.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-15
closed_by: freebuff
verification:
  - acceptance criteria: PASS
  - typecheck: N/A (JavaScript ops launcher)
  - tests: PASS (launcher helper smoke)
  - lint: N/A (no launcher lint script)
  - node syntax: PASS
  - checklist: ADDED and completed
  - progress.md: N/A (redirect-only; live state in _NOW)
  - status synchronization: PASS
