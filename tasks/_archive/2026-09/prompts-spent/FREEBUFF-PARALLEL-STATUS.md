# Freebuff parallel — статус 2026-09-04

## Жёсткое правило (пока Claude = S41)

Claude держит `frontend-nx/apps/kppdf-web/**` (studio) + `nx build kppdf-web`.  
**Второй агент на тот же FE-tree — нельзя** (PO-CANON п.4).

## Что проверено — не отдавать Freebuff

| Кандидат | Почему нет |
|----------|------------|
| Doc Studio S27–S40 / S37B | DONE / Claude |
| S41 vitrina | Claude сейчас |
| QA Gates Q1–Q4b | DONE |
| DCI 601/602 | DONE (`_archive/2026-08`) |
| PDF-FONT-READY | DONE (`_archive/2026-08`); backlog-копия устарела |
| Units DELETE FE | уже в `units.registry.ts` + `PiUnitsService.remove` |
| Sales canon / KP Family | DONE |
| CRM punch-list (авторезерв, Invoice…) | только по явной команде PO (п.7) |

## Slot Freebuff сейчас

**IDLE** — готовой безопасной цепочки без пересечения с S41 **нет**.

## После archive S41 (очередь для Freebuff — выбрать PO)

| # | Волна | Нужна команда PO? | Conflict |
|---|--------|-------------------|----------|
| A | NX `/contracts` UI (BE file-contract уже есть) | **да** | `frontend-nx` registries/sales contracts |
| B | Invoice MVP (канон говорит «не сейчас») | **да + осторожно** | money path |
| C | Auto-reserve + SupplyRequest | **да** | warehouse + order |
| D | Живой AC2 → archive S37 (2 мин браузер) | PO/Cursor, не Freebuff | — |

Без выбора A/B/C — не выдумывать модуль под загрузку Freebuff.
