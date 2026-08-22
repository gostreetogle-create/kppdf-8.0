# TZ-OPS-320: Убрать spent TZ/PROMPT из корня tasks/

РОЛЬ АГЕНТА: Docs hygiene
ЗАВИСИМОСТИ: Нет
LAYER: 4
CONFLICT KEYS: tasks/TZ-CORE-302-soft-delete-coverage-gap.md; tasks/TZ-OPS-317-git-line-endings-normalize.md; tasks/TZ-OPS-318-automated-backup-rotation.md; tasks/TZ-OPS-319-local-pre-push-gate.md; tasks/PROMPT-FREEBUFF-MASTER-QUEUE.md; tasks/PROMPT-FREEBUFF-DESKTOP-WAVE1.md; tasks/PROMPT-FREEBUFF-UI-FIXES-WAVE1.md; tasks/PROMPT-FREEBUFF-AUDIT-FOLLOWUP.md; tasks/PROMPT-FREEBUFF-PO-BACKLOG-WAVE1.md; tasks/PROMPT-FREEBUFF-KP-PAGE-MODE-CONTINUOUS.md; tasks/PROMPT-FREEBUFF-OPS-318-319-PARALLEL.md

Проверено: `_NOW.md` — CORE-302 / OPS-317/318/319 DONE; архивы уже есть в `tasks/_archive/2026-08/`.

## ИСХОДНОЕ

В корне `tasks/` лежат копии уже закрытых TZ и spent PROMPT. Исполнитель может взять их повторно.

## ЧТО ДЕЛАТЬ

ШАГ 1: `git mv` четыре stale TZ → `tasks/_archive/2026-08/specs-dup-root/` (если папки нет — создай). Не удалять без копии в archive.

ШАГ 2: `git mv` spent PROMPT из CONFLICT KEYS → `tasks/_archive/2026-08/prompts-spent/`.

ШАГ 3: Строка в `_NOW.md`: OPS-320 DONE + список перенесённых файлов. Не трогать `PROMPT-FREEBUFF-WAVE-2026-08-22.md` и `PROMPT-RESUME-ANY.md`.

## ИЗМЕНЯТЬ

Только перенос файлов из списка + `_NOW.md`.

## НЕ ИЗМЕНЯТЬ

- Product-код, `.github/`, deploy
- `tasks/PROMPT-FREEBUFF-WAVE-2026-08-22.md` (живая волна)
- `tasks/PROMPT-FREEBUFF-TASKS-DRAIN.md`, `PROMPT-RESUME-ANY.md`, `README.md`
- Чужой WIP

## КРИТЕРИИ ПРИЁМКИ

- Корня `tasks/` нет файлов `TZ-CORE-302*`, `TZ-OPS-317*`, `TZ-OPS-318*`, `TZ-OPS-319*`
- Spent PROMPT из шага 2 нет в корне
- `git ls-files` показывает их в archive-папках
- Deploy НЕТ

known_limitation: `_backlog/` копии DONE (PARTY-305 и т.п.) — не в этой TZ.
