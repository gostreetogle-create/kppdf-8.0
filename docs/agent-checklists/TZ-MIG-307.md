# TZ-MIG-307 checklist

> Status: **BLOCKED**
> Spec: `tasks/_archive/2026-08/TZ-MIG-307.done.md`
> Deps: MIG-304 PARTIAL `da01f1e5`
> Deploy: **запрещён** (и **нужен** для unblock)

## Claim slot

- agent_id: composer-executor-mig-307
- claimed_at: 2026-08-17T18:00:00+03:00
- workspace: D:\kppdf-8.0

## Acceptance

- [x] Try prod `kppdf-crm.ru` first, then LAN — prod health 200, used prod
- [x] Probe persist email; if stripped → BLOCKED «нужен кати» — 400 `property email should not exist`
- [x] 9 CP emails written **or** honest BLOCKED — 0/9 written, BLOCKED
- [x] Report table updated; archive; no deploy

## Results

| Gate | Result |
|------|--------|
| prod health | 200 |
| prod login | 200 (`username: admin`) |
| probe PATCH+GET | FAIL — DTO rejects `email` |
| emails written | **0/9** (1 skipped isOurCompany) |
| deploy | not done (forbidden + required for unblock) |
| transport | `https://kppdf-crm.ru` |

## Next

Warm deploy BE ≥ `da01f1e5`, then re-run `data/from-kp3/_mig304_cp_email_load.py`.
