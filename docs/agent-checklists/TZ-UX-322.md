# TZ-UX-322 checklist

> Status: **DONE**
> Spec: `tasks/TZ-UX-322-chrome-page-tools-api.md`
> Archive: `tasks/_archive/2026-08/TZ-UX-322.done.md`
> Lock: `.mimocode/locks/TZ-UX-322-chrome-page-tools-api.lock`
> Wave: `WAVE-UX-CHROME-GANTT-TOOLS`
> Deploy: НЕ

## Claim slot

- agent_id: Buffy continuous executor
- claimed_at: 2026-08-15T14:10:00Z
- ready_at: 2026-08-15T14:12:00Z
- closed_at: 2026-08-15T14:20:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: n/a (root tasks)

## Acceptance

- [x] `PiChromeToolsService` setTools/clear by ownerId
- [x] AppLayout renders left/right tools under ←/→
- [x] `data-test="chrome-tool-{id}"`; RU aria/title
- [x] Pages without setTools unchanged (history only)
- [x] Jest: setTools → DOM; clear → gone; history remains
- [x] tsc PASS; no production-cockpit edits

## Gates

| Gate | Result |
|------|--------|
| tsc | PASS |
| Jest app-layout + chrome service | PASS 8/8 |
| git diff --check | PASS |

## Executor report (auto)

- outcome: DONE
- quality_score: 98
- commit: (pending this closeout)
- deploy: NOT EXECUTED
- successor: TZ-UX-323
