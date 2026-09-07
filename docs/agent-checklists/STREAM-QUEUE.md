# STREAM QUEUE — Claude-only (Freebuff PARK)

> PO 2026-09-07: без Freebuff. Все волны — Claude.  
> Мастер: [`CLAUDE-ONLY-QUEUE.md`](./CLAUDE-ONLY-QUEUE.md) · слот: [`_NOW.md`](./_NOW.md)

updated_at: 2026-09-07T20:00:00+03:00

## Claude stream

| # | WAVE | PROMPT | Статус |
|---|------|--------|--------|
| 0 | Photos P3 frame closeout | `tasks/PROMPT-CLAUDE-FINISH-PHOTO-P3.md` | **DONE** — WAVE-NX-CATALOG-PHOTOS DONE (P0–P3) |
| 1 | WAVE-NX-SUPPLY-OPS | `tasks/PROMPT-CLAUDE-NX-SUPPLY-OPS.md` | **NEXT** — ждёт промпт от Cursor |
| 2 | TZD-78 chat HITL mapping | `tasks/PROMPT-CLAUDE-TZD-78-CHAT-MAPPING.md` | после Supply (или по слову PO раньше) |
| 3 | Orders hub tray inset | `tasks/PROMPT-CLAUDE-ORDERS-TRAY-INSET.md` | после TZD-78 / по слову PO |
| 4 | TZD-76 GGUF NSIS | — | PARK |
| 5 | Gantt G12 | — | PARK |

## Freebuff stream

| — | **PARK** — не выдавать промпты, пока PO не вернёт Freebuff |

## Done recently

DocStudio Chrome+S45/S46 · orphan clean · Desktop TZD-74/75/77 · Photos P0–P3 (WAVE DONE)
