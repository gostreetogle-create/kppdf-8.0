# ORCH — Doc Studio FINISH (Cursor integrator)

updated_at: 2026-09-03T23:50:00+03:00  
baseline: `b9137a30`  
mode: **orchestrator** (Cursor = TZ + handoff + evidence gate; **no** product code)

## LIVE (запущено)

Два **интерактивных** окна Claude Code (worktrees):

| Slot | TZ | Worktree / branch |
|-----------|-------------------|
| #1 | S27 VITRINA | `.worktrees/TZ-NX-DOCSTUDIO-S27` · `claude/docstudio-s27` |
| #2 | S28 HYDRATE | `.worktrees/TZ-NX-DOCSTUDIO-S28` · `claude/docstudio-s28` |

Если в окне «New MCP server: perplexity» → выбери **3. Continue without** (агентам MCP не нужен).

`--bg` без TTY зависает на этом диалоге; `--cloud` из Cursor shell тоже требует TTY.  
MCP Cursor `Agent` spawn: **Available agents: none**.

## После S27+S28 на ветках

1. Cursor evidence gate (diff + build/tests)  
2. Merge в `main` (по очереди: сначала S28 BE, потом S27 FE — или cherry-pick)  
3. Следующий **только sequential** FE: PROMPT-03 S29 …

## Freebuff backup (если окна Claude не пошли)

- Slot1: `tasks/_ready/docstudio-finish/prompts/PROMPT-01-S27.md`  
- Slot2: `tasks/_ready/docstudio-finish/prompts/PROMPT-02-S28.md`  

Не дублировать те же keys одновременно с Claude.

## Parallelism law

S27 FE ∥ S28 BE — ok.  
Два FE studio — **запрещено**.
