# TZ-OPS-DOCS-HOST-52-SYNC: live ops-доки `.103` → `.52`

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-13
closed_by: claude
verification:
  - acceptance criteria: PASS (2/2)
  - gates: N/A (docs-only), rg verification PASS (0 matches in 4 touched files)
  - checklist: `docs/agent-checklists/TZ-OPS-DOCS-HOST-52-SYNC.md` + evidence/
  - status synchronization: PASS (WAVE-2026-09-13-STUDIO-OPS.md updated)

## Fix

Replaced stale `192.168.1.103` with the canon `192.168.1.52` (per `deploy/synology/*`
since commit `842275a5`) in `docs/ops/home-host-access.md` (×3),
`docs/ops/PROMPT-ACCESS-METHOD-DEBATE.md` (×1), `docs/ops/RUNBOOK-CLEAN-SYNLOGY-KP3-LOAD.md`
(×1). Replaced `deploy/synology/CREDENTIALS.example.md`'s bare cloudflared/kppdf-3.0
mention with an explicit legacy note pointing to the real v8 canon (SSH reverse tunnel,
systemd `kppdf-tunnel`, see `DEPLOY.md`).

Historical evidence (`docs/ops/server-harden-evidence.md`, `AUDIT-CONNECT-2026-08-02.md`)
intentionally left untouched per the TZ's own instruction.

## Files changed

- `docs/ops/home-host-access.md`
- `docs/ops/PROMPT-ACCESS-METHOD-DEBATE.md`
- `docs/ops/RUNBOOK-CLEAN-SYNLOGY-KP3-LOAD.md`
- `deploy/synology/CREDENTIALS.example.md`
- `docs/agent-checklists/TZ-OPS-DOCS-HOST-52-SYNC.md` + `evidence/TZ-OPS-DOCS-HOST-52-SYNC.txt` (new)
