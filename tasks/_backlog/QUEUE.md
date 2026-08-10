# Очередь

**Шпаргалка PO:** [`docs/PO-AGENT-FLOW.md`](../../docs/PO-AGENT-FLOW.md)

**Обрыв / новый чат Buffy — всегда:** [`tasks/PROMPT-RESUME-ANY.md`](../PROMPT-RESUME-ANY.md)

**Перед деплоем (VPN OFF):** [`ops/PROMPT-OPS-310-HARDEN.md`](./ops/PROMPT-OPS-310-HARDEN.md)

## Живые потоки

| Порядок | Поток | Где | Статус |
|---------|--------|-----|--------|
| **1** | KP-COMPLETE хвост | `kp-vitrine/` · **TZ-SALES-348** | claim в каноне; **новый Cursor Agent** + `PROMPT-RESUME-ANY` (Freebuff закрыт) |
| **2** | Server harden | `ops/TZ-OPS-310` · `PROMPT-OPS-310-HARDEN.md` | после **VPN OFF** |
| **3** | CSP / вход | AUTH-302 | код уже в main (`1675e0e3`) — проверить после warm deploy |
| **4** | Warm deploy | `deploy/synology/README.md` | только по слову PO **«деплой»** (без wipe) |

**Канон вечера (PO):** 348 → VPN off → OPS-310 → warm deploy (AUTH-302 уже в git).  
Если Buffy: «tools bound to freebuff» → не продолжать тот чат, открыть новый на каноне.

## Не брать

- Всё из `_archive/` и `_park/` без явной команды PO  
- Параллель на `proposal-create*` пока 348 не закрыт  
- wipe без русского подтверждения (`docs/ops/DANGEROUS-OPS.md`)

Закрытые волны и старые промпты: `tasks/_archive/2026-08/waves-done/`, `…/prompts-spent/`.
