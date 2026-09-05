# WAVE — Claude continuous (после Freebuff D56)

date: 2026-09-05  
agent: Claude Code (`agent_id: claude`)  
prompt: `tasks/PROMPT-CLAUDE-CONTINUOUS-S44-REGISTRIES.md`

## Цель

Добить всю **LIVE**-очередь NX без остановки mid-wave: Doc Studio S44 → Registries scroll.

## Цепочка (строго по порядку)

| # | SIZE | ID | Path | Conflict zone |
|---|------|-----|------|---------------|
| 1 | L | S44 | `tasks/TZ-NX-DOCSTUDIO-S44-TABLE-CANVAS-SELECT-FIX.md` | studio canvas / rich-text · `nx build kppdf-web` |
| 2 | S | REG-SCROLL | `tasks/_ready/TZ-NX-REGISTRIES-EXPAND-SCROLL-STABLE.md` | registries-page · `nx build kppdf-web` |

## Правила

1. **Сначала** создать/заполнить этот WAVE + чеклисты; код — только после Claim S44.
2. Один агент, sequential: archive S44 + green `nx build` → Claim REG-SCROLL.
3. Не параллелить с Freebuff на `kppdf-web`.
4. **Не брать** из `_backlog/` (G12 park, legacy decommission, density/`frontend/`, DCI на legacy) — не LIVE.

## Статус

| ID | Status |
|----|--------|
| S44 | DONE |
| REG-SCROLL | CLAIMING |

## Done when

Оба archived + Executor report (auto) + `_NOW.md` = Claude IDLE + Freebuff IDLE.
