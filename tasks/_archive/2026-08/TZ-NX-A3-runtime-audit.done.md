# TZ-NX-A3-runtime-audit — DONE

ARCHIVE_MARKER
outcome: PASS
closed_at: 2026-08-29
closed_by: cursor-orchestrator

## Scope

Analysis-only runtime audit of `node start.mjs --nx --no-browser` stack.
No product code changed.

## Test matrix

| Check | Result | Notes |
|-------|--------|-------|
| `node start.mjs --nx --no-browser` | PASS | Mongo + backend + frontend-nx start; Ready screen at ~21s |
| `127.0.0.1:4201` | PASS | HTTP 200 |
| `/kit/overview` | PASS | HTTP 200; browser snapshot shows kit nav + lifecycle status |
| `/kit/foundations` | PASS | HTTP 200 |
| `/kit/forms` | PASS | HTTP 200 |
| `/kit/overlays` | PASS | HTTP 200 |
| `/api/health` proxy | PASS | HTTP 200 after backend ready; transient 500 during Nest bootstrap (expected) |
| IPv4 bind | PASS | `netstat`: `0.0.0.0:4201 LISTENING` |
| IPv6 `[::1]:4201` | FAIL | Connection refused — dev-server binds IPv4 only on Windows |
| `node start.mjs --stop` | PASS | Stops backend+frontend; `.start.pids.json` removed |
| Restart after stop | PASS | New PIDs written; `127.0.0.1:4201` → 200 |
| Stale PID / listener | PASS | Stop clears PID file; port freed (TIME_WAIT only) |
| Browser console/network | PASS | `/kit/overview` renders full kit shell; no visible console errors in snapshot |

## Startup timeline (first run)

1. Mongo replica set: ~5s
2. Frontend build + serve: ~6s (4 health attempts)
3. Backend /api/health: ~15s (8 attempts, 214ms latency)
4. Total to Ready: ~21s

## Proxy behavior

- During backend boot, `/api/health` via proxy returns 500 (ECONNREFUSED) — start.mjs suppresses as expected noise.
- After backend ready: proxy returns `{"status":"ok",...}` identical to direct `127.0.0.1:3000/api/health`.

## IPv6 advisory

`kppdf-web` serve config uses `host: 0.0.0.0` (IPv4 all interfaces). Windows does not accept `[::1]:4201`. `start.mjs` correctly probes `127.0.0.1` (documented in HOSTS constant). Not a dev workflow blocker; document or add dual-stack bind in future TZ if needed.

## Auditor report

NX runtime launch is healthy: all kit routes respond, health proxy works after backend warmup, stop/restart cycle clean. IPv6 loopback unavailable on Windows — known limitation, non-blocker for current `start.mjs` IPv4 probe design. **Outcome: PASS.**

## Checklist

See `docs/agent-checklists/TZ-NX-A3-runtime-audit.md` — Integrity slot filled, status DONE.
