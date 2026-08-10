# Очередь

**Шпаргалка PO:** [`docs/PO-AGENT-FLOW.md`](../../docs/PO-AGENT-FLOW.md)

**Обрыв / новый чат Buffy — всегда:** [`tasks/PROMPT-RESUME-ANY.md`](../PROMPT-RESUME-ANY.md)

**Перед деплоем (VPN OFF):** [`ops/PROMPT-OPS-310-HARDEN.md`](./ops/PROMPT-OPS-310-HARDEN.md)

## Живые потоки

| Порядок | Поток | Где | Статус |
|---------|--------|-----|--------|
| **1** | KP-COMPLETE хвост | `kp-vitrine/` · **TZ-SALES-348** | добить текущего агента (`PROMPT-RESUME-ANY`) |
| **2** | Server harden | `ops/TZ-OPS-310` · `PROMPT-OPS-310-HARDEN.md` | после **VPN OFF** (параллельный агент / новый чат) |
| **3** | CSP / вход P0 | `ops/TZ-AUTH-302` · `PROMPT-AUTH-302-CSP.md` | в том же деплой-пакете после 348+310 |
| **4** | Warm deploy | `deploy/synology/README.md` | только по слову PO **«деплой»** (без wipe) |

**Канон вечера (PO):** сначала 348 → VPN off → OPS-310 → AUTH-302 → один warm deploy со всеми сегодняшними фиксами.  
Вход на проде подождёт — сайт ещё не в ежедневной работе.

## Не брать

- Всё из `_archive/` и `_park/` без явной команды PO  
- Параллель на `proposal-create*` пока 348 не закрыт  
- wipe без русского подтверждения (`docs/ops/DANGEROUS-OPS.md`)

Закрытые волны и старые промпты: `tasks/_archive/2026-08/waves-done/`, `…/prompts-spent/`.
