# Очередь

**Шпаргалка PO:** [`docs/PO-AGENT-FLOW.md`](../../docs/PO-AGENT-FLOW.md)

**Обрыв / новый чат исполнителя:** [`tasks/PROMPT-RESUME-ANY.md`](../PROMPT-RESUME-ANY.md)

**Перед деплоем (VPN OFF):** [`ops/PROMPT-OPS-310-HARDEN.md`](./ops/PROMPT-OPS-310-HARDEN.md)

## Живые потоки

| Порядок | Поток | Где | Статус |
|---------|--------|-----|--------|
| **1** | Warm deploy | `deploy/synology/README.md` | gate **OPS-310 green** — ждать слово PO **«деплой»** (без wipe) |
| — | AUTH-302 | уже в main `1675e0e3` | проверить вход после выката |
| — | OPS-310 | archive DONE | evidence `docs/ops/server-harden-evidence.md` |
| — | KP-COMPLETE | 348 DONE `e23a665d` | coding idle |

**Канон сейчас:** ждать **«деплой»**. Wipe запрещён без русского подтверждения.

## Не брать

- Всё из `_archive/` и `_park/` без явной команды PO  
- Параллель на `proposal-create*` пока 348 не закрыт  
- wipe без русского подтверждения (`docs/ops/DANGEROUS-OPS.md`)

Закрытые волны и старые промпты: `tasks/_archive/2026-08/waves-done/`, `…/prompts-spent/`.
