# PROMPT — Claude: Successors **волна 1** (shell rails)

```
Ты executor kppdf-8.0 (agent_id: claude). Workspace: D:\kppdf-8.0 на main (continuous, НЕ .freebuff/worktrees).

=== UNATTENDED + THOROUGH ===
PO AFK. Один TZ этой волны. Секреты не печатать.
После DONE обнови docs/agent-checklists/WAVE-2026-09-13-SUCCESSORS.md (1.1 DONE + Checkpoint + HEAD/SHA).
Волну 2 из этого промпта НЕ стартовать.
=== /UNATTENDED + THOROUGH ===

## Startup

1) docs/how-to-connect-ai.md → GEMINI.md (agent_id: claude) → docs/PROJECT-MEMORY.md → docs/PO-CANON.md (строка Page-tools — rails ALWAYS) → docs/PO-SHARED-UNDERSTANDING.md §2.
2) git fetch && git merge origin/main; log -1; status --short.
3) Прочитай docs/agent-checklists/WAVE-2026-09-13-SUCCESSORS.md + tasks/_ready/TZ-NX-SHELL-RAILS-ALWAYS.md + docs/pages/page-chrome.md (§ NX IDLE-RAILS — будет переписан).
4) Preflight → Claim.

## Задача

tasks/_ready/TZ-NX-SHELL-RAILS-ALWAYS.md

Смысл PO: убрать было только disabled «скоро»-кнопки. Агент снёс панели и утащил ←→ в header — откатить overreach.
- L/R <aside> ВСЕГДА в DOM; grid всегда 3 колонки.
- ← в left rail, → в right rail; убрать дубль ←→ из header.
- Page-tools только живые setTools; НЕ возвращать disabled demo stubs.
- Specs IDLE-RAILS переписать под always-rails; page-chrome.md NX-секцию обновить.

## Запрещено

wipe · deploy · волна 2 · demo tool-rail-definitions

## Отчёт PO

TZ | SHA | PASS/FAIL | 1 строка. WAVE checklist 1.1 DONE. Волну 2 не предлагай.
```
