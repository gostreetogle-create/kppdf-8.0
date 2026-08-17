# TZ-MIG-303 checklist

> Status: **DONE**
> Spec: archived `tasks/_archive/2026-08/TZ-MIG-303.done.md`
> Report: `docs/audits/2026-08-17-kp3-photos-attach-report.md`
> Deps: TZD-47 DONE; MIG-302 DONE
> Deploy: **запрещён**

## Claim slot

- agent_id: composer-executor-mig-303
- claimed_at: 2026-08-17T17:54:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (CLI not invoked this session)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → D:\kppdf-8.0
- [x] `_NOW.md` + `tasks/_active/` — no conflict on MIG-303 keys
- [x] TZ / deps read; id-map + photos-index present locally
- [x] Claim slot filled; Status = CLAIMED → DONE

## Acceptance

- [x] Upload via POST /api/photos/upload + product bind (REST; MCP offline)
- [x] ≥95% products with source images have photoId — **100%** (661/661 readback)
- [x] Orphans logged (35), not deleted
- [x] Report + archive; no wipe/deploy
- [x] SoT reachable via `https://kppdf-crm.ru` (LAN/MCP down — honest transport note)

## Integrity slot

- [x] Тип: docs/scripts + data verification (no FE/BE product code)
- [x] FIC N/A — no UI route / permission change
- [x] Чужой WIP не в коммите

## Gates (факт)

| Gate | Result |
|------|--------|
| `python scripts/mig303-attach-kp3-photos.py` | PASS exit 0 |
| Coverage readback | 661/661 (100%) |
| MCP :9743 healthz | offline |
| Synology LAN :3000 | unreachable |
| Prod https://kppdf-crm.ru/api/health | 200 |

## Executor report

- **Uploaded this run:** 0
- **Skipped (already had photo):** 661
- **Failed:** 0
- **Orphans logged:** 35 (orphan-media.txt)
- Script: `scripts/mig303-attach-kp3-photos.py` (idempotent; for future gap-fill)
- Transport: REST admin JWT; same as MIG-302 pattern
- known_limitation: photos pre-existed on SoT; session verified AC without duplicate uploads

## Closeout

- [x] archive `tasks/_archive/2026-08/TZ-MIG-303.done.md`
- [x] lock `.mimocode/locks/TZ-MIG-303-kp3-photos-attach.lock`
- [x] progress + STATUS + _NOW
- [x] removed `tasks/_active/TZ-MIG-303.md` + backlog spec
- closed_at: 2026-08-17T18:00:00Z
