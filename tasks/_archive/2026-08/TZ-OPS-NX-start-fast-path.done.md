# TZ-OPS-NX-start-fast-path — DONE

ARCHIVE_MARKER
outcome: PASS
closed_at: 2026-08-29
closed_by: cursor-executor-ops-fast-path

## Changes

### `start.mjs`
- **Mongo reuse:** skip `docker rm` + `compose up` when `kppdf-mongo` is running, Docker health=`healthy`, and `rs.status().ok === 1`.
- **Healthy-but-init path:** if container healthy but RS not ready, skip recreate and let `waitMongo()` poll.
- **Ready panel:** wall-clock to last ready service (`computeReadyTiming`), plus per-service line (`mongo Xs · backend Ys · frontend Zs`). Fixes misleading `Math.min` fastest-service bug.
- **`scriptStartedAt`:** captured after preflight for accurate wall-clock.
- **Stop:** `extractStopPids()` ignores `startedAt` metadata in `.start.pids.json`.

### `docker-compose.yml`
- Mongo healthcheck: `interval: 3s`, `start_period: 5s` (was 10s interval, no start_period) — reduces cold-start tax ~11s → ~5–8s.

### Tests
- `scripts/start-fast-path-helpers.mjs` — pure helpers (parse, reuse decision, timing, stop PIDs).
- `scripts/start-fast-path.test.mjs` — 10 unit tests (node:test).
- `scripts/start-fast-path-smoke.mjs` — cold start + healthy reuse + timing + stop/restart harness.

## Gates

| Gate | Result |
|------|--------|
| `node --check start.mjs` | PASS |
| `node --test scripts/start-fast-path.test.mjs` | PASS (10/10) |
| `node scripts/start-fast-path-smoke.mjs` | PASS (~60s, cold + reuse) |
| `pnpm exec nx build kppdf-web` | PASS |
| `pnpm exec nx run-many -t lint --all` | PASS (5 projects, 0 errors) |
| `pnpm run architecture:check:nx` | PASS |
| `pnpm run ui:tokens:nx` | PASS |

## Smoke evidence

- **Cycle 1 (cold):** Ready panel with wall-clock timing line present.
- **Cycle 2 (reuse):** log contains `пересоздание контейнера не требуется`.
- **Stop/restart:** both cycles ended with `node start.mjs --stop` without orphan listeners.

## Not changed

- `backend/**`, `frontend/**`, `frontend-nx/**`
- `--stop` / `--reset` / legacy `:4200` start behavior (API order preserved)
- No new npm dependencies

## Executor report

Diagnostics findings 1/1b/2 fully addressed. Repeat `node start.mjs --nx` with warm Mongo skips ~11s container recreate. Ready panel now reports honest wall-clock total.
