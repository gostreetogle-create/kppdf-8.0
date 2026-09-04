# NOW

updated_at: 2026-09-04T23:52:00+03:00

## ACTIVE / LIVE

**Doc Studio FINISH S27→S37 — WAVE CLOSED.** S37C fixed the root cause
(`applyTableAggregateTokensToBlocks` now `.toObject()`s before spreading a Mongoose
Document); S37 re-checked live — 6/6 AC PASS, archived DONE. Claude terminal free.

Freebuff → **NX Gantt L0** continuous, unaffected (backend-only S37C work).

## NEXT

1. PO: выбрать следующую тему для Claude — A contracts / B Invoice / C auto-reserve,
   или ждать (см. PARK)
2. Freebuff Gantt RESUME (G2→G7) продолжается независимо
3. Gantt L1+ — по команде PO

## Гигиена окружения

`frontend-nx` dev-server может тихо перестать подхватывать изменения (наблюдалось
~24h стали 2026-09-03→04). **Перед любым live browser-тестом** проверяй uptime
процесса на :4201, перезапускай `pnpm start`, если сомневаешься. Подробности:
`docs/audits/2026-09-04-docstudio-s37-s41-live-closeout.md`.

## DONE

S27–S40 + S37B + S37C + S41 + **S37 (WAVE closed, 6/6 AC live PASS)**

## PARK

`/contracts` · Invoice · auto-reserve · Gantt L1+  
