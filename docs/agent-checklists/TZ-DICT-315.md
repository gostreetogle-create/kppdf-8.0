# TZ-DICT-315 checklist

> Status: **DONE**
> Marker: archived → `tasks/_archive/2026-08/TZ-DICT-315.done.md`
> Commit/push: yes (own files only)

## Claim slot

- agent_id: agent-3e757640b7 (cursor-composer-continuous-executor)
- claimed_at: 2026-08-08T08:02:30Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Unknown task: TZ-DICT-315; message sent)
- closed_at: 2026-08-08T08:20:00Z

## Preflight

- [x] Get-Location + git rev-parse → `D:\kppdf-8.0`
- [x] Claim slot + `_active/TZ-DICT-315.md`
- [x] STRICT carve respected

## Acceptance

- [x] Page: entity overflow-select → S|M|L → checkbox matrix
- [x] LockedRequired disabled+checked; cannot uncheck
- [x] Save → PUT; toast on error; RU labels
- [x] Nav «Профили быстрых форм»; dense Group Chip chrome
- [x] Empty/error: «Повторить» + menu hint
- [x] tsc + jest PASS; docs; archive
- [x] НЕ: 316 / FullEditor / appearance / peer WIP / deploy

## Gates (факт)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS
- `pnpm exec jest …form-profiles.service.spec.ts …form-profiles.page.spec.ts` → **13/13 PASS**

## Executor report

STRICT NEW carve: form-profiles page/service(+specs), page doc, surgical
`app.routes.ts` + `app-layout` menu/dense. Peer dirty dictionaries/*.page.ts
не staged. Next: TZ-DICT-316. Deploy: NO.

## Closeout

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-08T08:20:00Z
