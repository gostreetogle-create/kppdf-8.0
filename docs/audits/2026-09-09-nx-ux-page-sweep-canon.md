# NX UX PAGE SWEEP — канон эталона (реестр + UI Kit)

> Программа: одна **живая NX-страница** = одна волна = один промпт.  
> PO выдаёт промпты **по одному** («дай следующий промпт»).  
> Мастер: `docs/agent-checklists/WAVE-NX-UX-PAGE-SWEEP.md`

updated_at: 2026-09-09

## Эталон (не изобретать второй)

1. **Реестры** `/registries` — expand-in-row: клик по строке → раскрытие с полями **этой** записи; toolbar filters = label + control; действия = `pi-button` / `registry-row-action-button`, не «синяя подчёркнутая надпись».
2. **UI Kit** `/kit/*` — визуальный SoT примитивов (кнопки, поля, overlays). Сначала kit, потом продуктовые страницы.
3. **Каноны:** `docs/UX-FORM-CANON.md`, `docs/paper-and-ink.md` (panel inset), `docs/DIALOG-COOKBOOK.md`, `docs/ui-density-canon.md`.

## Чеклист запаха (каждый AUDIT обязан пройти)

| # | Зона | FAIL если |
|---|------|-----------|
| T1 | Таблица | Нет expand / клик ничего не даёт / детали только на другой странице без причины |
| T2 | Таблица | Колонки пустые/сдвинутые; нет loading/empty/error |
| A1 | Действия | Primary/secondary — `<a class="underline">` **или** мёртвый `class="pi-button pi-button-*"` (нет CSS; SoT = `<app-pi-button>`) |
| A2 | Действия | Destructive без confirm |
| F1 | Фильтры | Поле без `pi-label` / непонятный native select |
| F2 | Фильтры | Нет сброса чипа deep-link |
| D1 | Dropdown | Списки не Pi/канон; ObjectId руками |
| L1 | Layout | Контент липнет к рамке (< `--space-3`) |
| L2 | Layout | Прыгающие ошибки валидации (UX-FORM) |
| C1 | Copy | EN в UI; мёртвые кнопки; stub «скоро» без честного empty |

## Не трогать в этих волнах

- **`/production` Гант** — PO 2026-09-09: уже ок, **SKIP** всей волны #11
- Геометрия A4 DocStudio editor (в #15 только list/templates)
- BE schema / money write-path
- `/desk` (нет NX route)
- Wipe / deploy
- Parallel второй агент на тот же `kppdf-web` page folder

## Порядок волн

См. `WAVE-NX-UX-PAGE-SWEEP.md`. Kit → registries → ERP; **пропуск Ганта**.
