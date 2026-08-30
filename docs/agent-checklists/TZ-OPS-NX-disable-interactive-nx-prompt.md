# TZ-OPS-NX-disable-interactive-nx-prompt checklist

> Status: **DONE**
> Marker: `tasks/_archive/2026-08/TZ-OPS-NX-disable-interactive-nx-prompt.done.md`

## Claim slot

- agent_id: cursor-executor-ops-nx-prompt
- claimed_at: 2026-08-29T19:30:00+03:00
- workspace: D:\kppdf-8.0

## Acceptance

- [x] Nx child fully non-interactive (env + ide prefs).
- [x] Nx Console prompt blocked / fail-fast if leaked.
- [x] Healthy :4201 reuse preserved.
- [x] Regression tests updated (21/21).
- [x] Two full `node start.mjs --nx --no-browser` PASS.

## Integrity slot

- [x] Тип: ops only (`start.mjs`, launcher scripts).
- [x] FIC §A–E: N/A.
- [x] page.md / PAGE-TZ-INDEX: N/A.
- [x] Conflict keys respected.
- [x] Канон: `docs/DOCS-INTEGRITY.md`.

## Gates

- `node --check start.mjs`: PASS
- `node --test scripts/start-fast-path.test.mjs`: PASS (10/10)
- `node --test scripts/start-launcher.test.mjs`: PASS (21/21)
- `pnpm exec nx build kppdf-web`: PASS
- `pnpm exec nx run-many -t lint --all`: PASS
- `pnpm run architecture:check:nx`: PASS
- `pnpm run ui:tokens:nx`: PASS
- run 1: PASS (frontend 6s, backend 14s, total 15s, no prompt)
- run 2: PASS (frontend 6s, backend 15s, total 21s, no prompt)

## Executor report

Nx 21.4 enquirer prompt blocked via NX_SKIP_VSCODE_EXTENSION_INSTALL + ~/.nx/ide.json + stream fail-fast. CI changed to `true` for nx params.isTTY().

## Closeout

- [x] Archive created.
- [x] Active marker removed.
- closed_at: 2026-08-29T19:35:00+03:00
