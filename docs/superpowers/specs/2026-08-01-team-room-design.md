# Team Room — Design

**Date:** 2026-08-01
**Status:** Implemented and verified 2026-08-01; archive: `tasks/_archive/2026-08/TZ-TEAM-ROOM.done.md`
**Owner:** Agent 3

## Goal

Provide a small local team room that lets coding agents register themselves, claim tasks safely, see active teammates, exchange task-scoped messages, and expose a browser dashboard without requiring the project owner to remember a separate startup step.

## User experience

The owner runs the normal project/agent workflow. The first agent connection automatically starts one loopback-only Team Room process and opens the dashboard when requested. Later agents reuse the same room. The browser dashboard shows:

- agents and roles;
- active task ownership and worktree/branch;
- task states: Ready, In progress, Needs help, Review, Done;
- recent activity;
- task-scoped and direct messages.

The owner does not need to understand the persistence or coordination implementation.

## Architecture

Use a dependency-free Node.js process built on the standard `node:http` module. The service binds only to `127.0.0.1`, persists state in a JSON file under the user's local application-data directory (outside Git worktrees), and exposes a small HTTP API plus a static dashboard. The service is started idempotently by the CLI's `join`/`open` commands.

The persistence location is derived from the repository's Git common directory, so all linked worktrees share one room while unrelated repositories remain separate. No npm package, Docker daemon, database server, cloud account, Telegram integration, or committed runtime state is required.

## Agent lifecycle

1. `join` ensures the room is running.
2. The agent registers its identity, role, branch, and worktree.
3. `sync` imports active `tasks/*.md` metadata into the room.
4. `claim` atomically checks task ownership and conflict keys.
5. `heartbeat` renews the agent lease and task lease.
6. `send` writes a durable message for a teammate or task.
7. `release`, `block`, `review`, and `complete` update task state.
8. Expired leases return tasks to Ready and create an activity event.

The system is asynchronous: messages are durable and visible on the next agent poll. A running model still needs a host/runtime integration to be actively woken; the Team Room does not promise impossible spontaneous model-to-model conversation.

## Safety rules

- Only loopback connections are accepted.
- Claims fail when the task is owned by another live agent.
- Claims fail when conflict keys overlap another live task.
- A lease expires after inactivity and is visible in the activity log.
- Completion requires an evidence/archive reference supplied by the agent.
- Team Room state is not a replacement for Git, task files, or archive records.
- The service never edits application source code or task archives automatically.

## Initial scope

Included: CLI, idempotent start, agent registration, task sync, task claiming, conflict checks, heartbeats, messages, inbox, activity feed, browser dashboard, Windows launcher, documentation, and automated Node tests.

Deferred: authentication, remote access, cloud messaging, rich notifications, automatic model wake-up, and a full multi-user web editor.

## Acceptance criteria

- A first `join` starts the room if absent and a second `join` reuses it.
- The room is reachable only on loopback and has a health endpoint.
- Two agents cannot claim the same task or overlapping conflict keys.
- Agent registration, task ownership, messages, and activity survive service restart.
- Stale leases are recovered without losing task history.
- The dashboard renders agents, tasks, messages, and activity.
- A Windows-friendly one-command launcher exists.
- Agent instructions clearly require automatic Team Room join/check-in.
- Focused tests pass and no project dependency is added.
