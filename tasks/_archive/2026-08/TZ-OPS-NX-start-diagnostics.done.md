# TZ-OPS-NX-start-diagnostics — done

> Archived: 2026-08-29. Checklist: `docs/agent-checklists/TZ-OPS-NX-start-diagnostics.md`.
> Mode: analysis-only. No files under `frontend/**`, `backend/**`,
> `frontend-nx/**`, `package.json`, `scripts/**`, `start.mjs` were modified.

## Verdict

**PASS — converges, does not hang.** Slow-ish (~20–25s to fully ready under
`--nx`), with two precisely measured, fixed, reproducible causes (Mongo
container recreation, backend TS cold compile) accounting for the bulk of
it. No indefinite hang was reproduced in two clean cycles in this
environment. See "Not covered" at the end for what this run could not test.

## Environment at task start (before any action)

- `kppdf-mongo` container: already running & healthy (started ~3 min prior,
  outside this task).
- Port `3000`: **occupied by a stray/untracked process** —
  `node --enable-source-maps D:\kppdf-8.0\backend\dist\src\main`, spawned
  via a `cmd.exe` wrapper (parent chain: `cmd.exe(10464)` → `cmd.exe(34376)`),
  PID `34520`. Not present in `.start.pids.json`. This is a compiled
  (`dist/src/main`, i.e. prod-style) backend run directly, not via
  `start.mjs` — almost certainly a leftover from an earlier, unrelated
  manual/agent session.
- `.start.pids.json` present but **stale**: recorded `backend: 28488`
  (a `cmd.exe`, unrelated to the live 34520 node process) and
  `frontend: 31460` (process no longer existed at all).
- Port `4201`/`4200`: nothing listening (frontend-nx not running).

This mismatch — tracked PID file pointing at dead/wrong PIDs while an
untracked process actually holds the port — is itself relevant to the
"PID / stale listener cleanup" question in scope; see Finding 3.

## Cycle 1 — `node start.mjs --nx --no-browser --verbose`

Pre-existing Mongo container reused as a base (but see Finding 1 — it gets
recreated anyway), stray port-3000 process present at launch.

| Time (local) | Event | Source |
|---|---|---|
| 13:36:36 | `start.mjs` launched | external |
| 13:36:36 | preflight: "Порт 3000 (backend) занят — освобождаем…" → "✔ Порт 3000 освобождён (pid 34520)" | start.mjs log |
| 13:36:36 | (external probe) `GET /api/health` → **200** at t=0s | external — **artifact of the stray process still answering in the split-second before/while preflight's kill took effect; discard as a real "backend ready" signal** |
| 13:36:37 | `docker rm -f kppdf-mongo` + `docker compose up -d mongo mongo-init` (blocking) → Healthy | start.mjs log |
| — | "✔ Mongo готов за 0s" | start.mjs log — **misleading**: this only times the post-`docker compose up` polling loop, which is instant because `docker compose up -d` itself already blocked until healthy. The real Mongo-recreate cost (~11s, see isolated measurement below) is silently absorbed into step 2 with no elapsed-time reporting. |
| — | deps: both already installed, skipped | start.mjs log |
| — | backend pid=34404, frontend pid=31588 spawned | start.mjs log |
| 13:36:49 | backend: "Starting compilation in watch mode..." | start.mjs log (backend stdout) |
| 13:36:53 | frontend: "Application bundle generation complete. [2.263 seconds]" | start.mjs log (frontend stdout) |
| 13:36:57 | "✔ frontend готов за 6s (4 попыток, health 1ms)" | start.mjs log |
| **13:36:57** | (external probe) `GET /kit/overview` → **200** at t=21s from launch | external — consistent with internal timer (spawn ~13:36:51 + 6s) |
| 13:36:58 | backend: "Found 0 errors. Watching for file changes." (tsc compile done, ~9s) | start.mjs log |
| 13:37:00.953 | Nest: "Nest application successfully started" | backend pino log |
| — | "✔ backend /api/health готов за 12s (7 попыток, health 205ms)" | start.mjs log |
| — | Ready panel: **"Все сервисы готовы за 6s"** | start.mjs log — **bug/UX finding, see Finding 2**: uses the *fastest* service's elapsed time (frontend, 6s), not the slowest (backend, 12s) |
| 13:37:37 | `node start.mjs --stop` issued | external |
| 13:37:38 | stop command returned ("остановлен backend pid 34404", "остановлен frontend pid 31588", `docker compose down` removed mongo containers) | external |
| 13:37:40 | verified: **zero listeners on :3000/:4201** | external |

