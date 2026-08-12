# Очередь

**Шпаргалка PO:** [`docs/PO-AGENT-FLOW.md`](../../docs/PO-AGENT-FLOW.md)

**Обрыв / новый чат исполнителя:** [`tasks/PROMPT-RESUME-ANY.md`](../PROMPT-RESUME-ANY.md)  
**Или эта волна целиком:** [`kp-vitrine/PROMPT-KP-SHAME-CONTINUOUS.md`](./kp-vitrine/PROMPT-KP-SHAME-CONTINUOUS.md)

## Живые потоки

| Порядок | Поток | Где | Статус |
|---------|--------|-----|--------|
| **PO / основной** | Create КП refactor | `proposal-create*` | идёт у PO — согласовать claim |
| **Сейчас READY** | Убрать savebar над A4 | `TZ-SALES-367` + `PROMPT-KP-NO-SAVEBAR-367.md` | A4 кверху; вывод в рейл; lifecycle → Все КП |
| **Параллель** | Браузерная Печать | `TZ-SALES-366` + `PROMPT-KP-PRINT-366.md` | template-center only |
| **Фон** | Desktop WIP → TZD-40 → TZD-45 | `PROMPT-BACKGROUND-DESKTOP.md` | disjoint |
| — | Просмотр готового КП | (successor, ещё нет TZ) | PARK идея — после 367 |
| — | Печать семьи бланков | `_park/TZ-SALES-320-…` | PARK |

**Канон сейчас:** основной чат = рефактор КП; второй ИИ = только Desktop/MCP по `PROMPT-BACKGROUND-DESKTOP.md`.  
Wipe запрещён без русского подтверждения (`docs/ops/DANGEROUS-OPS.md`).  
Deploy — только по слову PO (не фон).

## Не брать

- `_archive/` / `_park/` без явной команды PO  
- Параллель на `proposal-create*` / `proposals.page*` / `quotation*` / KP build templates  
- wipe / auto-deploy / `ruvector.db`

Закрытые волны: `tasks/_archive/2026-08/waves-done/`, `…/prompts-spent/`.
