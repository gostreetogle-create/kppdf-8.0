---
name: kppdf-executor-loop
description: >-
  Continuous executor loop for kppdf-8.0: claim → code → gates → archive →
  commit/push → next TZ. No fake stop-words. Deploy only on explicit PO deploy
  command. Use when running as Gemini/Buffy/local executor on this repo.
---

# kppdf executor loop (Buffy / Gemini)

Continuous: **`D:\kppdf-8.0`/main**. Explicit Cursor Isolated:
`.worktrees/<TASK-ID>`/task branch. `.freebuff/worktrees` запрещён.

Прочитай: `GEMINI.md`, `docs/PO-CANON.md`, `_NOW.md`, свой TZ/checklist.

## Главное правило PO (2026-08-05)

**Не останавливайся** mid-queue, чтобы PO написал «поехали», «ок», «продолжай».
Это **не** выбор и **не** gate.

Цикл сам:

1. checklist → CLAIM (`tasks/_active/` + claim slot)  
2. если TZ меняет поведение — failing test (skill `tdd`), потом минимальный код  
3. gates (tsc/tests по зоне)  
4. archive + lock  
5. **commit + push** на целевую ветку по `docs/GIT-POLICY.md`
6. следующий TZ из `_NOW.md` / очереди
7. пока очередь не пуста — **не спрашивай разрешения**

Стоп **только** на реальном выборе PO (архитектура, wipe, prod secrets, «делать ли 304», конфликт данных).  
Wipe/удаление данных: вопрос PO **по-русски** + бэкап — `docs/ops/DANGEROUS-OPS.md`. «деплой» ≠ wipe.

## Когда очередь пуста

Это **не** сигнал «сам деплой».

Сделай:

1. Обнови существующие секции `docs/agent-checklists/_NOW.md`: DONE / NEXT / HEAD.
2. Короткий отчёт PO: «очередь пуста, архивы чистые, HEAD …, **готово предложить деплой**».  
3. **Остановись.** Жди новую TZ-очередь **или** явную команду деплоя.

### Деплой — отдельная команда

Запускай `.\deploy\synology\deploy.ps1` (**без** `-Wipe`) **только** если PO явно сказал одно из:

- «задеплой» / «деплой» / «кати на сервер» / «warm deploy» / «выкати»

**Не** считай деплоем:

- «поехали» (устаревший ритуал — игнор как gate)  
- «очередь пуста»  
- «можно деплоить» без глагола сделать  
- «проверь готовность»  
- злость PO на процесс / «не останавливайся»

Если PO дал явную команду деплоя:

1. warm deploy, no wipe  
2. smoke health + FE  
3. отчёт PASS/FAIL + URL  
4. если SSH/`192.168.1.103` недоступен — **один** факт в checkpoint (SSH FAIL), **не** крути цикл «скажи поехали»; можно ретраить когда сеть жива или спросить «VM сейчас в LAN?»

## Live state (обязательно)

После изменения статуса или закрытия TZ обнови `_NOW.md` **in-place**.
Не добавляй checkpoint в `_active-map.md`: это история.

Сессия может оборваться — правда в файле, не в чате.

## Запреты

- Не коммить `deploy/synology/__pycache__/`, `tasks/Данные/`  
- Не `-Wipe` без отдельного явного PO  
- Не ждать магических слов mid-queue  
- Не автодеплоить потому что «очередь пуста»

## Старт сессии

1. `git status` / `git log -1` / прочитай `_NOW.md`
2. Сверь `tasks/_active/` и conflict keys
3. Если в `_active/` или `_NOW` есть READY TZ — бери следующий
4. Если очередь пуста и PO **не** просил деплой — отчёт «готово предложить деплой» и idle
