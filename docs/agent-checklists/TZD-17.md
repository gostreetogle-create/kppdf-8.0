# TZD-17 checklist

> Status: **DONE**
> Marker: archived — `tasks/_archive/2026-08/TZD-17.done.md`
> Source: `tasks/_backlog/desktop/TZD-17-mcp-semantic-domain-layer.md`
> Commit/push: yes (PO requested archive + commit/push)
> closed_at: 2026-08-08T00:00:00Z

## Claim slot

- agent_id: cursor-composer-tzd17
- claimed_at: 2026-08-07T22:12:36Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Unknown task: TZD-17; sync tasks first)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_active-map.md` + `tasks/_active/` — нет чужого CLAIM на `desktop/mcp/**`
- [x] TZ TZD-17 + deps TZD-12/13/15 прочитаны
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZD-17.md` на месте (удалён при archive)

## Acceptance

- [x] `kppdf_get_domain_schema` — kinds + required name + version tzd-17
- [x] `kppdf_list_categories` — material categories id/name/skuPrefix|null
- [x] `kppdf_validate_material` — empty name → ok:false; no proposal POST
- [x] `kppdf_validate_material` — bad/inactive category → error
- [x] `kppdf_inbox_audit_file` (или propose mode=validate) — 0 proposals
- [x] Default `kppdf_inbox_propose_file` still propose-only / SoT-safe
- [x] MCP.md + FEATURE-INTEGRATION-CHECKLIST §E updated
- [x] `cd desktop/mcp && pnpm typecheck` PASS
- [x] `cd desktop/mcp && pnpm test` PASS

## Gates (факт)

```text
cd desktop/mcp && pnpm typecheck  → PASS
cd desktop/mcp && pnpm test       → PASS (31/31)
```

## Executor report (auto)

- Cursor PASS 2026-08-08 → archive + commit/push
- DONE: schema + categories + validate + inbox audit (TZD-17 only)
- NOT staged: inbox.ts (audit не зависит), http-server.ts, App.svelte, icons, frontend/**
- commit: _(filled after push)_
- Archive: `tasks/_archive/2026-08/TZD-17.done.md`
- Lock: `.mimocode/locks/TZD-17-mcp-semantic-domain-layer.lock`
- TZD-18/19: not started (await PO)

## Review handoff

- [x] READY FOR REVIEW
- [x] Cursor PASS
- [x] Archive after PASS

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-08
