# TZ-OPS-310 checklist — server harden (deploy gate)

> Status: **READY** (claim when VPN OFF / before next deploy)  
> Spec: `tasks/_backlog/ops/TZ-OPS-310-server-harden-before-deploy.md`  
> Marker: `tasks/_active/TZ-OPS-310.md` (создать при CLAIM)

## Claim slot

- agent_id: _(пусто)_
- claimed_at: _(пусто)_
- workspace: D:\kppdf-8.0
- vpn: OFF required
- team_room_claim: _(при старте)_

## Preflight

- [ ] Get-Location + git root → `D:\kppdf-8.0`
- [ ] `ping`/`ssh` VM `192.168.1.103` OK (VPN off)
- [ ] Jump VM → `root@193.222.62.240` OK
- [ ] Claim slot + `_active/TZ-OPS-310.md`
- [ ] Нет чужого CLAIM на nginx/CREDENTIALS

## Acceptance

- [ ] SUID/SGID inventory VPS + VM в `docs/ops/server-harden-evidence.md`
- [ ] Unexpected SUID cleared **or** REVIEW listed
- [ ] Listening ports noted; `:3000` не торчит в интернет
- [ ] Basic Auth: anon 401, authed 200 (пароль не в git)
- [ ] htpasswd `root:www-data` 640
- [ ] Tunnel health OK
- [ ] `preflight.ps1` gate на archive OPS-310
- [ ] README + RUNBOOK gate text
- [ ] Archive `tasks/_archive/2026-08/TZ-OPS-310.done.md` + lock
- [ ] commit+push; Deploy **не** запускался

## Integrity

- [ ] Секреты не в evidence/коммите
- [ ] Чужой FE/BE WIP не тронут
