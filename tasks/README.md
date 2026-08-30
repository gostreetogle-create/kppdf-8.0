# Tasks — канон порядка

> **Корень = только служебные файлы.** Вся работа — в подпапках.

## Папки

| Папка | Назначение |
|-------|------------|
| **`_active/`** | 0–1 claim (сейчас: пусто) |
| **`_archive/`** | DONE, specs-dup-root, prompts-spent |
| **`_backlog/`** | Незакрытые TZ (см. `QUEUE.md`) |
| **`_park/`** | Отложено; **не трогать** без PO |
| **`_prompts/`** | Живые переиспользуемые промпты (не разовые, не spent) — напр. `PROMPT-CURSOR-TZ-ORDERING.md` |

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
Отработанные спеки, чей архив `.done.md` уже существует, — в
[`_archive/2026-08/specs-dup-root/`](./_archive/2026-08/specs-dup-root/).

Spent drain: `_archive/2026-08/prompts-spent/PROMPT-FREEBUFF-TASKS-DRAIN.md`

## Сейчас (2026-08-30)

**Модуль №1 переноса на NX — студия документов** (решение PO). Карта модуля:
[`docs/architecture/nx-doc-studio.md`](../docs/architecture/nx-doc-studio.md) — SoT
(Cursor), порядок срезов S0–S8 и дельта backend D1–D4 там.

Активных волн нет: `_active/` пуст, S0/S2/S3 (text blocks + shell wire) и
`TZ-NX-REGISTRY-CRUD-UNIFY` closeout — все закрыты и в `_archive/2026-08/`
(специфика в `QUEUE-LIVE.md`). Следующий срез — по явному указанию PO
(PO-CANON п.7): агент сам не предлагает.

Backlog по темам: [`_backlog/nx/`](./_backlog/nx/) · [`_backlog/doc-studio/`](./_backlog/doc-studio/) ·
[`_backlog/ux-hygiene/`](./_backlog/ux-hygiene/) · [`_backlog/ops/`](./_backlog/ops/) ·
[`_backlog/ui-density/`](./_backlog/ui-density/) (программа волны: `WAVE-UI-DENSITY-PAPER-INK.md`).
