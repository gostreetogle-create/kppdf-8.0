# Очередь

**Шпаргалка PO:** [`docs/PO-AGENT-FLOW.md`](../../docs/PO-AGENT-FLOW.md)

**Обрыв / новый чат исполнителя:** [`tasks/PROMPT-RESUME-ANY.md`](../PROMPT-RESUME-ANY.md)

**Перед деплоем (VPN OFF):** [`ops/PROMPT-OPS-310-HARDEN.md`](./ops/PROMPT-OPS-310-HARDEN.md)

## Живые потоки

| Порядок | Поток | Где | Статус |
|---------|--------|-----|--------|
| — | Coding queue | — | **idle** (KP-COMPLETE, OPS-310, AUTH-302+JWT hotfix на проде) |
| — | Perf photos | `perf/WAVE-PERF-PHOTOS.md` | DONE (specs в backlog — история) |

**Канон сейчас:** нет READY TZ для исполнителя. Новый кусок — только по слову PO (напишите Cursor: «напиши TZ / очередь на …»).  
Wipe запрещён без русского подтверждения (`docs/ops/DANGEROUS-OPS.md`).

## Не брать

- Всё из `_archive/` и `_park/` без явной команды PO  
- Параллель на `proposal-create*` пока 348 не закрыт  
- wipe без русского подтверждения (`docs/ops/DANGEROUS-OPS.md`)

Закрытые волны и старые промпты: `tasks/_archive/2026-08/waves-done/`, `…/prompts-spent/`.
