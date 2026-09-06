# NX operational shell

## Status

Accepted and browser-verified on 2026-08-29. Canonical task: `tasks/TZ-NX-SHELL-CANON.md`.

## Canonical structure

The application uses a full-width header and a three-column workspace grid:

- left narrow tool rail: Back at the top, then left workspace tools;
- center: routed application content;
- right narrow tool rail: Forward at the top, then right workspace tools.

This is intentionally not a conventional navigation sidebar.

**Header bleed (2026-09-06):** root `AppShell` / `KitLayout` header must **not** use `pi-edge-bleed`. That utility assumes a parent with `--space-page-x` padding; on the root shell it shifts the header left and clips the «KPPDF» brand. Bleed remains correct for in-page chrome (`pi-page-chrome`) inside a padded frame.

## Extension rules

- Primary route navigation belongs in the header.
- Session/theme actions belong on the header right.
- Back and Forward stay at the top of the left and right rails respectively.
- Workspace-context controls are added through typed rail definitions.
- Page-specific actions stay in the page toolbar or table, not in global rails.
- New controls require accessible labels, tooltip/title, keyboard focus, stable test selector and correct disabled state.
- `/kit/*` retains its isolated Kit layout and must not receive a duplicate operational shell.

See `tasks/TZ-NX-SHELL-CANON.md` for the complete contract and acceptance checklist.
