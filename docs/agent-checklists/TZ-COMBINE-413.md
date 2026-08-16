# TZ-COMBINE-413 checklist

> Status: **DONE**
> Marker: archived `tasks/_archive/2026-08/TZ-COMBINE-413.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: gemini-executor-combine-413
- claimed_at: 2026-08-16T20:16:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable
- closed_at: 2026-08-16T20:20:00Z

## Preflight

- [x] Claim + `_active` marker
- [x] Conflict keys free

## Acceptance

- [x] Solid opaque drag preview; placeholder opacity 0
- [x] Softened drop animating
- [x] Module pencil → openModuleEdit; stay on /design/combine
- [x] afterClose reload
- [x] Gates FE tsc + jest (33/33)
- [x] Docs updated
- [x] Archive + commit conflict keys + push

## Integrity slot

- [x] Тип: page
- [x] FIC N/A (polish + dialog mirror)
- [x] page.md updated
- [x] SECTION-READINESS N/A
- [x] Чужой WIP не в коммите
- [x] Coupling N/A
- [x] DOCS-INTEGRITY ok

## Gates (факт)

- `pnpm --dir frontend exec tsc -p tsconfig.app.json --noEmit` → PASS
- `pnpm --dir frontend exec jest dashboard.page.spec.ts dashboard-dialog.service.spec.ts` → PASS 33/33

## Executor report

A) DnD polish on module + «целиком» chips via component styles + `COMBINE_CHIP_DRAG_PREVIEW_CLASS`.
B) `openModuleEdit` mirrors `openProductEdit`; `editModule` no longer navigates.
known_limitation: CDK always preview+placeholder — documented in method one-liner.

## Closeout

- [x] archive + lock + progress + remove `_active` + root TZ
- Status = DONE
