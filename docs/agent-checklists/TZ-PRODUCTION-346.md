# TZ-PRODUCTION-346 checklist

> Status: **DONE**
> Marker: archived `tasks/_archive/2026-08/TZ-PRODUCTION-346.done.md`
> Commit/push: yes (PO requested; deploy forbidden)

## Claim slot

- agent_id: local-executor-composer
- claimed_at: 2026-08-16T21:42:34+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (CLI not invoked; Claim slot filled)
- closed_at: 2026-08-16T21:44:02+03:00

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на те же keys
- [x] TZ / канон / deps прочитаны
- [x] Claim slot заполнен
- [x] `tasks/_active/TZ-PRODUCTION-346-gantt-nest-indent-tint.md` был на месте

## Acceptance

- [x] Label nest indent ~10/20/30px; timeline bars unshifted
- [x] Subtle level washes product/module/work + dark; frames/meta hierarchy preserved
- [x] Worker lens same indent for module/work
- [x] Specs data-nest-depth + padding; FE tsc + jest gantt-bars 48/48
- [x] No tree/filter(347)/BE; deploy not run

## Integrity slot

- [x] Тип: page (production Gantt visual)
- [x] FIC: N/A visual CSS/markers only
- [x] production-cockpit.page.md + PAGE-TZ-INDEX updated
- [x] SECTION-READINESS N/A; Coupling map N/A
- [x] Чужой WIP не в коммите

## Gates

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS
- `pnpm exec jest --testPathPattern="gantt-bars.component.spec"` → PASS 48/48

## Executor report

- Indent via `data-nest-depth` + `GANTT_NEST_INDENT_PX=10`; washes `gantt-level-*` without !important.
- Conflict keys only bars component+spec; 347 filter untouched.

## Closeout

- [x] archive + lock + progress + _NOW + remove `_active` + root TZ
- Status = DONE
