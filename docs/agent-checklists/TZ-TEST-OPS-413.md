# TZ-TEST-OPS-413 checklist

> Status: **DONE**
> Spec: `tasks/_backlog/TZ-TEST-OPS-413-docs-link-smoke.md`
> Archive: `tasks/_archive/2026-08/TZ-TEST-OPS-413.done.md`

## Claim slot

- agent_id: deepseek/deepseek-v4-pro (Freebuff)
- claimed_at: 2026-08-16T15:28:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: no
- closed_at: 2026-08-16T15:29:00+03:00

## Preflight

- [x] Claim + conflict keys clear (docs-only smoke)

## AC

- [x] 0 broken `.page.md` ссылок в PAGE-TZ-INDEX (41 refs проверены)
- [x] 0 broken относительных `.md` ссылок в COUPLING-MAP
- [x] design-combine.page.md boardLane ↔ COUPLING §2b согласованы; production-cockpit «По рабочим» согласован
- [x] `_NOW` отражает GANTT-401 DONE + COMBINE 401–405 DONE
- [x] archive + push

## Gates

- docs-link smoke: PASS (0 broken)
