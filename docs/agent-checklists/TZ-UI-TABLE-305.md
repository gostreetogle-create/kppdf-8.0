# TZ-UI-TABLE-305 checklist

> Status: **DONE**
> Marker: archived — `tasks/_archive/2026-08/TZ-UI-TABLE-305.done.md`
> Commit/push: **YES per session close-board prompt**

## Claim slot

- agent_id: openai/gpt-5.6-luna (Buffy)
- claimed_at: 2026-08-05T16:37:52Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room in this session)

## Preflight

- [x] main synchronized to `cb35c2f7`
- [x] Read TZ-UI-TABLE-305 and table-kit SoT §4.2
- [x] No competing active claim on 305 conflict keys
- [x] Claim + `_active`

## Acceptance

- [x] 7 raw registries → app-pi-table
- [x] fe tsc + jest PASS
- [x] Archive DONE + lock + progress

## Gates / report

- `cd D:\\kppdf-8.0\\frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` — **PASS** (exit 0; no output)
- `cd D:\\kppdf-8.0\\frontend && pnpm exec jest --testPathPattern "texts.page|templates.page|tables.page|documents.page|forms.page|inventory-dashboard|text-block-categories|pi-table" --no-coverage` — **PASS** (11 suites, 86/86 tests)
- `git -C D:\\kppdf-8.0 diff --check` — **PASS** after checklist whitespace cleanup

## Executor report

- Что сделано: все семь реестров из SoT §4.2 переведены на `app-pi-table`; CRUD, filters, status controls, row actions, loading/empty states and pagination were preserved. Forms now passes its page slice with server-style sort events; Documents and Templates use the kit pager; TextBlockCategories keeps the Group Workspace and CRUD slots.
- Conflict disclosure: only TZ-UI-TABLE-305 page keys, matching existing/new smoke specs, page docs, checklist, active marker/map, session board and progress were touched. ProductsPage and shared expandable-row changes remain under the sequential TZ-UI-TABLE-303 claim and are not included in this archive.
- Known limits: dedicated smoke specs were added for Documents, Forms and Inventory Dashboard; existing specs cover Texts, Templates, Tables, TextBlockCategories and the shared kit. Browser screenshot smoke was not run.

## Closeout

- archive: `tasks/_archive/2026-08/TZ-UI-TABLE-305.done.md`
- lock: `.mimocode/locks/TZ-UI-TABLE-305-flat-kit.lock`
- closed_at: 2026-08-05
