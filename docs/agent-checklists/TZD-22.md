# TZD-22 checklist

> Status: **DONE**
> Marker: archived — `tasks/_archive/2026-08/TZD-22.done.md`
> Source: `tasks/_backlog/desktop/TZD-22-ai-import-task.md`
> Commit/push: yes (Cursor PASS closeout)

## Claim slot

- agent_id: cursor-composer-tzd22
- claimed_at: 2026-08-07T23:53:30Z
- workspace: D:\kppdf-8.0
- team_room_claim: no _(Unknown task: TZD-22; sync tasks first — best-effort)_

## Preflight

- [x] Get-Location + git rev-parse → `D:\kppdf-8.0`
- [x] Conflict keys vs TZ-COST-302 — disjoint
- [x] Claim slot + `_active/TZD-22.md` before code

## Acceptance

- [x] POST import-task → `ready_for_ai`, 0 journal proposals
- [x] GET list summary/rowCount; GET :id full rows
- [x] Desktop AI task button + propose regression
- [x] MCP 4 tools + unit/mock
- [x] Docs Variant C + TZD-22 vs TZD-23
- [x] Gates PASS
- [x] Cursor PASS → archive

## Gates (факт)

```
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit  → PASS
cd backend && pnpm test -- import-task                     → 6/6 PASS
cd desktop/mcp && pnpm test                                → 33/33 PASS
cd desktop && pnpm typecheck                               → PASS
```

## Executor report (auto)

- NEW `backend/src/modules/import-task/**` + `app.module.ts` register
- Desktop `createImportTaskFromRows` + «Создать задачу для ИИ»; propose intact
- MCP `kppdf_import_task_{list,get,create,set_status}` + `backendPatchJson`
- Docs MCP/FEATURE/backlog; no matching (TZD-23)
- Conflict disclosure: COST-302 keys disjoint; Team Room claim unavailable
- commit: e64e81fca6514e0ad2ad9ae6a9b9a8820a7d8871

## Closeout

- [x] archive + lock + progress + remove `_active/TZD-22.md`
- [x] Status = DONE
- closed_at: 2026-08-08T00:10:00Z
