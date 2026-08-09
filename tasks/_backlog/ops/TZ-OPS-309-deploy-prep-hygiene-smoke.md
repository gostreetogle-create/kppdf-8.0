═══════════════════════════════════════════════════════════════
TZ-OPS-309: Подготовка к деплою — гигиена WIP + smoke (без deploy.ps1)
═══════════════════════════════════════════════════════════════

PAGES: /login ; /proposals ; /proposals/create ; /admin/roles
PAGE_DOCS: N/A (ops hygiene; page.md только если чинишь баг)

РОЛЬ АГЕНТА: fullstack ops (docs + smoke; код только hotfix блокера деплоя)
ЗАВИСИМОСТИ: WAVE-KP-USABLE DONE (`7a3173d5`); TZ-ADMIN-303 DONE (`e73a7a74`)
LAYER: 1
CONFLICT KEYS:
- tasks/_archive/2026-08/TZ-DOC-343.done.md
- tasks/_backlog/TZ-DOC-344-builder-single-default-background.md
- docs/agent-checklists/_active-map.md
- tasks/_backlog/QUEUE.md
- progress.md
(+ только файлы реального hotfix, если smoke найдёт блокер; тогда допиши keys в checklist)

Проверено: PO 2026-08-09 — волна KP-USABLE закрыта; COMPLETE не стартовать;
деплой позже отдельной командой; в working tree висят только DOC-343 archive + DOC-344 backlog.

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. `tasks/_active/` пуст; WAVE-KP-USABLE = DONE на `origin/main`.
2. Untracked (не чужой код продукта):
   - `tasks/_archive/2026-08/TZ-DOC-343.done.md` (closeout без push)
   - `tasks/_backlog/TZ-DOC-344-builder-single-default-background.md` (parked TZ)
3. Порт `:3000` часто уже занят живым Nest — второй старт = EADDRINUSE (не баг 349).
4. WAVE-KP-COMPLETE / 340–348 — **не** эта сессия.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

1. `cd D:\kppdf-8.0` · `git pull --ff-only` · CLAIM `tasks/_active/TZ-OPS-309.md` + checklist.
2. **Гигиена git (только эти файлы):**
   - Закоммить+push `TZ-DOC-343.done.md` как docs closeout (если archive валиден).
   - Закоммить+push `TZ-DOC-344-…md` как **parked backlog** (не реализовывать 344).
3. **Стек:** один backend на `:3000` (не поднимай второй). FE `:4200`. Health `GET /api/health` = ok.
4. **Smoke браузер (логин admin):**
   - Все КП → открыть одну / Создать КП (студия открывается, RU UI).
   - Автосейв или Save не ломает страницу.
   - Админ → Роли: у системной есть «Редактировать», нет Delete.
5. **Gates лёгкие:** FE+BE `tsc --noEmit` PASS. Полный jest matrix не обязателен, если нет hotfix.
6. Если найден **блокер показа** (белый экран, 500 на /api/health, логин ломается) — тонкий hotfix в этой же TZ, gates зоны, отдельный commit.
7. Checkpoint `_active-map`: **READY TO PROPOSE DEPLOY** · NEXT idle · Deploy NO.
8. Archive TZ-OPS-309 · lock · remove `_active` · commit+push · отчёт PO.
9. **СТОП.** `deploy.ps1` / WAVE-KP-COMPLETE / новые фичи КП — запрещены.

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- WAVE-KP-COMPLETE / TZ-SALES-340…348
- WAVE-KP-TABLE-CONFIG / новые table-fit фичи
- deploy.ps1 / wipe / secrets
- Чужой freebuff worktree
- Реализация DOC-344 (только park в git)

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Working tree чист от DOC-343/344 untracked (оба в git на origin/main).
2. `/api/health` ok; smoke login + КП + роли без блокера.
3. FE+BE tsc PASS.
4. Checkpoint: готово предложить деплой; Deploy не запускался.
5. Archive + push; `_active/` пуст.

PARALLEL-SAFE: да (docs + smoke; hotfix только на найденный блокер).
Workspace: только `D:\kppdf-8.0`.
