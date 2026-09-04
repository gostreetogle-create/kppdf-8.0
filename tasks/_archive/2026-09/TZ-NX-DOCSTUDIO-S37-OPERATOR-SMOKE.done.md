# TZ-NX-DOCSTUDIO-S37-OPERATOR-SMOKE: приёмка глазом + evidence

**РОЛЬ АГЕНТА:** Executor (read-only smoke + short evidence md)  
**LAYER:** 1  
**PAGES:** document-studio  
**ЗАВИСИМОСТИ:** S36  
**CONFLICT KEYS:** `docs/audits/2026-09-0X-docstudio-finish-smoke.md` (создать); `_NOW.md`; `QUEUE-LIVE.md`

## ЧТО ДЕЛАТЬ

Пройти и записать PASS/FAIL:

1. Новое КП → Данные → витрина 2 изделия → строки на листе.  
2. Клиент + `{{counterparty.name}}` → Просмотр → подстановка.  
3. Сохранить → network ok; F5 имя/строки на месте.  
4. PDF скачивается.  
5. `/proposals` видит КП / «В студии».  
6. Rename + formula one control.

При FAIL — не archive DONE; завести hotfix TZ в `_ready`.

## КРИТЕРИИ ПРИЁМКИ

1. Evidence file со скрин/notes и HEAD SHA.  
2. WAVE FINISH closed в checklist.

## Финализация

Archive → `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S37-OPERATOR-SMOKE.done.md`

## Итоговый AC matrix (сведено из трёх evidence-сессий)

| # | Scenario | Result | Источник |
|---|----------|--------|----------|
| 1 | Новое КП → Данные → витрина 2 изделия → строки | **PASS** | `2026-09-04-docstudio-finish-smoke.md` (первичный смок) + переподтверждено `2026-09-04-docstudio-s37-s41-live-closeout.md` (S41 rapid-add/remove) |
| 2 | Клиент + `{{counterparty.name}}` → Просмотр → подстановка | **PASS** | Изначально FAIL → root cause найден и зафиксирован (`2026-09-04-docstudio-s37-s41-live-closeout.md`) → S37C фикс (`applyTableAggregateTokensToBlocks` `.toObject()`) → живое переподтверждение PASS этой сессией: «АО «Торговая сеть „Формат“»» подставилось в Просмотр. Скрин: `evidence-s37-3/s37-3-03-s37-preview-name-substituted-PASS.png` |
| 3 | Сохранить → network ok; F5 имя/строки на месте | **PASS** | `2026-09-04-docstudio-finish-smoke.md` |
| 4 | PDF скачивается | **PASS** | `2026-09-04-docstudio-finish-smoke.md` (тот же render-пайплайн, что и Preview — S37C фикс применяется и к PDF) |
| 5 | `/proposals` видит КП / «В студии» | **PASS** | `2026-09-04-docstudio-finish-smoke.md` |
| 6 | Rename + formula one control | **PASS** | `2026-09-04-docstudio-finish-smoke.md` |

**Verdict: PASS (6/6).**

## Хронология (для истории)

1. **2026-09-04, первичный смок** (cursor, evidence-only): AC 1,3,4,5,6 PASS; AC2 FAIL —
   picker «Поле ERP» не дал подтверждённой вставки в той сессии.
   `docs/audits/2026-09-04-docstudio-finish-smoke.md`
2. **S37B** (claude): код-трейс всей цепочки «Поле ERP» → Просмотр — дефекта в
   продуктовом коде не найдено (backend hydration уже работал с S8-1); закрыт пробел
   тестового покрытия (frontend click→insert). Live browser click-through в той сессии
   не выполнен (не было browser-инструмента).
   `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S37B-COUNTERPARTY-TOKEN-PREVIEW.done.md`
3. **S41** (claude): витрина Добавить/Убрать + serialized write queue — устранил
   cascade-409, не связан напрямую с AC2, но задействован в одном live-сценарии.
   `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S41-VITRINA-ADD-UX.done.md`
4. **S37 live closeout** (claude, headless Chromium впервые в этой цепочке): frontend-nx
   dev-server оказался на суточной стали (не перезапускался с 2026-09-03) — перезапущен.
   S41 подтверждён живьём PASS. S37 AC2 подтверждён живьём **FAIL** — впервые с точным
   root cause: `applyTableAggregateTokensToBlocks` теряет `layout` при spread сырого
   Mongoose Document. Hotfix TZ выписан.
   `docs/audits/2026-09-04-docstudio-s37-s41-live-closeout.md`
5. **S37C** (claude): фикс `.toObject()` + regression-тест (верифицирован
   fail-on-old/pass-on-new) + живое переподтверждение — AC2 **PASS**.
   `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S37C-PREVIEW-BLOCK-LAYOUT-DROP.done.md`

## Финализация

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-04
closed_by: Claude
verification:
  - acceptance criteria: PASS (6/6, AC2 confirmed live after S37C fix)
  - typecheck: PASS (S37C gates)
  - tests: PASS (S37C gates, 137/137 incl. 2 new regression tests)
  - lint: PASS (S37C gates)
  - checklist: N/A (read-only smoke TZ; downstream fix S37C has its own checklist)
  - progress.md: N/A
  - status synchronization: PASS
