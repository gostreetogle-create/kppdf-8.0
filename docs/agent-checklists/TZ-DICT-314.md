# TZ-DICT-314 checklist

> Status: **DONE**
> Marker: archived `tasks/_archive/2026-08/TZ-DICT-314.done.md`
> Commit/push: **YES** (executor continuous)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: cursor-composer-continuous-executor
- claimed_at: 2026-08-08T06:35:42Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Unknown task: TZ-DICT-314; sync tasks first)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_active-map.md` + `tasks/_active/` — нет чужого CLAIM на те же keys
- [x] TZ / канон / deps прочитаны (audit 2026-08-09, DICT-313 DONE, DICT-314 backlog)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-DICT-314.md` на месте
- [x] Conflict keys чисты vs peer WIP (desktop/FE не трогаем; app.module.ts — только form-profiles register)

## Acceptance

- [x] Schema FormProfile + unique (organizationId, entity, size)
- [x] GET list / GET one / PUT; auth + org scope
- [x] Seed defaults product+module × S/M/L on first GET if missing (idempotent)
- [x] LockedRequired cannot be stripped → 400
- [x] Jest: unique, required lock reject, seed idempotent
- [x] tsc + jest PASS; checklist + archive

## Gates (факт)

- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` → PASS
- `cd backend && pnpm exec jest src/modules/form-profiles/form-profiles.service.spec.ts` → **12/12 PASS**

## Executor report

- New module only + `FormProfilesModule` in app.module.ts
- Peer FE/desktop WIP left untouched
- Team Room claim unavailable (task not synced) — file claim used

## Review handoff

- [x] PO continuous executor — archive after local PASS
- [x] cursor_verdict: PASS (self)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-08T06:40:00Z
