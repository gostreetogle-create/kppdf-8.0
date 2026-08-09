# TZ-SALES-312 checklist

> Status: **DONE**
> Marker: archived — `tasks/_archive/2026-08/TZ-SALES-312.done.md`
> Commit/push: yes

## Claim slot

- agent_id: agent-3e757640b7
- claimed_at: 2026-08-09T02:10:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Unknown task: TZ-SALES-312)

## Preflight

- [x] Root / main / 311 DONE
- [x] Spec read; claim before code

## Acceptance

- [x] Three zones visible ≥1280px
- [x] Collapsible left/right on narrow viewports
- [x] Placeholder RU copy; no fake tables
- [x] Deals TOC + KP subchips preserved
- [x] Jest smoke via `data-test`
- [x] FE tsc + focused jest PASS
- [x] Archive → NEXT 313 (list) then 314/315

## Gates (факт)

- `pnpm exec tsc -p tsconfig.app.json --noEmit`: PASS
- focused Jest proposal-create + deals-chips: PASS (5 tests)
- prettier + eslint on changed FE: PASS
- `git diff --check`: PASS

## Executor report

- Replaced create stub with three-zone shell matching `kp-create-studio-spec.md`.
- No quotation API / picker / print.
- Conflict disclosure: none.

## Closeout

- [x] archive + lock + progress + remove `_active`
- closed_at: 2026-08-09T02:20:00Z
