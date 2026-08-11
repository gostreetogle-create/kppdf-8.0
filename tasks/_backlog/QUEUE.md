# Очередь

**Шпаргалка PO:** [`docs/PO-AGENT-FLOW.md`](../../docs/PO-AGENT-FLOW.md)

**Обрыв / новый чат исполнителя:** [`tasks/PROMPT-RESUME-ANY.md`](../PROMPT-RESUME-ANY.md)  
**Или эта волна целиком:** [`kp-vitrine/PROMPT-KP-SHAME-CONTINUOUS.md`](./kp-vitrine/PROMPT-KP-SHAME-CONTINUOUS.md)

## Живые потоки

| Порядок | Поток | Где | Статус |
|---------|--------|-----|--------|
| **1** | KP shame polish | `kp-vitrine/WAVE-KP-SHAME-POLISH.md` · **350→354** | READY — Cursor Agent + `PROMPT-KP-SHAME-CONTINUOUS` |
| — | KP-COMPLETE | 340…348 | DONE (на проде) |
| — | OPS-310 / AUTH | archive | DONE (на проде) |
| — | Perf photos | `perf/` | DONE (история) |

**Канон сейчас:** стыд Create КП на показе — без новых фич, без деплоя.  
Wipe запрещён без русского подтверждения (`docs/ops/DANGEROUS-OPS.md`).

## Не брать

- `_archive/` / `_park/` без явной команды PO  
- Параллель на `proposal-create*` / `proposals.page*` внутри 350–354  
- wipe / auto-deploy

Закрытые волны: `tasks/_archive/2026-08/waves-done/`, `…/prompts-spent/`.
