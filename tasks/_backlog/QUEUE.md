# Очередь

**Шпаргалка PO:** [`docs/PO-AGENT-FLOW.md`](../../docs/PO-AGENT-FLOW.md)

**Обрыв / новый чат исполнителя:** [`tasks/PROMPT-RESUME-ANY.md`](../PROMPT-RESUME-ANY.md)  
**Или эта волна целиком:** [`kp-vitrine/PROMPT-KP-SHAME-CONTINUOUS.md`](./kp-vitrine/PROMPT-KP-SHAME-CONTINUOUS.md)

## Живые потоки

| Порядок | Поток | Где | Статус |
|---------|--------|-----|--------|
| **PO / основной** | Create КП refactor | `proposal-create*` | идёт у PO — **не параллелить** второй агент сюда |
| **Фон (idle AI)** | Desktop WIP → TZD-40 → TZD-45 | `desktop/PROMPT-BACKGROUND-DESKTOP.md` | READY — disjoint от КП |
| **Параллель ОК** | Браузерная Печать (sandbox) | `kp-vitrine/TZ-SALES-366-kp-browser-print-sandbox.md` | READY — в основном `template-center` (не page.ts) |
| — | KP Table Editor finish | `WAVE-KP-TABLE-EDITOR-FINISH.md` A→E | **DONE на prod** |
| — | Печать семьи бланков | `tasks/_park/TZ-SALES-320-…` | PARK — после «КП на 100%» |

**Канон сейчас:** основной чат = рефактор КП; второй ИИ = только Desktop/MCP по `PROMPT-BACKGROUND-DESKTOP.md`.  
Wipe запрещён без русского подтверждения (`docs/ops/DANGEROUS-OPS.md`).  
Deploy — только по слову PO (не фон).

## Не брать

- `_archive/` / `_park/` без явной команды PO  
- Параллель на `proposal-create*` / `proposals.page*` / `quotation*` / KP build templates  
- wipe / auto-deploy / `ruvector.db`

Закрытые волны: `tasks/_archive/2026-08/waves-done/`, `…/prompts-spent/`.
