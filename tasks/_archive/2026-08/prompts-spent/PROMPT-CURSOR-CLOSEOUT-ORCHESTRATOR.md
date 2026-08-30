# Cursor orchestrator — closeout (PO away, 2026-08-23)

> **Freebuff заняты:** 410 (FB-1) · 354 (FB-2) — **не трогать их keys**.  
> Cursor = docs/canonical/TZ/deploy-prep + wait loop + Claude Code analysis.

## Lane map

| Lane | Agent | TZ | Keys |
|------|-------|-----|------|
| A | Freebuff-1 | KP-WS-410 | workspace, deals-chips |
| B | Freebuff-2 | PRODUCTION-354 | gantt-bars |
| C | Cursor | DEN-505 spec + canon · deploy-prep · hygiene | docs, tasks/** |
| D | Next freebuff | **DEN-505** execute | после A+B push |

## Фаза 0 — Сейчас (Cursor, без product code)

1. ✅ TZ `tasks/TZ-UI-DEN-505-framed-content-inset.md` (PO: текст прилип к рамке)
2. Canon patch: `ui-density-canon.md` § Framed content inset, `AI-UI-CONTRACT.md`
3. Commit+push **только** docs/tasks (не WIP Freebuff product files)
4. MCP `claude_code` analysis-only: deploy blockers на текущем origin/main

## Фаза 1 — Wait loop (5 min `git pull`)

Ждать на origin:

```text
tasks/_archive/2026-08/TZ-KP-WS-410.done.md
tasks/_archive/2026-08/TZ-PRODUCTION-354.done.md
```

Если >2h — note в `_NOW`, не патчить workspace/gantt самому.

## Фаза 2 — После push Freebuff

1. `git pull --ff-only` · `_active/` пуст
2. Uncommitted canon (truncated-label-peek) → commit если ещё локально
3. **DEN-505** → отдать свободному Freebuff (`PROMPT-FREEBUFF-DEN-505.md`) или Claude terminal

## Фаза 3 — «подготовь к деплою»

`tasks/PROMPT-DEPLOY-READY.md`:

```bash
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit && pnpm test && pnpm lint
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit && pnpm test && pnpm lint
pnpm architecture:check
```

→ `PRE-DEPLOY-2026-08-23.md` + `DEPLOY-READY.md` status **READY**  
**Не** deploy.ps1 / SSH / wipe.

## Фаза 4 — PO return checklist (коротко)

- `/desk` — inset 505 + queue load text
- `/proposals/workspace?new=1` — 410
- `/production` — gantt peek 354
- `UI-DENSITY-GUARDS.md` 5 routes
- DEPLOY-READY = READY → «кати»

## Запреты Cursor

- Не edit `proposals/workspace/**` пока FB-1 на 410
- Не edit `gantt-bars/**` пока FB-2 на 354
- Не deploy без PO
