---
name: multi-agent-production-safety
description: >-
  Coordinate Cursor, Claude Code, Freebuff/Buffy (Zcode-slot), and Gemini on
  kppdf-8.0 with explicit ownership, bounded handoffs, independent review,
  evidence, and production stop conditions. Use for multi-agent waves; not for
  a single routine TZ.
---

# Безопасная мультиагентная работа (kppdf)

Канон: `docs/agents/MULTI-AGENT-WORKFLOW.md`.  
Источник идей: `data/multi-agent-production-workflow-v1/`.

## Результат

Параллельность без пересечения conflict keys, без self-review и без самовольной интеграции.

## Правила

1. Один интегратор приёмки: **Cursor** (evidence gate); runtime-commits — continuous executor по Claim.
2. Делить работу только на независимые conflict keys / файлы.
3. До делегирования: Task ID, exact baseline SHA, branch/worktree, ownership, allowed paths, acceptance, stop-condition (`docs/agents/project-review/HANDOFF_TEMPLATE.md`).
4. Запрет одновременной записи в один файл и связанный runtime-контур.
5. Каждый executor — один локальный commit своих путей, потом стоп.
6. Reviewer (MCP `claude_code` / второй агент) читает exact diff; не пишет проверяемый runtime.
7. Автор не принимает собственный commit.
8. Cursor / continuous integrator принимает, дорабатывает через новый TZ или отклоняет.
9. Production, wipe, destructive — только слово PO (`docs/GIT-POLICY.md`).
10. Цикл стоп после доказанного acceptance + независимого pass + archive.
11. Локальный PASS ≠ боевая приёмка; агент в prod не ходит.
12. STOP+вопрос: бизнес-правило без TZ; деньги/формулы/отчёты/остатки; delete/rename сущности; diff вне declared conflict keys.
13. Review finding: файл + строки + evidence + риск + min-fix (иначе не принимается).

Handoff между Windows-приложениями — вручную тем же текстом; не имитировать доставку.
