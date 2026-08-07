# TZD-20 checklist

> Status: **DONE**
> Marker: archived — `tasks/_archive/2026-08/TZD-20.done.md`
> Source: `tasks/_backlog/desktop/TZD-20-mcp-client-json-copy.md`
> Commit/push: YES (PO 2026-08-08)
> READY FOR REVIEW: 2026-08-07T22:40:00Z
> closed_at: 2026-08-08T00:40:00Z

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: cursor-composer-tzd20
- claimed_at: 2026-08-07T22:32:20Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Unknown task: TZD-20; sync tasks first)

## Preflight

- [x] Get-Location + git rev-parse → `D:\kppdf-8.0`
- [x] `_active-map` + `_active/` — нет чужого CLAIM на `desktop/src/App.svelte` / `mcpClientSnippet*`
- [x] TZ TZD-20 + AI-AGENT-GUIDE прочитаны
- [x] Claim slot заполнен
- [x] `tasks/_active/TZD-20.md` (removed at archive)

## Acceptance

- [x] `buildMcpClientSnippet` full + fragment (unit)
- [x] UI «Скопировать mcp.json» при paired+port+apiKey (`data-test="mcp-copy-json"`)
- [x] Disabled + hint без паринга
- [x] Docs Cursor/LM Studio = один JSON; TTL/reload; multi-client
- [x] GET `/mcp` → 405 в актуальном host source (+ runtime sync)
- [x] `cd desktop && pnpm typecheck` PASS
- [x] `cd desktop && pnpm check` PASS

## Gates (факт)

```text
cd desktop && pnpm typecheck     → PASS
cd desktop && pnpm check         → PASS (0 errors)
cd desktop && pnpm test          → PASS (4/4 mcpClientSnippet)
```

## Executor report

- NEW `desktop/src/core/mcpClientSnippet.ts` + unit test (full + fragment).
- `App.svelte`: кнопки «Скопировать mcp.json» / «Только фрагмент»; URL «Копировать» сохранён; hint RU; disabled без `pairedApiKey`.
- Docs: `desktop/docs/MCP.md`; `PAIRING.md`; FEATURE §E.
- **Не** писал в `~\.cursor\mcp.json` / LM Studio paths (clipboard only).
- GET 405: already sync mcp ≡ mcp-runtime (not staged this TZ).
- Cursor PASS 2026-08-08 → archive.

## Executor report (auto)

- commit: f3ca1007947e2e727af4f24a05ac4f8ace71aade

## Review handoff

- [x] READY FOR REVIEW
- [x] Cursor/PO PASS → archive

## Closeout

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-08T00:40:00Z
