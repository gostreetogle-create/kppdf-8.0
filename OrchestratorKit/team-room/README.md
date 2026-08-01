# Team Room quickstart

## Owner

Open the room when you want to watch the team:

```text
Windows: OrchestratorKit\\team-room.cmd open
POSIX:   bash OrchestratorKit/team-room.sh open
```

## Agent

The first action is zero-configuration:

```text
node OrchestratorKit/team-room/cli.mjs join
```

This starts or reuses the one local room, registers the current worktree, and synchronizes active Markdown tasks. Then read `status` and `inbox`, claim one task, heartbeat during long work, send questions, and complete only with the matching archive evidence.

```text
node OrchestratorKit/team-room/cli.mjs status
node OrchestratorKit/team-room/cli.mjs inbox
node OrchestratorKit/team-room/cli.mjs claim TZ-XXX
node OrchestratorKit/team-room/cli.mjs heartbeat TZ-XXX
# claim запускает watcher автоматически; watch доступен явно:
node OrchestratorKit/team-room/cli.mjs watch TZ-XXX
node OrchestratorKit/team-room/cli.mjs send "Question for the team" --task TZ-XXX
node OrchestratorKit/team-room/cli.mjs complete TZ-XXX --evidence tasks/_archive/2026-08/TZ-XXX.done.md
node OrchestratorKit/team-room/cli.mjs stop
```

`claim` starts a background heartbeat watcher automatically. `release`/`complete` stop it; `stop` terminates the room and watcher process trees.

The room is local-only, persists outside Git worktrees, and recovers stale leases. Auto-join is guaranteed for agents following `AGENTS.md`/the launcher protocol; an arbitrary stopped AI host still needs its own hook/runtime to start and poll before it can receive messages.