## Cycle 2 — `node start.mjs --nx --no-browser --verbose` (genuinely cold Mongo — container was fully removed by cycle 1's `--stop`)

| Time (local) | Event | Source |
|---|---|---|
| 13:37:59 | `start.mjs` launched (pre-state: no listeners on 3000/4201/27017) | external |
| 13:38:00 | `docker rm -f` (no-op, nothing to remove) + `docker compose up -d mongo mongo-init` (blocking) → Healthy | start.mjs log |
| — | "✔ Mongo готов за 0s" (same measurement caveat as cycle 1) | start.mjs log |
| — | backend pid=32208, frontend pid=27916 spawned | start.mjs log |
| 13:38:12 | backend: "Starting compilation in watch mode..." — **13s after launch**, i.e. preflight + Mongo container recreate + spawn overhead | start.mjs log |
| **13:38:19** | (external probe) `GET /kit/overview` → **200** at t=20s from launch | external |
| 13:38:15.831 | frontend: "Application bundle generation complete. [2.224 seconds]" | start.mjs log |
| — | "✔ frontend готов за 6s (4 попыток, health 1ms)" | start.mjs log |
| 13:38:20 | backend: "Found 0 errors." (tsc compile, **8s** from compile-start) | start.mjs log |
| 13:38:23.170 | Nest: "Nest application successfully started" (**3s** after tsc finished — DI graph + Mongoose connect + autoIndex + 5 seed services + 97-controller permission scan) | backend pino log |
| **13:38:23** | (external probe) `GET /api/health` → **200** at t=24s from launch | external — matches internal |
| — | "✔ backend /api/health готов за 12s (7 попыток, health 210ms)" | start.mjs log |
| — | Ready panel: "Все сервисы готовы за 6s" (same Finding 2 caveat) | start.mjs log |
| 13:39:36 | `node start.mjs --stop` issued | external |
| 13:39:38 | stop command returned, both PIDs killed, `docker compose down` removed mongo containers | external |
| 13:39:40 | verified: **zero listeners on :3000/:4201**, `.start.pids.json` removed | external |

## Isolated measurement — Mongo container recreate cost

Same two commands `startMongo()` runs internally, timed standalone:

```
docker rm -f kppdf-mongo
docker compose up -d mongo mongo-init
```

Result: **11.131s** wall-clock (`time` builtin), confirmed `rs.status().ok
== 1` immediately after. `docker-compose.yml`'s mongo healthcheck is
`interval: 10s, timeout: 5s, retries: 5`, **no `start_period`** — the
observed ~11s is consistent with the container's first health probe
firing near t≈0/1s (mongod not yet accepting connections), then Docker
waiting the full `interval` (10s) before the second probe succeeds.

## IPv4 checks (task requirement)

```
GET http://127.0.0.1:3000/api/health   → HTTP 200 (0.208s)
GET http://127.0.0.1:4201/kit/overview → HTTP 200 (0.002s)
```

Both confirmed while cycle 2 was up. Passed on every cycle.

## IPv6 check (advisory)

```
GET http://[::1]:3000/api/health   → HTTP 200, full JSON health body returned
GET http://[::1]:4201/kit/overview → connection refused
```

