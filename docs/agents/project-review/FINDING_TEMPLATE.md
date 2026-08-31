# Finding / recommendation (независимый review)

> Пишет reviewer. Не внедряет сам. Codex/Cursor принимает или отклоняет по evidence.

## REV-<n>

- **Priority:** P0 | P1 | P2
- **Where:** path:lines или воспроизводимый сценарий
- **Fact:** что наблюдается
- **Evidence:** SHA / diff hunk / test output / log
- **Risk:** пользовательский или технический
- **Min fix:** минимальная механика
- **Acceptance:** как проверить после фикса
- **Status:** open | accepted | rejected | verified

Без evidence — наблюдение, не задача на изменение.
Self-review собственного commit запрещён.
