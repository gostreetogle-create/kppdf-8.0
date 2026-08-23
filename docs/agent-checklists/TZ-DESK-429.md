# TZ-DESK-429 — supply chrome: убрать пустую gold-row

**agent_id:** freebuff (takeover from freebuff-desk-wave)
**claimed_at:** 2026-08-23T11:55:00+0300
**workspace:** D:\kppdf-8.0
**team_room_claim:** unavailable
**Status:** VERIFYING (code already patched by freebuff-desk-wave)

## Conflict keys

- `frontend/src/app/shared/page/pi-group-workspace.component.ts`
- `frontend/src/app/pages/supply/supply.page.ts`

## AC

1. `/supply` — нет пустой gold-полоски между TOC и tools (chips=[] → row не рендерится).
2. `/desk` workflow chips row unchanged (есть chips).
3. tsc + test pi-group-workspace + lint PASS.

## Plan

1. Обернуть `.group-chips` в `@if (visibleChips().length > 0)`.
2. Тест: empty chips → `[data-test="group-chips"]` отсутствует.
3. Gates → archive → commit.

## Results

- tsc --noEmit: PASS (exit 0)
- jest pi-group-workspace: 8/8 PASS
- lint: 0 errors
- Code fix already applied (freebuff-desk-wave): `@if` guard on `.group-chips`
- AC verified: empty chips → no ghost gold row
