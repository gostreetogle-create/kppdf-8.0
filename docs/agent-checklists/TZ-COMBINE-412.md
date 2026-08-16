# TZ-COMBINE-412 checklist

> Status: **DONE**
> Marker: archived `tasks/_archive/2026-08/TZ-COMBINE-412.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: composer-executor-412
- claimed_at: 2026-08-16T20:04:18.612Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Unknown task; Claim slot filled)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] `_NOW.md` + `_active/` — no foreign CLAIM on keys
- [x] TZ / deps прочитаны
- [x] Claim slot заполнен
- [x] `tasks/_active/TZ-COMBINE-412.md` (removed at archive)

## Acceptance

- [x] Same-order rows fused (gap-0 / border-t-0 / border-rule-strong); no «ЗАКАЗ» headers
- [x] Inter-order boundary `mt-3`
- [x] Product name → `editProduct` + hover underline; ▸ expands; pencil kept
- [x] Module chips `py-2` + pencil → `/modules/:id`; grip for drag
- [x] Specs: name→edit, chevron expand, boundary/fuse classes
- [x] FE tsc + jest 26/26 PASS; deploy not run; DnD jump not touched
- [x] `design-combine.page.md` + method link

## Integrity slot

- [x] Тип: page
- [x] page.md updated; PAGE-TZ-INDEX already listed 412
- [x] SECTION-READINESS N/A
- [x] Coupling map N/A
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS
- `cd frontend && pnpm exec jest src/app/pages/dashboard/dashboard.page.spec.ts --no-coverage` → PASS 26/26

## Executor report

- Fuse + name edit + module pencil on `/design/combine`.
- Conflict keys only. DnD physics left for 413.
- known_limitation: DnD jump → 413.

## Closeout

- [x] archive + lock + progress + remove `_active` / root TZ
- closed_at: 2026-08-16T23:10:00+03:00
