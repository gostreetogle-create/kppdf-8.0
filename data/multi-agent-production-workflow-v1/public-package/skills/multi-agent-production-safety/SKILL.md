---
name: multi-agent-production-safety
description: Coordinate Codex, Claude Code, Zcode, or other coding agents in one repository with explicit ownership, bounded handoffs, independent review, evidence, and production stop conditions. Use for multi-agent implementation or review; do not invoke merely because one task is large.
---

# Безопасная мультиагентная работа

## Результат

Организовать работу так, чтобы параллельность сокращала время, но не создавала конфликтов, self-review и самовольной интеграции.

## Правила

1. Назначить одного главного интегратора.
2. Делить работу только на действительно независимые файлы или контуры.
3. До делегирования зафиксировать task ID, exact baseline, branch/worktree, ownership, allowed paths, acceptance и stop-condition.
4. Запретить одновременную запись в один файл и связанный runtime-контур.
5. Каждый executor создаёт один локальный commit и останавливается.
6. Reviewer проверяет живой diff и доказательства, но не изменяет проверяемый код.
7. Автор не принимает собственный commit.
8. Главный интегратор принимает, дорабатывает или отклоняет каждый exact commit.
9. Production, push, merge, DML/DDL и destructive-действия требуют отдельной authority.
10. Остановить цикл после доказанного acceptance, независимого pass и финальной приёмки интегратором.

Использовать контракт и шаблоны из `.project-review/` текущего проекта. Если инструменты прямого сообщения между приложениями недоступны, передавать тот же handoff вручную; не имитировать доставку.
