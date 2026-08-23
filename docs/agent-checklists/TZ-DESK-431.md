# TZ-DESK-431 — Paper & Ink: padding + grid в tray и supply flyout

**agent_id:** freebuff (takeover from freebuff-desk-wave)
**claimed_at:** 2026-08-23T12:20:00+0300
**workspace:** D:\kppdf-8.0
**team_room_claim:** unavailable
**Status:** GATES (code already patched, verifying)

## Conflict keys

- `frontend/src/app/pages/supply/supply-quick-order.component.ts`
- `frontend/src/app/shared/orders/order-hub-tray.component.ts`
- `frontend/src/app/pages/desk/manager-desk.page.ts`

## AC

1. Desk flyout supply ≥ 48rem (`data-panel=supply` + `--wide`).
2. Expanded supply: strips stack / 2-col, нет дыр; padding ≥16px в bordered blocks.
3. Tray cards padding ≥16px.
4. Inputs в expanded supply: единая высота ~40px.
5. tsc PASS; test supply-quick-order order-hub-tray manager-desk PASS; lint 0 new.

## Plan

1. `manager-desk.page.ts`: `panel==='supply'||'docs'` в wide-условии.
2. `supply-quick-order.component.ts`: container grid вместо viewport-only; p-4; min-h-touch на инпутах.
3. `order-hub-tray.component.ts`: p-3→p-4 на карточках.
4. Тесты, gates, archive, commit.

## Results

- (заполнить)
