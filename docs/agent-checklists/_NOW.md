# NOW

updated_at: 2026-09-04T23:20:00+03:00

## ACTIVE / LIVE

Freebuff → **NX Gantt L0** continuous (`PROMPT-FREEBUFF-NX-GANTT-START.md`).  
Claude → S37 live closeout **done this session** (backend-only diagnostics, no
`apps/kppdf-web` touched — no conflict with Freebuff's FE Gantt work). Result: S41
**confirmed PASS live**; S37 AC2 **confirmed FAIL live** with root cause pinpointed
and a ready hotfix TZ. Claude terminal free.

## NEXT

1. **S37C** (backend-only, no FE conflict) — `tasks/_ready/TZ-NX-DOCSTUDIO-S37C-PREVIEW-BLOCK-LAYOUT-DROP.md`:
   `applyTableAggregateTokensToBlocks` spreads a raw Mongoose Document without
   `.toObject()`, dropping `layout` on every text block → Preview/PDF renders blank.
2. After S37C: re-run S37 AC2 live → archive `TZ-NX-DOCSTUDIO-S37-OPERATOR-SMOKE.done.md` → WAVE closeout.
3. Freebuff G0→G7 continues in parallel (no conflict — S37C is backend-only).
4. Gantt L1+ — отдельно по команде PO.

## Гигиена окружения

`frontend-nx` dev-server был на суточной стали (не перезапускался с 2026-09-03,
до S37B/S41) — Vite watch тихо перестал подхватывать изменения. **Перед любым live
браузерным тестом перезапускай `pnpm start` в `frontend-nx`**, иначе тестируется
вчерашний код. Подробности: `docs/audits/2026-09-04-docstudio-s37-s41-live-closeout.md`.

## DONE

S27–S36 + S38–S41 + S37B (S41 now live-confirmed; S37 blocked on S37C)

## PARK

`/contracts` · Invoice · auto-reserve · Gantt L1+  