`netstat` while running:
```
TCP    0.0.0.0:3000   LISTENING   (backend)
TCP    [::]:3000      LISTENING   (backend — dual-stack)
TCP    0.0.0.0:4201   LISTENING   (frontend-nx)
                                   (no [::]:4201 entry — IPv4-only)
```

**Advisory, not a defect.** `frontend-nx/apps/kppdf-web/project.json`
`serve.options.host` is explicitly `"0.0.0.0"` (IPv4-any), not `"::"`
(dual-stack-any) — the Angular/esbuild dev-server binds exactly what it's
told. Backend (`app.listen(port)`, no host arg) gets Node's default
dual-stack `::` binding and answers on both families. `start.mjs` already
avoids this gap entirely by hardcoding its own health probes to
`127.0.0.1` (see the comment at `HOSTS` definition) instead of `localhost`
or `::1`.

## Findings — full detail

### Finding 1 (root cause, largest, easily fixable) — Mongo container is unconditionally recreated on every start

`startMongo()` always runs `docker rm -f kppdf-mongo` then a fresh
`docker compose up -d mongo mongo-init`, **even when a healthy
`kppdf-mongo` container is already running** (observed directly: cycle 1
started with a container already `Up ... (healthy)`, and start.mjs
recreated it anyway). Measured cost: **11.1s**, ~45–55% of total start
time, paid on every single invocation regardless of prior state.

**Minimal remediation (not applied — analysis-only):** before the
`docker rm -f` + `compose up` sequence, check whether `kppdf-mongo` is
already running AND healthy (`docker inspect --format '{{.State.Health.Status}}' kppdf-mongo`,
or reuse the existing `waitMongo()` `rs.status().ok` probe directly) and
skip straight to `waitMongo()` if so. Separately/in parallel: add
`start_period: 5s` (or shorten `interval` to ~2–3s with more retries) to
the mongo healthcheck in `docker-compose.yml` so a cold container doesn't
pay a full unconditional 10s tax on its first failed probe.

### Finding 2 (cosmetic but actively misleading) — Ready panel reports the *fastest* service's time, not the slowest

`printReadyPanel()` computes:
```js
const earliest = Math.min(...[mongo, backend, frontend]
  .filter(x => x.startedAt && x.readyAt)
  .map(x => x.readyAt - x.startedAt));
```
`Math.min` picks the fastest-converging service's own elapsed time (here,
frontend's 6s) and prints it as **"Все сервисы готовы за 6s"**, even
though backend — the actual last service to become ready — took 12s from
its own spawn (and ~24s wall-clock from the very start of `start.mjs`).
A PO glancing at "6s" would materially underestimate real startup time.

**Minimal remediation (not applied):** use `Math.max` of `(readyAt −
scriptStart)` per service (or simply `Date.now() − scriptStartTime` at the
moment the panel prints), not `Math.min` of each service's own elapsed
window.

### Finding 3 (observability gap, not a functional bug) — `.start.pids.json` can go stale and misreport reality

At task start, the PID file contained PIDs that were either dead
(`frontend: 31460`) or pointed at the wrong process entirely
(`backend: 28488`, a `cmd.exe`, while the actual listener on :3000 was an
unrelated, untracked `node dist/src/main` process, PID 34520). This
happens whenever a dev server is stopped by any means other than
`start.mjs --stop` or its own SIGINT/SIGTERM handler (killed terminal,
IDE stop, crash) — the file is never rewritten/cleared.

Importantly, **this does not actually break cleanup**: both `preflight()`
and the `--stop` path call `ensureDevPortsFree()`, which scans for *any*
process LISTENing on the target port via `netstat`/`lsof` (not just the
tracked PID) and kills it. This was directly confirmed in cycle 1 — the
untracked stray process on :3000 was correctly detected and killed. The
gap is purely that `.start.pids.json`, if read directly by a human or
another tool as a source of truth for "what is running", can lie.

