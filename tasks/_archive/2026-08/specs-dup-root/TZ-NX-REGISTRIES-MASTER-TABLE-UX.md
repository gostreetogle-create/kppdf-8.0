# TZ-NX-REGISTRIES-MASTER-TABLE-UX

## Goal

Replace the current card-grid landing page at `/registries` with a master table of registries. Clicking a registry row expands an inline detail panel below that row; the panel contains the selected registry's complete table and controls.

## Required UX

- `/registries` remains the landing route and is reachable from the header button.
- Show registries as rows in one master table, not separate cards.
- Each row contains title, description/type, data source (API/demo), record-count state and expand/collapse control.
- Only one registry row is expanded at a time.
- Expansion is router-aware: `/registries/:registryKey` identifies the open row and survives refresh/back/forward.
- The expanded panel is rendered directly beneath the selected master row, not as a detached page and not as a generic modal dialog.
- The panel includes the existing registry detail functionality: table, filters, pagination, loading, empty, error/retry, expandable child rows and row actions where supported.
- Unknown keys have a clear not-found state and return action.
- Keep real Units API and demo Departments fixture distinct and explicitly labelled.
- Preserve shell canon: header, left Back rail, center workspace, right Forward rail.

## UI canon

Use existing Paper & Ink components and tokens. Match legacy spacing, borders, typography and breadcrumb conventions. Do not use raw colors, box-shadow, ad-hoc CSS primitives or a conventional sidebar. Page actions remain in the expanded panel toolbar; global actions remain in the shell.

## Architecture constraints

- Keep business/API code out of `libs/ui`.
- Preserve the existing `RegistryDefinition` and data-source contracts unless a narrowly justified platform change is required.
- Do not invent endpoints, permissions or fields.
- Do not duplicate the detail page implementation: extract/reuse a presentational registry detail panel if needed.
- Keep query state (`filters`, `page`, `pageSize`, `sort`) in the URL.
- Keep `row.key` as the Units identifier.

## Required verification

- Header → `/registries` click.
- Master table visible without manual URL entry.
- Expand Units row and see real Units table below it.
- Expand Departments row and see demo table below it.
- Collapse and expand another row; only one remains open.
- Query state and open key survive refresh/back/forward.
- Visual browser smoke at `/registries`, `/registries/units`, `/registries/departments`.
- Build, test, lint, architecture and UI-token gates.
