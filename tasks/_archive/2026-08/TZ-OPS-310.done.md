# TZ-OPS-310.done — server harden (deploy gate)

ARCHIVE_MARKER: DONE
Date: 2026-08-11
Agent: cursor-architect-ops
Workspace: D:\kppdf-8.0

## Summary
VPN OFF preflight OK. Inventory SUID/SGID on VPS (`box-946037`) and VM (`ubuntuserver`); no unexpected bits stripped (sudo.ws / sudo-rs = package). Ports: VPS 22/80/443 via UFW; :4200 listen but UFW-closed. Basic Auth anon 401 / authed 200. htpasswd root:www-data 640. Tunnel + LAN health 200.

## Evidence
`docs/ops/server-harden-evidence.md`

## Deploy
`deploy.ps1` **not** run. Next: PO says «деплой» for warm update (WIPE=false).

## Lock
`.mimocode/locks/TZ-OPS-310-server-harden.lock`
