# TZ-DESK-427 — dedup icon-rail vs workflow chips

**agent_id:** freebuff-desk-wave
**claimed_at:** 2026-08-23T11:53:07+0300
**workspace:** D:\kppdf-8.0
**team_room_claim:** unavailable
**Status:** CLAIMED / IN PROGRESS

## Conflict keys

- `frontend/src/app/pages/desk/manager-desk.page.ts` (`syncChromeTools`)

## AC

1. При expand заказа нет icons на правом `app-chrome-rail`.
2. Левый rail 4 tools (create/filter/summary/notebook) остаются.
3. «Редактировать заказ» доступен из tray (не из rail).
4. No references to `studioTool('gantt'|'combine')` in desk page.
5. Frontend gates PASS.

## Plan

1. `syncChromeTools()` — right всегда `[]`; удалить `studioTool`/`openStudio`/`actionTool` dead code (если не используется).
2. «Редактировать заказ» — проверить tray: есть ли pencil/edit CTA (423/424). Если нет — добавить одну кнопку.
3. Тесты (rail right пуст при expand), gates, archive, commit.

## Results

- (заполнить)
