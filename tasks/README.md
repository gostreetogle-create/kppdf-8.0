# Tasks — канон порядка

> **Корень = только служебные файлы.** Спеки DONE и spent-промпты — в `_archive/`.

## Папки

| Папка | Назначение |
|-------|------------|
| **`_active/`** | 0–1 claim (сейчас пусто + `.gitkeep`) |
| **`_ready/`** | Готовые к выдаче TZ (ещё не claimed) |
| **`_archive/YYYY-MM/`** | `.done.md` + locks |
| **`_archive/YYYY-MM/sources-spent/`** | исходники TZ после DONE |
| **`_archive/YYYY-MM/prompts-spent/`** | отработанные PROMPT-* |
| **`_archive/YYYY-MM/waves-spent/`** | копии WAVE из корня после closeout |
| **`_backlog/`** | PARK / punch-list — **не** LIVE |
| **`_park/`** | Отложено без PO |

## Корень (служебное) — только это

| Файл | Зачем |
|------|-------|
| `README.md` | этот канон |
| `TZ-INVENTORY-ACTIVE.md` | индекс READY/LIVE |
| `QUEUE-LIVE.md` | живая очередь (если есть) |
| `PROMPT-RESUME-ANY.md` | обрыв сессии |
| `PROMPT-UNIVERSAL-CONTINUOUS.md` | полный executor loop |
| `PROMPT-FREEBUFF-TASKS-DRAIN.md` | drain spent prompts |
| `PROMPT-DEPLOY-READY.md` | **только** по явной русской команде PO на deploy |

**Нет** кучи `TZ-*.md` / `PROMPT-CLAUDE-*` / `PROMPT-FREEBUFF-*` в корне после DONE волны → сразу в `prompts-spent/`.

## Executor closeout (обязательно)

При archive последней TZ волны: **перенести** её `tasks/PROMPT-*.md` в  
`tasks/_archive/YYYY-MM/prompts-spent/` в том же шаге (`GEMINI.md` §Архивация).  
Не оставлять spent-промпт в корне «на потом».

## Сейчас (2026-09-12 hygiene)

- `_active/` пусто; Claude IDLE; промптов в очереди нет.
- Spent prompts: `tasks/_archive/2026-09/prompts-spent/` (вкл. AI-IMPORT / DocStudio / Categories / UX / Hub / Freebuff historical).
- Живые WAVE-чеклисты SoT: `docs/agent-checklists/WAVE-*.md` (пути PROMPT → `prompts-spent/`).
- PARK: Soup SFT, TZD-76, deploy/wipe.