**Minimal remediation (not applied):** either (a) validate the tracked PID
is still alive and actually LISTENing on the expected port before trusting
it for status displays, or (b) treat the file as pure historical metadata
and always prefer the netstat-based scan for any "what's running" answer
(which the script already does for actual kill decisions).

### Finding 4 (informational, not a bug) — "frontend ready" only proves the dev-server answers 2xx on `/`, not that the SPA boots

`waitFor(HOSTS.frontend, 'frontend', ...)` calls `checkHealth()`, which for
any URL not ending in `/api/health` just checks `httpOk` (2xx). It does
not verify the Angular bundle actually executes client-side or that
`/kit/overview`'s client-side route renders — only that the dev-server's
SPA-fallback `index.html` (or whatever the requested path resolves to
server-side) returned 200. This is normal/acceptable for a dev-server
readiness probe, called out here only because the task explicitly asked to
verify `GET /kit/overview` — that check (done above, HTTP 200 in 2ms) is a
transport-level check, not an in-browser render check.

## What is confirmed healthy / working correctly

- Order of operations (preflight → Mongo → deps → spawn backend+frontend
  in parallel → poll both) is sound and matches the documented intent.
- IPv4 loopback health probing (`127.0.0.1`, not `localhost`) is a
  deliberate, correct design choice — verified it avoids the exact IPv6
  gap the frontend-nx dev-server has (Finding is N/A — already handled).
  correctly.
- Port-based stale-listener cleanup (`findListeningPidsOnPort` via
  `netstat -ano` / `lsof`, then `killTree`) works correctly and was
  observed catching a real untracked stray process live during this task.
- Clean shutdown (`--stop`) reliably freed both dev ports within ~1–2s in
  both cycles, and the child-exit handler in `spawnDetached()` correctly
  distinguishes an intentional stop (`SIGTERM`/`SIGINT`/code 0) from an
  unexpected early crash (any other exit → `status = 'failed'` + error
  log) — this was verified by code reading only; no live crash was
  triggered in this session (would have required touching `.env` or
  otherwise destabilizing the shared dev environment, judged out of scope
  for an analysis-only task).
- `checkHealth()`'s `/api/health` semantics correctly treat a 2xx response
  with `body.status === 'error'` or `body.info.mongo.status === 'down'` as
  NOT ready — so a degraded-but-listening backend won't false-positive.

## Not covered by this run (explicit gaps, not silently assumed away)

- Fresh install (`node_modules` absent) — `installDeps()` path not
  exercised; both cycles found deps already present.
- Cold Docker daemon start / first-time `mongo:7` image pull.
- `--reset` flow.
- A live-triggered early crash of backend or frontend (reviewed via code
  only, per above).
- Any scenario where the *actual* reported hang originated outside what
  two clean, otherwise-healthy-environment cycles could reproduce. If the
  PO's original concern is one of the above, it needs a separate,
  targeted repro (ideally with the PO's own timing/log excerpt from the
  incident) rather than more blind cycles here.

## Remediation plan summary

| # | Fix | Effort | Can be done independently/in parallel? |
|---|---|---|---|
| 1 | Skip Mongo container recreate when `kppdf-mongo` is already healthy | small | yes — isolated to `startMongo()` in `start.mjs` |
| 1b | Add `start_period` (or shorten `interval`) on mongo healthcheck | trivial | yes — isolated to `docker-compose.yml`, independent of 1 |
| 2 | Ready panel: report `Math.max` per-service elapsed (or wall-clock from script start), not `Math.min` | trivial | yes — isolated to `printReadyPanel()` |
| 3 | Don't trust stale `.start.pids.json` for status display; keep netstat-scan as source of truth for actions (already the case) | small | yes — independent, cosmetic/observability only |

None of these are applied — this task is analysis-only per its scope. All
four are small, independent, and safe to hand to a follow-up executor TZ
each on its own conflict key (`start.mjs` for 1/2/3, `docker-compose.yml`
for 1b) without touching the others.
