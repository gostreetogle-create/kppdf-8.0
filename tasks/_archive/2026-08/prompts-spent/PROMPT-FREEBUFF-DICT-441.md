# PROMPT — Freebuff / executor DICT-441 (classification chips)

> Мелкий hotfix. Можно параллельно CATALOG-377: **не** трогать `categories.page.ts` / category services.

```text
Ты — executor kppdf-8.0. Репо: D:\kppdf-8.0 на main.
GEMINI.md + .agents/skills/kppdf-executor-loop/SKILL.md + docs/PO-CANON.md

TZ: tasks/TZ-DICT-441-classification-chips.md

CLAIM первым (до кода):
1) Get-Location + git rev-parse → D:\kppdf-8.0
2) tasks/_active/TZ-DICT-441-classification-chips.md + checklist docs/agent-checklists/TZ-DICT-441.md из _TEMPLATE.md
3) Status CLAIMED; Claim slot: agent_id + claimed_at (ISO) + workspace
4) Conflict keys vs чужой WIP на kind-labels.* → STOP

Фикс (уже диагностирован):
kind-labels.page.ts сейчас chips = [один kind-labels].
Нужно: chips = CLASSIFICATION_CHIPS из dictionary-group-chips.ts (как categories.page.ts).
Spec regression на оба chip. Docs: dictionaries.page.md + PAGE-TZ-INDEX.

Gates из TZ. Archive + commit/push после PASS.
НЕ deploy / wipe. НЕ трогать CATALOG-377 зоны.
```
