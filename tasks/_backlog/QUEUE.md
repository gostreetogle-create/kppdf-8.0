# Очередь

**Шпаргалка PO:** [`docs/PO-AGENT-FLOW.md`](../../docs/PO-AGENT-FLOW.md)

**Обрыв / новый чат исполнителя:** [`tasks/PROMPT-RESUME-ANY.md`](../PROMPT-RESUME-ANY.md)

**Перед деплоем (VPN OFF):** [`ops/PROMPT-OPS-310-HARDEN.md`](./ops/PROMPT-OPS-310-HARDEN.md)

## Живые потоки

| Порядок | Поток | Где | Статус |
|---------|--------|-----|--------|
| **1** | Warm deploy | `deploy/synology/README.md` | OPS-310 + AUTH-302 code green — ждать **«деплой»** (без wipe) |
| — | AUTH-302 | archive code DONE | на проде заработает после выката (CSP) |
| — | OPS-310 | archive DONE | gate green |
| — | KP-COMPLETE | 348 DONE | coding idle |

**Канон сейчас:** ждать **«деплой»**. После выката: Basic `kppdf` → `/login` → **admin** (другой пароль из CREDENTIALS). Wipe запрещён без русского подтверждения.

## Не брать

- Всё из `_archive/` и `_park/` без явной команды PO  
- Параллель на `proposal-create*` пока 348 не закрыт  
- wipe без русского подтверждения (`docs/ops/DANGEROUS-OPS.md`)

Закрытые волны и старые промпты: `tasks/_archive/2026-08/waves-done/`, `…/prompts-spent/`.
