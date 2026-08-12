# Очередь

**Шпаргалка PO:** [`docs/PO-AGENT-FLOW.md`](../../docs/PO-AGENT-FLOW.md)

**Обрыв / новый чат исполнителя:** [`tasks/PROMPT-RESUME-ANY.md`](../PROMPT-RESUME-ANY.md)  
**Или эта волна целиком:** [`kp-vitrine/PROMPT-KP-SHAME-CONTINUOUS.md`](./kp-vitrine/PROMPT-KP-SHAME-CONTINUOUS.md)

## Живые потоки

| Порядок | Поток | Где | Статус |
|---------|--------|-----|--------|
| **1** | KP Table Editor → prod | `kp-vitrine/WAVE-KP-TABLE-EDITOR-FINISH.md` · **A→E** | READY — unattended: `PROMPT-KP-TABLE-EDITOR-UNATTENDED.md` |
| — | KP Table Editor (359→361) | `WAVE-KP-TABLE-EDITOR.md` | код в worktree; land = ступень A finish-волны |
| — | KP Studio Chrome | `WAVE-KP-STUDIO-CHROME.md` | 363 DONE; 362 на main с Table Studio |
| — | KP shame polish | `WAVE-KP-SHAME-POLISH.md` · 350→354 | DONE (история) |
| — | KP-COMPLETE | 340…348 | DONE (на проде) |
| — | OPS-310 / AUTH | archive | DONE (на проде) |

**Канон сейчас:** дожать единый «Редактор таблицы» на main + chrome + DnD + warm deploy.  
Wipe запрещён без русского подтверждения (`docs/ops/DANGEROUS-OPS.md`).  
Unattended-промпт **авторизует** только warm deploy без wipe.

## Не брать

- `_archive/` / `_park/` без явной команды PO  
- Параллель на `proposal-create*` / `proposals.page*` внутри 350–354  
- wipe / auto-deploy

Закрытые волны: `tasks/_archive/2026-08/waves-done/`, `…/prompts-spent/`.
