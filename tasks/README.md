# Tasks — канон порядка

> **Корень = только служебные файлы.** Спеки DONE и spent-промпты — в `_archive/`.

## Папки

| Папка | Назначение |
|-------|------------|
| **`_active/`** | 0–1 claim |
| **`_ready/`** | Готовые к выдаче TZ (ещё не claimed) |
| **`_archive/YYYY-MM/`** | `.done.md` + locks |
| **`_archive/YYYY-MM/sources-spent/`** | исходники TZ после DONE |
| **`_archive/YYYY-MM/prompts-spent/`** | отработанные PROMPT-* |
| **`_archive/YYYY-MM/waves-spent/`** | копии WAVE из корня после closeout |
| **`_backlog/`** | PARK / punch-list — **не** LIVE |
| **`_park/`** | Отложено без PO |

## Корень (служебное)

| Файл | Зачем |
|------|-------|
| `QUEUE-LIVE.md` | живая очередь |
| `TZ-INVENTORY-ACTIVE.md` | индекс READY/LIVE |
| `PROMPT-NEXT.md` | следующий executor-старт |
| `PROMPT-FOLLOW-QUEUE.md` | указатель |
| `PROMPT-RESUME-ANY.md` | обрыв |
| `PROMPT-UNIVERSAL-CONTINUOUS.md` | полный loop |
| `PROMPT-DEPLOY-READY.md` | только по русской команде PO |

**Нет** кучи `TZ-*.md` / `PROMPT-FREEBUFF-*` в корне.

## Сейчас (2026-09-03 cleanup)

Слоты free. READY: `_ready/TZ-FRONTEND-QA-LINT-UI-TOKENS-SLICE-3.md` → `PROMPT-NEXT.md`.  
Живые WAVE-чеклисты SoT: `docs/agent-checklists/WAVE-*.md`.
