# TZ-OPS-NX-start-diagnostics checklist

> Status: **DONE** (diagnostics complete — verdict: PASS/slow, no hang reproduced)
> Marker: archived as `tasks/_archive/2026-08/TZ-OPS-NX-start-diagnostics.done.md`
> Mode: **analysis-only** — no product code changes.

## Claim slot

- agent_id: claude
- claimed_at: 2026-08-29T00:00:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable

## Preflight

- [x] `git rev-parse --show-toplevel` → `D:\kppdf-8.0`, branch `main`
- [x] `tasks/_active/` empty before claim — no conflicts
- [x] Noted pre-existing uncommitted WIP in `start.mjs`, `package.json`,
      `backend/**`, `frontend/**` (not mine — not touched, not committed)

## Acceptance

- [x] `start.mjs` reviewed: Mongo/backend/frontend order, health polling,
      IPv4/IPv6, timeout/retry, early-crash handling, PID/stale-listener cleanup
- [x] `frontend-nx` reviewed: bind host/port, Nx→HTTP 200 latency, compile
      messages, proxyConfig
- [x] backend reviewed: time-to-first `/api/health` 200, Mongo readiness,
      Nest bootstrap delays, health endpoint behavior, warm-up vs hang
- [x] 2 clean start/stop cycles executed with timestamps recorded (+ 1
      isolated Mongo-container-recreate timing probe)
- [x] IPv4 checks: `http://127.0.0.1:3000/api/health`,
      `http://127.0.0.1:4201/kit/overview`
- [x] IPv6 checked separately, marked advisory (frontend-nx dev-server is
      IPv4-only by explicit `host: "0.0.0.0"` config — not a bug)
- [x] No product files modified (verified via `git status` at closeout)

## Integrity slot

- [x] Type: docs-only / diagnostics (no product code, no page, no permission).
- [x] FIC: N/A.
- [x] Page docs: N/A.
- [x] Section readiness: N/A.
- [x] Conflict keys: none — read-only + local process start/stop.
- [x] Coupling map: N/A.
- [x] Канон: docs/DOCS-INTEGRITY.md.
- [x] `git status` at closeout shows ZERO changes outside the three report
      files (claim, checklist, archive) — confirmed: the only tracked-path
      diffs present are pre-existing uncommitted WIP from before this task
      started (`start.mjs`, `package.json`, `scripts/architecture-check.mjs`,
      `backend/**`, `frontend/**` — noted in Preflight, untouched by me).

## Auditor report

Full report with timelines, root causes, and remediation plan is in
`tasks/_archive/2026-08/TZ-OPS-NX-start-diagnostics.done.md`.

**Headline verdict: PASS (converges, not hanging) — but slow.** Two clean
`node start.mjs --nx --no-browser` → `node start.mjs --stop` cycles both
completed successfully in **20–25s** total (well inside the 120s/180s
timeouts). No hang was reproduced in this environment. Root causes of the
~20–25s are precisely measured and dominated by two fixed costs paid on
**every single start**, not by anything actually broken:

1. **Mongo container is unconditionally recreated every run** — `startMongo()`
   always does `docker rm -f kppdf-mongo` + fresh `docker compose up -d mongo
   mongo-init`, even when a healthy `kppdf-mongo` container is already
   running. Isolated measurement: **11.1s** wall-clock for this step alone
   (`docker compose up` blocks until the healthcheck passes; `interval: 10s`
   with no `start_period` means one failed first probe forces a full 10s
   wait for the next). This is ~45–55% of total start time.
2. **Backend TypeScript cold compile** — `nest start --watch` with
   `deleteOutDir: true` wipes `dist/` (and its `.tsbuildinfo`) on every
   launch, so every start pays a full `tsc` compile of the ~90-module
   backend: **~8s** (compile-start log → "Found 0 errors").
3. Nest DI bootstrap (Mongoose connect + `autoIndex` across ~90 schemas +
   5 seed services + a 97-controller permissions scan) adds **~3s** on top.
4. Frontend-nx itself is fast: Angular/esbuild produces the initial bundle
   in **~2.2s**; the gap to the reported "готов за 6s" (~3.8s) is Nx CLI
   process spawn/project-graph overhead, not the build.

A stale/foreign process was found already listening on port 3000 at the
start of this task (`node dist/src/main`, untracked by `.start.pids.json`,
likely a leftover manual run from an earlier, unrelated session) —
`start.mjs`'s own port-scan cleanup (in `preflight()`) detected and killed
it correctly on the very first cycle. This is the mechanism working as
designed, not a bug — see full report for the one adjacent, narrower
finding (a stale `.start.pids.json` can misreport *what* is running, even
though the actual port-based kill logic is authoritative regardless).

IPv4 (`127.0.0.1:3000/api/health`, `127.0.0.1:4201/kit/overview`): both
200 OK, confirmed on every cycle. IPv6: backend is dual-stack and answers
on `[::1]:3000` fine; frontend-nx dev-server is **advisory / expected-gap**
— it binds only `0.0.0.0:4201` (IPv4-only by its own explicit `host` config
in `project.json`), so `[::1]:4201` is connection-refused by design, not a
defect. `start.mjs` already sidesteps this by probing `127.0.0.1` explicitly
(see its own code comment).

Not tested (out of this task's reach without touching product files / a
much longer session): a true cold environment (no `node_modules`, Docker
daemon cold-start, first-time `mongo:7` image pull, `--reset` flow). If the
PO's original "hangs" report came from one of those, this diagnostics run
does not cover it — flagged as a follow-up gap, not silently assumed away.

## Closeout

- [x] archive (`.done.md`) created
- [x] active marker removed
- closed_at: 2026-08-29T13:41:40+03:00
