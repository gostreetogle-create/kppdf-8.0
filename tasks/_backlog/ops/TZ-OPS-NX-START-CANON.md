# TZ-OPS-NX-START-CANON

## Status

Accepted by PO after browser verification on 2026-08-29.

## Single command

```bash
node start.mjs --nx
```

The launcher owns Mongo, backend and frontend-nx startup. The user must not need to start Nx manually or answer prompts.

## Endpoints

- App: `http://127.0.0.1:4201/`
- Kit: `http://127.0.0.1:4201/kit/overview`
- Registries: `http://127.0.0.1:4201/registries`
- Backend health: `http://127.0.0.1:3000/api/health`

## Required launcher behavior

- frontend-nx runs from `D:\kppdf-8.0\frontend-nx` (or the equivalent repository-relative directory);
- Nx child is non-interactive: `CI=true` and `NX_SKIP_VSCODE_EXTENSION_INSTALL=true`;
- Nx Console must never be installed automatically;
- a healthy existing `4201` server is reused, not killed and respawned;
- stale PID entries are ignored safely;
- frontend stdout/stderr are retained in `.logs/launcher-frontend.log`;
- early frontend exit reports command, cwd, exit code/signal and output tail;
- timeout exits non-zero instead of waiting indefinitely;
- `node start.mjs --stop` remains safe and idempotent;
- legacy `node start.mjs` remains supported.

## Verified evidence

- `tasks/_archive/2026-08/TZ-OPS-NX-launcher-frontend-failure.done.md`;
- `tasks/_archive/2026-08/TZ-OPS-NX-disable-interactive-nx-prompt.done.md`;
- PO browser smoke: NX app launched and was usable after `node start.mjs --nx`.

## Regression gate for launcher changes

Any change to `start.mjs` or launcher helpers must run:

```bash
node --check start.mjs
node --test scripts/start-fast-path.test.mjs
node --test scripts/start-launcher.test.mjs
pnpm exec nx build kppdf-web
pnpm exec nx run-many -t lint --all
pnpm run architecture:check:nx
pnpm run ui:tokens:nx
```

For runtime changes, perform two complete `node start.mjs --nx --no-browser` cycles, including one occupied-healthy-port reuse case when possible. Do not archive without recording timings and the exact mode used.

## Forbidden regressions

- reverting to `localhost`-only health checks;
- using interactive Nx commands from the launcher;
- removing `CI=true` or the Nx Console suppression;
- killing a healthy frontend before probing it;
- silently swallowing child process errors;
- increasing the wait timeout as a substitute for fixing startup;
- requiring manual commands from the PO;
- changing frontend product code to compensate for launcher failures.
