# Очередь

**Шпаргалка PO:** [`docs/PO-AGENT-FLOW.md`](../../docs/PO-AGENT-FLOW.md)

**Обрыв / новый чат Buffy — всегда:** [`tasks/PROMPT-RESUME-ANY.md`](../PROMPT-RESUME-ANY.md)

**Перед деплоем (VPN OFF):** [`ops/PROMPT-OPS-310-HARDEN.md`](./ops/PROMPT-OPS-310-HARDEN.md)

## Живые потоки

| Поток | Где | Статус |
|-------|-----|--------|
| **AUTH-302 CSP/login P0** | `ops/TZ-AUTH-302-…` · `PROMPT-AUTH-302-CSP.md` | **сначала**, если вход на проде сломан |
| KP-COMPLETE | `kp-vitrine/WAVE-KP-COMPLETE.md` | хвост **TZ-SALES-348** |
| Server harden | `ops/TZ-OPS-310-…` | gate перед обычным деплоем |
| Perf photos | `perf/WAVE-PERF-PHOTOS.md` | backlog |

## Не брать

- Всё из `_archive/` и `_park/` без явной команды PO  
- Параллель на `proposal-create*` пока 348 не закрыт  
- wipe без русского подтверждения (`docs/ops/DANGEROUS-OPS.md`)

Закрытые волны и старые промпты: `tasks/_archive/2026-08/waves-done/`, `…/prompts-spent/`.
