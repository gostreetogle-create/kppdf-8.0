# TZD-47 checklist

> Status: **DONE**
> Marker: archived `tasks/_archive/2026-08/TZD-47.done.md` · lock `TZD-47-mcp-photo-upload.lock`
> Commit/push: по `docs/GIT-POLICY.md`
> Spec: `tasks/_archive/2026-08/TZD-47.done.md` (backlog spec removed after archive)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: composer-executor-tzd-47
- claimed_at: 2026-08-17T19:30:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (root TZ, не kit TZ-NN; `_active/` был пуст)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на `desktop/mcp/src/**`
- [x] TZ / канон / REST `/api/photos/upload` + `POST /api/products/:id/photos` прочитаны
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZD-47.md` на месте
- [x] Skip-if-archive: `TZD-47.done.md` нет (на старте)
- [x] Чужой dirty WIP на main не стейджим
- [x] MIG-302 / MIG-303 / NSIS / ai-runner / `_park` не трогаем

## Acceptance

- [x] Tool в tools/list: `kppdf_propose_photo_upload` + `kppdf_confirm_photo_upload` (registry 95)
- [x] Smoke upload 1 file → Photo id (mocked REST; live MCP :9743 offline — не имитировал)
- [x] Bind to `Product.photoIds` documented (`POST /api/products/:id/photos`)
- [x] Tests PASS; archive TZD-47.done

## Integrity slot (до READY / archive)

- [x] Тип изменения: MCP
- [x] FIC §A–D N/A (нет web route / permission / Nest module); §E обновлён; §F N/A
- [x] page.md / PAGE-TZ-INDEX — N/A (нет UI route)
- [x] SECTION-READINESS — N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Coupling map: N/A (не трогал общее поле/статус)
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

| Gate | Command | Exit |
|------|---------|------|
| mcp tsc | `cd desktop/mcp && pnpm typecheck` | **0** |
| mcp tests | `pnpm test` | **121/121** |
| live MCP healthz | `GET http://127.0.0.1:9743/healthz` | **offline** (не fake upload) |

Primary signal: HITL tool → existing Photo REST — met (unit smoke)
Secondary: registry 95 + RU errors — PASS

## Executor report

- Pattern: propose inspect + confirm `userOk` (как module create), не JSON journal (бинарник).
- Product bind: existing subroute. CP bind: нет REST — skip + RU.
- Live MCP offline: PO «подключи MCP» для живого 1-file; SoT Photo id из мока не выдавал как live.
- Чужой WIP (371 FE, seeds, `_park`, hygiene dumps) не стейджился.

## Review handoff

- [x] TZ не требует Cursor Verdict inbox
- Deploy DEFERRED до «кати»

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active` + backlog spec
- [x] Status = DONE
- closed_at: 2026-08-17T19:40:00+03:00
