# TZ-OPS-310 checklist — server harden (deploy gate)

> Status: **DONE**  
> Spec: `tasks/_backlog/ops/TZ-OPS-310-server-harden-before-deploy.md`  
> Archive: `tasks/_archive/2026-08/TZ-OPS-310.done.md`

## Claim slot

- agent_id: cursor-architect-ops
- claimed_at: 2026-08-11T00:13:00+03:00
- completed_at: 2026-08-11T00:25:00+03:00
- workspace: D:\kppdf-8.0
- vpn: OFF
- team_room_claim: n/a (Cursor session)

## Preflight

- [x] Get-Location + git root → `D:\kppdf-8.0`
- [x] `ssh` VM `192.168.1.103` OK (VPN off)
- [x] Jump VM → `root@193.222.62.240` OK (`box-946037`)
- [x] Claim slot + `_active/TZ-OPS-310.md` (removed on closeout)
- [x] Нет чужого CLAIM на nginx/CREDENTIALS

## Acceptance

- [x] SUID/SGID inventory VPS + VM в `docs/ops/server-harden-evidence.md`
- [x] Unexpected SUID cleared **or** REVIEW listed (`:4200` bind REVIEW; UFW blocks)
- [x] Listening ports noted; `:3000` не торчит в интернет
- [x] Basic Auth: anon 401, authed 200 (пароль не в git)
- [x] htpasswd `root:www-data` 640
- [x] Tunnel health OK
- [x] `preflight.ps1` gate на archive OPS-310
- [x] README + RUNBOOK gate text
- [x] Archive `tasks/_archive/2026-08/TZ-OPS-310.done.md` + lock
- [x] commit+push; Deploy **не** запускался

## Integrity

- [x] Секреты не в evidence/коммите
- [x] Чужой FE/BE WIP не тронут
