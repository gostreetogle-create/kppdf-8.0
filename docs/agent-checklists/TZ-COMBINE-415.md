# TZ-COMBINE-415 checklist

> Status: **DONE**
> Marker: archived `tasks/_archive/2026-08/TZ-COMBINE-415.done.md`
> Commit/push: по `docs/GIT-POLICY.md` (conflict keys + closeout only)

## Claim slot

- agent_id: composer-executor-415
- claimed_at: 2026-08-16T23:28:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] `_NOW.md` + `_active/` — no foreign CLAIM on conflict keys
- [x] TZ / deps прочитаны (413 DnD keep; 414 expand keep)
- [x] Claim slot заполнен
- [x] `tasks/_active/TZ-COMBINE-415.md` (removed at archive)

## Acceptance

- [x] Order №: no `pi-tech-label`; `font-mono text-xs font-medium text-ink` + `bg-paper-2`; hover underline
- [x] Product name: `text-ink`
- [x] Sticky stage titles: `text-ink`
- [x] CDK placeholder opacity scoped to mini-kanban only
- [x] FE tsc + jest dashboard.page 28/28 PASS; archive; commit+push conflict keys only; no deploy

## Integrity slot

- [x] Тип: page
- [x] FIC A–E: N/A (contrast classes only) / page.md note
- [x] page.md + PAGE-TZ-INDEX touch
- [x] SECTION-READINESS N/A
- [x] Чужой WIP не в commit; conflict keys соблюдены
- [x] Coupling map N/A
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS
- `cd frontend && pnpm exec jest src/app/pages/dashboard/dashboard.page.spec.ts --no-coverage` → PASS 28/28

## Executor report

- Dropped `pi-tech-label` on order №; readable mono + text-ink. Name + sticky titles text-ink. Placeholder opacity scoped to mini-kanban.
- known_limitation: live browser light/dark smoke optional; class AC in jest.

## Closeout

- [x] archive + lock + progress + remove `_active` / root TZ
- closed_at: 2026-08-16T23:32:00+03:00
