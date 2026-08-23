# Tasks — канон порядка

> **Корень = только служебные файлы.** Вся работа — в подпапках.

## Папки

| Папка | Назначение |
|-------|------------|
| **`_active/`** | 0–1 claim (сейчас пусто) |
| **`_archive/`** | DONE, specs-dup-root, prompts-spent |
| **`_backlog/`** | Незакрытые TZ (см. `QUEUE.md`) |
| **`_park/`** | Отложено; **не трогать** без PO |

## Файлы в корне (зачем не «только папки»)

| Файл | Зачем |
|------|-------|
| **`README.md`** | этот указатель |
| **`QUEUE-LIVE.md`** | живая очередь (PO + агенты) |
| **`PROMPT-RESUME-ANY.md`** | обрыв сессии |
| **`PROMPT-FOLLOW-QUEUE.md`** | один промпт на executor |
| **`PROMPT-UNIVERSAL-CONTINUOUS.md`** | полный контракт executor |
| **`PROMPT-DEPLOY-READY.md`** | Cursor «подготовь к деплою» |

**Нет** `TZ-*.md` и spent PROMPT в корне — только в `_archive/`.

Spent drain: `_archive/2026-08/prompts-spent/PROMPT-FREEBUFF-TASKS-DRAIN.md`

## Сейчас (2026-08-23)

WR + ROI + TEST-421 — **DONE**. Следующее: **«подготовь к деплою»**.
