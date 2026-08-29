# TZ-DOC-STUDIO-2005: _NOW.md рассинхронен с tasks/_active/, Claim-слоты не восстановлены

> **Приоритет: НЕЗНАЧИТЕЛЬНО, но блокирует Claim-протокол** · найдено инспекцией плана Document Studio v2 (2026-08-29)
> **[ИСПРАВЛЕНО]** — проверено инспекцией 2026-08-29 (повторная сверка, не commit message)

## Проверка исправления

Пункт 1: `tasks/_active/` пуст, `TZ-DOC-STUDIO-1601/1701/1801/1901` доведены до конца и лежат в `tasks/_archive/2026-08/*.done.md`; `_NOW.md:7` больше не врёт о состоянии очереди.

Пункт 2: `tasks/WAVE-DOC-STUDIO.md:20` — секция «Checklist policy» явно фиксирует исключение: волны 401/501–1101/1201–1501 batch-close одним `.done.md`, per-wave checklist сознательно не восстанавливается, единичные волны (101, 1601–2004) идут с checklist/archive note по факту. Не самомаркировка — реальная запись в процессном документе.

## CONFLICT KEYS

`docs/agent-checklists/_NOW.md`; `tasks/WAVE-DOC-STUDIO.md`; `docs/agent-checklists/` (checklist-файлы для 401 / 501-1101 / 1201-1501)

## ДОКАЗАТЕЛЬСТВО

`docs/agent-checklists/_NOW.md:7` заявляет: «_(очередь пуста — Document Studio Waves 0–15 DONE)_». При этом `tasks/_active/` реально содержит 4 живых файла: `TZ-DOC-STUDIO-1601-erp-live-rows.md`, `1701-multipage.md`, `1801-ops-closeout.md`, `1901-ux-gaps.md`.

`_active/` — источник conflict-ключей для Claim-протокола (`GEMINI.md`). Следующий агент, увидев «пусто» в `_NOW.md`, может начать работу по тем же файлам параллельно с уже идущей.

Отдельно: `docs/agent-checklists/` содержит Claim-заполненный checklist только для `TZ-DOC-STUDIO-101-extract.md` (и `1601`); для волн 401, 501–1101, 1201–1501 checklist-файлов нет, хотя соответствующие `.done.md` в архиве на них ссылаются как на завершённые.

## ЧТО ДЕЛАТЬ

1. Синхронизировать `_NOW.md` со списком `tasks/_active/` — либо отразить реальные 4 живые задачи, либо (если они на самом деле в backlog, не в работе) перенести файлы в `tasks/_backlog/doc-studio/`.
2. По checklist-пробелам (401, 501–1101, 1201–1501): либо восстановить checklist-заглушки с заполненным Claim slot задним числом (для аудита истории), либо явно задокументировать в `GEMINI.md`/`WAVE-DOC-STUDIO.md`, что batch-волны идут без per-wave checklist (осознанное исключение, не недосмотр).

## ACCEPTANCE CRITERIA

- [x] `_NOW.md` соответствует фактическому содержимому `tasks/_active/`
- [x] Решение по checklist-пробелам зафиксировано явно — batch-волны 401/501–1101/1201–1501 без per-wave checklist; исключение в `tasks/WAVE-DOC-STUDIO.md` § Checklist policy
