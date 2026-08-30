# TZ-OPS-NX-launcher-frontend-failure — DONE

ARCHIVE_MARKER
outcome: PASS
closed_at: 2026-08-29
closed_by: cursor-executor-ops-nx-launcher

## Root cause

1. **`CI=1` отсутствовал** в env nx child → при конфликте порта :4201 nx зависал на интерактивном prompt (`Would you like to use a different port?`) при piped stdio (TZ-OPS-320).
2. **Healthy :4201 убивался** в preflight и запускался duplicate spawn → race/hang вместо переиспользования ручного `nx serve`.
3. **SPA health** принимала любой HTTP 2xx на порту — не отличала Angular от постороннего listener.
4. **При timeout** launcher не завершался с `exit(1)` и не показывал command/cwd/tail.
5. **Bugfix во время задачи:** `ReferenceError: line is not defined` в `appendFrontendLog` (crash на первом frontend chunk).

## Changes

### `start.mjs`
- `CI=1` через `buildFrontendChildEnv(true)` для `--nx`.
- Probe + reuse healthy frontend на :4201 (`tryMarkFrontendReuse`) — без duplicate spawn.
- SPA health: `isFrontendHtmlHealthy` (`<app-root` / `ng-version`).
- Frontend log: `.logs/launcher-frontend.log`.
- Spawn meta: лог `cwd` + `command`; `formatSpawnFailure` на early exit.
- Stale PID skip (`isStalePidEntry`) перед taskkill.
- Fail-fast: `exit(1)` при backend/frontend timeout с tail + log path.
- `--stop` / Ctrl+C не убивает reused external frontend.

### `scripts/start-launcher-helpers.mjs` + `scripts/start-launcher.test.mjs`
- Pure helpers + 15 regression unit tests.

## Gates

| Gate | Result |
|------|--------|
| `node --check start.mjs` | PASS |
| `node --test scripts/start-fast-path.test.mjs` | PASS (10/10) |
| `node --test scripts/start-launcher.test.mjs` | PASS (15/15) |
| `pnpm exec nx build kppdf-web` | PASS |
| `pnpm exec nx run-many -t lint --all` | PASS (0 errors) |
| `pnpm run architecture:check:nx` | PASS |
| `pnpm run ui:tokens:nx` | PASS |

## Two full launches (`node start.mjs --nx --no-browser`)

### Run 1 — clean spawn
- `frontend spawn: cwd=D:\kppdf-8.0\frontend-nx`
- `frontend command: node ...\nx.js serve kppdf-web --port=4201`
- **frontend 6s · backend 15s · wall-clock 21s** → Ready panel

### Run 2 — occupied healthy :4201 (manual nx pre-started)
- `Порт 4201 — healthy dev-server, переиспользуем`
- `frontend reused (existing :4201)` — no duplicate spawn
- **frontend 2s · backend 12s · wall-clock 19s** → Ready panel

## Executor report

Symptom (backend ~15s, frontend 180s timeout) воспроизводим при piped stdio + port conflict без `CI=1`. Fix: CI=1, healthy port reuse, SPA probe, dedicated log, fail-fast diagnostics. Legacy `:4200`, `--stop`, `--reset` preserved.
