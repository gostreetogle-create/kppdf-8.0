---
name: kppdf-executor-continuous
description: >-
  Continuous executor for kppdf-8.0: claim → code → gates → archive →
  commit/push → next TZ. No fake «поехали» stops. Empty queue = propose
  deploy readiness, do NOT auto-run deploy.ps1. Use for Buffy/Gemini/local.
---

# kppdf continuous executor

Корень: **`D:\kppdf-8.0`**. Читай `GEMINI.md`, этот skill, `docs/PO-DIARY.md` §1–§4,
`docs/agent-checklists/_active-map.md`. Дубликат политики:
`.agents/skills/kppdf-executor-loop/SKILL.md` (тот же смысл).

## Канон PO (исправлено 2026-08-05 вечер)

1. **Mid-queue не останавливайся** ждать «поехали» / «ок» / «продолжай». Это не gate.
2. Цикл: CLAIM → код → gates → archive+lock → **commit+push** → следующий READY TZ.
3. **Commit+push обязателен** на каждой закрытой TZ (и желателен mid-TZ на крупном куске).
   Без push TZ для следующего агента = не DONE. Лучше много маленьких зелёных коммитов, чем один в конце дня.
4. **Очередь пуста ≠ деплой.** Сделай checkpoint + короткий отчёт
   «готово предложить деплой» и **остановись**.
5. `deploy.ps1` запускай **только** при явном «задеплой» / «деплой» / «кати на сервер» /
   «warm deploy» / «выкати». Без wipe, если PO отдельно не сказал wipe.

Универсальный handoff-промпт: `tasks/PROMPT-UNIVERSAL-CONTINUOUS.md`.

## Цикл работы

1. Прочитай `_active-map.md` и `tasks/_active/`.
2. Возьми **следующий READY** по map/очереди PO.
3. CLAIM: `tasks/_active/<ID>.md` + checklist claim slot **до** кода.
4. Gates в зоне → archive → lock → **commit+push** `main`.
5. Checkpoint в `_active-map.md` (один актуальный блок).
6. Сразу следующий TZ. Не спрашивай «можно дальше?».

Стоп только на: реальном выборе PO, wipe/secrets, или неснимаемом блокере.

## Когда READY-очереди нет

1. Сверь: всё из текущей волны в `tasks/_archive/2026-08/*.done.md`, `_active/` пуст.
2. **Не** выдумывай новые TZ из parked backlog (`_backlog/`, 304 склад) без PO.
3. Checkpoint: DONE wave / NEXT: idle или ждать новую очередь / деплой-команду.
4. Отчёт PO одной короткой карточкой. **Idle.**

## Checkpoint (~5–7 мин или после TZ)

В `docs/agent-checklists/_active-map.md` обновляй **один** нижний блок:

```markdown
## Checkpoint <ISO>
- DONE: …
- IN PROGRESS: …
- NOT DONE: …
- NEXT: …
- HEAD: …
- Blockers: none | …
- _active/: …
```

## Запреты

- Не ждать «поехали».
- Не автодеплой из-за пустой очереди.
- Не TZ-UI-TABLE-304 без явного PO.
- Не коммить `__pycache__/`, `tasks/Данные/`.
- Не wipe без отдельного явного PO.
