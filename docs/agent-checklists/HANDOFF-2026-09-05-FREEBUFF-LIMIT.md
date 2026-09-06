# Agent handoff snapshot — 2026-09-05 (лимит Freebuff)

## Сделано

| Что | Evidence |
|-----|----------|
| Gantt L0 G0–G7 | archives + `188f26dd` |
| Polish P1–P4 | G8 `e8fba4b8`, G9 `8b665fcc`, S43 `2d85b279`, P1 catalog |
| G14-BE | `73b1a09b` estimateWorkerOverrides + PATCH |
| Org-scope HARDEN+TX | archives |
| Specs/TZ Deals+Registries | docs ready, код не начат |

## Недоделка Freebuff (лимит)

| Что | Состояние |
|-----|-----------|
| **G10 photo thumbs** | Код в **unstaged** `production/**`; `_active` есть; **archive нет**; commit нет |
| Registries work-types/workers/module-WT | не начато |
| WAVE-S G15 + registries scroll | не начато |
| Deals D1–D5 | не начато |
| G14-FE | не начато |
| Data IA | не начато |

## Параллель

Два агента на `frontend-nx/apps/kppdf-web` **нельзя**.  
Поэтому: Freebuff WAVE A → потом Claude WAVE B.

## Промпты

1. Freebuff: `tasks/PROMPT-FREEBUFF-RESUME-AFTER-LIMIT.md`  
2. Claude (после A): `tasks/PROMPT-CLAUDE-AFTER-FREEBUFF-WAVE-A.md`
