# TZ-UI-TABLE-303 checklist

> Status: **DONE**
> Marker: archived — `tasks/_archive/2026-08/TZ-UI-TABLE-303.done.md`
> Commit/push: **YES per session close-board prompt**

## Claim slot

- agent_id: openai/gpt-5.6-luna (Buffy)
- claimed_at: 2026-08-05T20:00:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room in this session)

## Preflight

- [x] main synchronized to `cb35c2f7`
- [x] Read TZ-UI-TABLE-303 and table-kit SoT §1 Expandable
- [x] 305 archived before starting this sequential TZ
- [x] Claim + `_active`

## Acceptance

- [x] Expandable contract + products green
- [x] fe tsc + jest PASS
- [x] Archive DONE + lock + progress

## Gates / report

- `cd D:\\kppdf-8.0\\frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` — **PASS** (exit 0; no output)
- `cd D:\\kppdf-8.0\\frontend && pnpm exec jest --testPathPattern "pi-table|products.page" --no-coverage` — **PASS** (4 suites, 45/45 tests)
- `git -C D:\\kppdf-8.0 diff --check` — **PASS** (warnings only about LF→CRLF normalization)

## Executor report

- Что сделано: `app-pi-table` now supports an explicit active-row predicate and accessible region label for Expandable rows. Products uses a single-expand `expandedId`, keyboard Enter/Space activation, `aria-expanded`, and a named module-composition region; tests cover switching, collapse, keyboard and a11y behavior.
- Conflict disclosure: only TZ-UI-TABLE-303 keys plus the shared table contract docs and closeout records were changed. The seven raw registry migrations are archived separately under TZ-UI-TABLE-305. No backend or deploy files changed.
- Known limits: no optional ModulesPage migration; browser screenshot smoke was not run.

## Closeout

- archive: `tasks/_archive/2026-08/TZ-UI-TABLE-303.done.md`
- lock: `.mimocode/locks/TZ-UI-TABLE-303-expandable.lock`
- closed_at: 2026-08-05
