# Freebuff-2 — KP Workspace 407 (parallel после 404)

> **Ждёшь 404 на remote, потом одна TZ и STOP.**

## Старт — wait loop

```text
cd D:\kppdf-8.0
git pull
```

**Не начинай код**, пока нет файла:

`tasks/_archive/2026-08/TZ-KP-WS-404.done.md`

Если нет — каждые 5 мин: `git pull`, проверка снова.

**После 404 archived — подожди ещё**, пока Freebuff-1 не закроет **405** (общий conflict: `proposal-create-inspector.*`). Старт 407 только когда есть `TZ-KP-WS-405.done.md` OR `406` in progress on remote — безопаснее: **жди `405.done`**.

## CLAIM

```text
tasks/_active/TZ-KP-WS-407.md
agent_id: freebuff-2 · claimed_at ISO · D:\kppdf-8.0
```

## TZ

`tasks/TZ-KP-WS-407.md` — org hint · copy для другой фирмы · family attach в workspace.

**CONFLICT:** не трогать файлы 405/406 если Freebuff-1 на них (inspector/ribbon/workspace host — согласуй через pull).

## Gates

```bash
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit && pnpm test -- proposal && pnpm lint
```

## После DONE

Archive → **commit + push** → **STOP** (408 делает Freebuff-1).
