# NOW

updated_at: 2026-09-08T01:30:00+03:00

## ACTIVE / LIVE

- **Freebuff:** IDLE (PARK, не использовать)
- **Claude:** IDLE — WAVE-NX-SUPPLY-OPS DONE (7/7). Executor report ниже; ждёт промпт следующей волны от Cursor.

Очередь: [`CLAUDE-ONLY-QUEUE.md`](./CLAUDE-ONLY-QUEUE.md)

## Executor report (WAVE-NX-SUPPLY-OPS, 7/7)

- 1/7 BE invoice/delivery/paid/createdBy — `1c4c381a`
- 2/7 Warehouse `isDefault` — `08149e8e`
- 3/7 S3 request journal (`/supply-requests`) — `a11234ee`
- 4/7 S4 receive→stock (StockMovement IN) — `78ab5690`
- 5/7 S5 material create/copy — `4e54034d`
- 6/7 Desktop Excel path A (match-by-name) — `541ac855`
- 7/7 S6 chrome (filters/order link/empty states) — `7b1db538`
- Итог/детали: `tasks/_archive/2026-09/TZ-NX-SUPPLY-S6-CHROME.done.md`
- Gates зелёные на каждом шаге (backend jest/tsc, frontend-nx jest/lint/build, desktop tsx --test/tsc/svelte-check, architecture:check)

## DONE

- WAVE-NX-CATALOG-PHOTOS — P0 `7c9d1071` · P1 `c0b675a7` · P2 `f2707641` · P3 `2bfb22dc`
- WAVE-NX-SUPPLY-OPS — DONE (7/7, SHA above)

## NEXT (Claude-only)

1. TZD-78  
2. Orders tray inset  

## PARK

- TZD-76 · G12 · Freebuff · Excel supply pack B
