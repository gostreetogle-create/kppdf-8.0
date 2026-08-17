═══════════════════════════════════════════════════════════════
TZD-39: Desktop/MCP + nginx Basic Auth coexist — DONE
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-16
closed_by: executor (verify + closeout; code pre-landed on main)
acceptance_status: PASS (code + gates); deploy smoke deferred PO swarm
verification:
  - Nest JwtAuthGuard: pairing key from X-Access-Token or Bearer: PASS (jwt-auth.guard.ts L53–67)
  - Desktop api.ts: X-Access-Token + optional Authorization Basic: PASS (headersOf L52–62)
  - MCP backend.ts: X-Access-Token + KPPDF_HTTP_BASIC_USER/PASS: PASS (buildHeaders L35–45)
  - mcpHost.ts: basicAuth → KPPDF_HTTP_BASIC_* env: PASS (L265–268)
  - revoke = hard deleteOne; list active only (revokedAt null): PASS (desktop-pairing-key.service.ts)
  - Copy button adjacent to «Выпустить ключ»: PASS (pairing-dialog.component.ts L88–114)
  - backend tsc --noEmit: PASS
  - backend jest desktop-pairing: 7/7 PASS
  - frontend jest pairing-dialog: 7/7 PASS
  - desktop typecheck + mcp:check 114/114: PASS
  - Warm deploy BE+FE + Desktop publish: DEFERRED — satisfied-by-upcoming-swarm-deploy (PO VPN off)
  - Prod smoke Basic+X-Access-Token /api/auth/me: DEFERRED — PO swarm warm (not run by executor)
checklist: docs/agent-checklists/TZD-39.md
lock: .mimocode/locks/TZD-39-desktop-basic-auth-coexist.lock
source: tasks/_backlog/desktop/TZD-39-desktop-basic-auth-coexist.md
verified_sha: fd31ab5bc978d08dffc81c77bb1c81b9532c008b

## Что сделано (pre-landed; verified this closeout)

- BE: `JwtAuthGuard` prefers `X-Access-Token` for `kppd_` pairing keys so `Authorization` can stay HTTP Basic (nginx «подъезд»).
- Desktop: `api.ts` sends pairing key in `X-Access-Token`; optional Basic in `Authorization`; UI fields in `App.svelte` + persisted in `config.ts` v4.
- MCP: `backend.ts` mirrors SPA transport; `mcpHost.ts` injects `KPPDF_HTTP_BASIC_*` into child env.
- FE pairing: revoke hard-deletes key; list omits revoked; Copy next to Issue.
- Docs: `desktop/docs/PAIRING.md`, `desktop/docs/MCP.md`.

## Known limitation

- Prod smoke (Basic gate + valid kppd_ → 200 on `/api/auth/me`) requires warm deploy — PO swarm, not executor.
- Installed Desktop without this build still sends Bearer → fails behind nginx Basic until user updates app.
