# Claude Code: ограниченная локальная реализация

Режим активен только при точном bounded task.

## Marker

Перед первой правкой заполнить `agent-task.md`: `agent: claude`, status, task ID, branch, exact baseline, allowed paths, acceptance, stop-condition и ownership других агентов.

## Ограничения

- Только локальная работа.
- Только exact allowed paths.
- Один минимальный результат без соседнего рефакторинга.
- Никаких production, remote, push, merge/rebase, destructive SQL и auth bypass.
- При пересечении файлов, росте scope или новом бизнес-решении — stop.

## Завершение

Проверить diff, выполнить тесты, сменить marker на `completed`, создать один commit `claude: ...`, передать SHA Codex и остановиться. Self-review запрещён.
