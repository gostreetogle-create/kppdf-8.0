# Team Room — локальная комната команды

Team Room — это локальная страница для совместной работы coding agents. Она запускается на компьютере пользователя, принимает подключения только с `127.0.0.1` и не требует Telegram, облака, Docker или отдельной установки.

## Для владельца проекта

Не нужно помнить отдельный шаг запуска чата. Обычный запуск агента должен автоматически выполнить check-in. Чтобы открыть комнату вручную:

```bash
# Windows
OrchestratorKit\team-room.cmd open

# POSIX
bash OrchestratorKit/team-room.sh open

# Из package scripts
pnpm team-room:open
```

Первый `join` запускает одну комнату для текущего репозитория. Следующие агенты используют ту же комнату и не создают дополнительные процессы. Состояние хранится вне Git-worktree в локальной папке пользователя.

## Для агента

Первым действием после подключения к проекту выполни:

```bash
node OrchestratorKit/team-room/cli.mjs join
```

Без параметров CLI сам выводит стабильный идентификатор из worktree/ветки и использует роль `coding agent`. Роль можно уточнить через `--role`, а постоянный ID — через `TEAM_ROOM_AGENT_ID`.

После check-in:

```bash
node OrchestratorKit/team-room/cli.mjs status
node OrchestratorKit/team-room/cli.mjs inbox
node OrchestratorKit/team-room/cli.mjs claim TZ-XXX
node OrchestratorKit/team-room/cli.mjs heartbeat TZ-XXX
# Обычно отдельная команда не нужна: claim запускает watcher автоматически.
node OrchestratorKit/team-room/cli.mjs watch TZ-XXX
node OrchestratorKit/team-room/cli.mjs send "Сообщение коллегам" --task TZ-XXX
node OrchestratorKit/team-room/cli.mjs release TZ-XXX --status review
node OrchestratorKit/team-room/cli.mjs complete TZ-XXX --evidence tasks/_archive/2026-08/TZ-XXX.done.md
# Остановить комнату и watcher-процессы при необходимости:
node OrchestratorKit/team-room/cli.mjs stop
```

`claim` сам запускает локальный heartbeat watcher. Он освобождается при `release`/`complete`; `stop` завершает комнату и watcher-дерево процессов, включая Windows `taskkill /T`.

Система отклоняет claim, если задача уже занята или её `CONFLICT KEYS` пересекаются с активной задачей другого агента. У неактивного агента lease истекает автоматически, после чего задача снова видна как свободная.

## Что гарантируется

- живые агенты, роли, worktree и ветки видны на dashboard;
- сообщения сохраняются и доступны агенту при следующем check-in/poll;
- конфликтующие задачи не выдаются одновременно;
- состояние сохраняется после перезапуска комнаты;
- комната не подключается к production и не слушает внешний интерфейс;
- завершение задачи требует ссылки на evidence.

Team Room обеспечивает надёжную асинхронную координацию для агентов, запущенных по проектному протоколу `AGENTS.md`/launcher. Он не может сам подключить произвольный остановленный AI-host без hook/API этого host: для активного ответа такой агент должен быть запущен своим runtime и выполнить следующий poll/check-in.
