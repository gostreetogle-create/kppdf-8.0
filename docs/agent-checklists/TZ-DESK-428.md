# Checklist — TZ-DESK-428 (tray padding + disclosure affordance)

**Status:** `CLAIMED / DONE` (код завершён, gates зелёные)

## Claim slot

- agent_id: freebuff
- claimed_at: 2026-08-23T13:13:06+0300
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable

## Conflict keys (только из TZ)

- `frontend/src/app/shared/orders/order-hub-tray.component.ts` ✅ свободен на старте
  (DESK-430/431 влиты ранее, файл чист)

## Acceptance criteria (из TZ)

1. Visual: cards ≥16px padding; PO screenshot scenario readable. — **PASS** (p-4, gap-5, pb-4, pl-5)
2. Disclosure headers show chevron rotating on toggle. — **PASS** (lucide ChevronDown + rotate-180, тест)
3. Keyboard: Enter/Space toggles (existing button). — **PASS** (native `<button>`, без preventDefault)
4. `order-hub-tray` tests updated. — **PASS** (+1 тест 428, 15/15)
5. Frontend gates PASS. — **PASS**

## План (факт)

1. Импорт `ChevronDown, LucideAngularModule` + `imports` + `chevronDownIcon`.
2. Spacing: summary bar `pb-3→pb-4`; grid `gap-4→gap-5`; composition lines `pl-4 space-y-0.5 → pl-5 space-y-1`; карточки уже `p-4` (431), wrapper уже `px-4`.
3. Disclosure (3 шт: composition/supply/logistics): chevron слева (rotate-180 при открытии),
   hover `hover:bg-paper-2 rounded-sm px-2 -mx-2`, бейдж «раскрыть/свернуть» вместо trailing-текста,
   `aria-expanded`/data-test без изменений; hub-режим — тот же компонент (parity автоматически).
4. Тест: chevron рендерится, rotate-180 после toggle, бейдж «раскрыть»→«свернуть».
5. Docs: manager-desk.page.md + orders.page.md строки 428.

## Gates

```bash
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit          # 0
cd frontend && pnpm exec jest --testPathPattern="order-hub-tray|manager-desk|orders" --runInBand  # 66/66 (tray 15/15)
cd frontend && pnpm exec eslint <файлы>                             # 0
git diff --check                                                    # PASS
```

## Результаты

- SHA: TBD (после push)
