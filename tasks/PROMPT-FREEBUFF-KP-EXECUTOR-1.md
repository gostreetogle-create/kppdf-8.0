# Freebuff-1 — KP Workspace MAIN chain (401→409)

> **Один агент · одна непрерывная сессия.** Между TZ: archive → commit+push → `/clear` → следующий CLAIM.  
> **Geometry law:** `docs/pages/kp-workspace-geometry.md` — нарушение = STOP.

## Старт

```text
git pull
cd D:\kppdf-8.0
```

## CLAIM (каждая TZ)

```text
1) tasks/_active/<TASK-ID>.md + docs/agent-checklists/_TEMPLATE.md
2) agent_id: freebuff-1 · claimed_at ISO · workspace D:\kppdf-8.0
3) _active-map — чужой claim на CONFLICT KEYS = STOP
4) GEMINI.md + docs/AI-AGENT-Guide.md + назначенный TZ
```

## Порядок (строго)

| # | TZ | После archive — commit+push если менялся код/docs |
|---|-----|---------------------------------------------------|
| 1 | **401** Shell + `/proposals/workspace` | да |
| 2 | **402** Store + chrome rails L/R | да |
| 3 | **403** Left: catalog · template · recipient + autosave | да |
| 4 | **404** Right: params · table · terms · output | да |
| 5 | **405** Inline table/text/template settings | да |
| 6 | **406** MCP bridge + BE fields | да (FE+BE) |
| 7 | **408** Cutover `/proposals/create` | да — **STOP если 407 не archived** |
| 8 | **409** Cleanup + `kp-workspace.page.md` sync | да |

**407 делает Freebuff-2** (параллельно после 404). Перед **408**: `git pull` и проверь `tasks/_archive/2026-08/TZ-KP-WS-407.done.md` на origin.

## Gates (после 401, 404, 408)

```bash
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit && pnpm test -- proposal && pnpm lint
```

После 406:

```bash
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit && pnpm test -- document-template
```

## Обязательно читать перед кодом

- `docs/pages/kp-workspace-rail-ia.md`
- `docs/audits/2026-08-23-kp-workspace-implementation-audit.md`
- `docs/pages/kp-workspace.page.md`

## Запреты

- Reflow/shrink A4 on panel open
- Второй write-path Quotation
- Hand-rolled modals
- **408 без 407 archived**
- Deploy без команды PO

## Commit cadence

Push после каждой archived TZ (401, 402, 403, 404, 405, 406, 408, 409) — не копить WIP.

## Финал

Wave DONE → `tasks/WAVE-KP-SINGLE-WORKSPACE.md` status DONE, `_active/` пуст по KP-WS.
