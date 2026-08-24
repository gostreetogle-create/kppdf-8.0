# PRE-DEPLOY — PO smoke wave (2026-08-24 evening)

**deploy_sha_target:** `565c630d0ba94b00b4e3b4890b366e4f6e09cf5e`  
**prepared_at:** 2026-08-24T23:52:00+03:00  
**prepared_by:** cursor-orchestrator  
**PO smoke:** skipped (PO request — deploy prep only)

## Gates on HEAD

| Gate | Result |
|------|--------|
| FE tsc | PASS |
| BE tsc | PASS |
| FE supply-quick-order + related | PASS (62 focused) |
| supply.page.spec | PASS (6) |
| BE supply-gate (pre-commit) | PASS |
| supply-smoke.mjs (stand :3000) | PASS 23/23 |
| FE full jest | 56 fail / 1980 pass (baseline debt) |
| BE full jest | 2 fail (baseline debt) |
| architecture:check | 2 violations (page cross-import) |

## Wave contents

- SUPPLY-431: 3-col quick order, org promote, PiSelectAddRow
- KP: BIND-513/514 substitutions, recipient +, builder refresh
- DESK-433/434/435, PHOTO-304, dev build badge
- Docs/archives: WAVE-PO-SMOKE, AUDIT-530 checklist

## §F deploy

Not run (prep only). PO: «сделай деплой по документации» → `deploy/synology/README.md`.

## Preflight

- VPN off before deploy
- Warm `deploy.ps1` only (no `-Wipe`)
- SSH 192.168.1.103:22 when on LAN
