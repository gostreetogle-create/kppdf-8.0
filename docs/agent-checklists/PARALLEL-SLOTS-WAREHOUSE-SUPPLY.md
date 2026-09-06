# PARALLEL-SLOTS — Warehouse UI ∥ Supply BE/kit

updated_at: 2026-09-05

| Slot | Agent | Owns | Must NOT touch |
|------|-------|------|----------------|
| A | Freebuff | `frontend-nx/.../warehouse/**` (или `pages/inventory/**`); W1–W4 TZ; **`app.routes.ts` + chrome «Склад»** в W1 | `backend/**` app logic; `/supply` page до W1 DONE |
| B | Claude | `backend/**` kit/reserve/shortage (S0); после W1: `pages/supply/**` + order-hub confirm (S1–S2) | Warehouse list/balances/movements UI; не параллелить S1 с Freebuff на `app.routes.ts` |

**Параллель сейчас:** A (весь UI склада) + B **только S0 BE**.  
**После W1 archive:** Claude S1–S2 (supply page + hub).

**Не стартовать**, пока `tasks/_active/` занят days/orders inset на том же `kppdf-web` без явного split.
