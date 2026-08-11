# Очередь

**Шпаргалка PO:** [`docs/PO-AGENT-FLOW.md`](../../docs/PO-AGENT-FLOW.md)

**Обрыв / новый чат исполнителя:** [`tasks/PROMPT-RESUME-ANY.md`](../PROMPT-RESUME-ANY.md)

**Перед деплоем (VPN OFF):** [`ops/PROMPT-OPS-310-HARDEN.md`](./ops/PROMPT-OPS-310-HARDEN.md)

## Живые потоки

| Порядок | Поток | Где | Статус |
|---------|--------|-----|--------|
| 1 | Desktop Basic Auth coexist | `desktop/TZD-39-desktop-basic-auth-coexist.md` | **CODE in tree** — нужен warm deploy + Desktop rebuild/publish |
| 2 | Desktop version gate | `desktop/TZD-40-desktop-version-gate.md` | READY TZ (после 39 на проде) |
| — | Perf photos | `perf/WAVE-PERF-PHOTOS.md` | DONE (specs в backlog — история) |

**Канон сейчас:** код TZD-39 (pairing revoke/UI + X-Access-Token/Basic) уже в worktree;
на проде не видно без **«деплой»** + новый Desktop installer. TZD-40 — предупреждение «обновите приложение».
Wipe запрещён без русского подтверждения (`docs/ops/DANGEROUS-OPS.md`).

## Не брать

- Всё из `_archive/` и `_park/` без явной команды PO  
- Параллель на `proposal-create*` пока 348 не закрыт  
- wipe без русского подтверждения (`docs/ops/DANGEROUS-OPS.md`)

Закрытые волны и старые промпты: `tasks/_archive/2026-08/waves-done/`, `…/prompts-spent/`.
