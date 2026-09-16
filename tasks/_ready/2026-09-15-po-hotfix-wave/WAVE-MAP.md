# WAVE — PO hotfix batch 2026-09-15 (evening)

> Pack: `tasks/_ready/2026-09-15-po-hotfix-wave/`  
> PO продолжает смотреть продукт; новые находки → append в этот WAVE-MAP / `_NOW`, не размазывать.

## IN FLIGHT → выдать сейчас (архивов ещё нет!)

| # | Agent | TZ | Prompt |
|---|-------|-----|--------|
| A | Claude | `TZ-NX-DOCSTUDIO-DRAG-COORD-ROOT` | `../PROMPT-CLAUDE-DOCSTUDIO-DRAG-COORD.md` |
| B | Freebuff | `TZ-NX-DOCSTUDIO-PRINT-CSS-BODY-LEAK` | `../PROMPT-FREEBUFF-DOCSTUDIO-PRINT-CSS-LEAK.md` |

> 2026-09-15 21:55: Freebuff remainder правильно WAIT — `.done.md` drag/print **отсутствовали**. HOME-CHROME уже DONE. Стартовать A+B заново.

## DONE уже в этой сессии

| TZ | note |
|----|------|
| `TZ-NX-HOME-CHROME-TOP` | archived — chips flush, dup eyebrow gone |

## QUEUE → STOP (после A+B, sequential kppdf-web)

| # | SIZE | TZ | Conflict |
|---|------|-----|----------|
| 0 | S | `TZ-NX-HOME-DROP-FILLER-SUBTITLE` | home filler |
| 1 | S | `TZ-NX-ORDER-WS-CHROME-TOP` | order chips flush |
| 2 | S | `TZ-NX-ORDER-WS-STRIP-NAV-DUP` | cut К списку / Главную / «Править строки» |
| 3 | L | `TZ-NX-ORDER-WS-META-INLINE` | фирма/заказчик/объект + «+» |
| 4 | S | `TZ-NX-ORDER-WS-PRODUCT-SELECT-ADD` | «+» у изделия |
| 4b | S | `TZ-NX-ORDER-WS-COMPOSITION-DENSITY` | состав ~½ ширины, qty узкий, add внутри группы |
| 4c | S | `TZ-NX-MODULE-WORKTYPES-ROW-ALIGN` | модуль: виды работ одна строка, без лейбла «Вид работы» |
| 5 | S | `TZ-NX-COMPOSITION-TREE-TOGGLE-HIT` | tree toggle |
| 6 | S | `TZ-OPS-START-DIAGNOSTICS` | start.mjs |

Audit IA: `docs/audits/2026-09-15-order-workspace-ia-cleanup.md`

## Hard rules

- Один `nx build kppdf-web` агент за раз (1→2).
- A (drag) + B (print) уже параллельны (FE vs BE) — дождаться archive обоих перед стартом #1, если Claude ещё на drag и держит features/app.
- Новые баги PO → Cursor дописывает TZ в этот pack + строку в QUEUE; не стартовать вне карты.
- PARK: forms showcase · Deploy/Wipe · order-workspace PARK.md · app-shell chip-count (пока PO не сказал)

## Continuous prompt (очередь после A+B)

`PROMPT-CONTINUOUS-PO-HOTFIX-REMAINDER.md` в этой папке.
