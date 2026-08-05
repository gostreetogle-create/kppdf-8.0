---
name: kppdf-executor-loop
description: >-
  Continuous executor loop for kppdf-8.0: claim → code → gates → archive →
  commit/push → next TZ. No fake stop-words. Deploy only on explicit PO deploy
  command. Use when running as Gemini/Buffy/local executor on this repo.
---

# kppdf executor loop (Buffy / Gemini)

Корень работы: **`D:\kppdf-8.0`** (не freebuff worktree). Если путь недоступен — стоп и скажи PO.

Прочитай также: `GEMINI.md`, `docs/PO-DIARY.md` §1–§4, этот skill.

## Главное правило PO (2026-08-05)

**Не останавливайся** mid-queue, чтобы PO написал «поехали», «ок», «продолжай».
Это **не** выбор и **не** gate.

Цикл сам:

1. checklist → CLAIM (`tasks/_active/` + claim slot)  
2. код  
3. gates (tsc/tests по зоне)  
4. archive + lock  
5. **commit + push** на `main`  
6. следующий TZ из очереди / `_active-map.md`  
7. пока очередь не пуста — **не спрашивай разрешения**

Стоп **только** на реальном выборе PO (архитектура, wipe, prod secrets, «делать ли 304», конфликт данных).

## Когда очередь пуста

Это **не** сигнал «сам деплой».

Сделай:

1. Checkpoint в `docs/agent-checklists/_active-map.md`: DONE / NOT DONE / NEXT / HEAD.  
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

## Checkpoint (обязательно)

Каждые ~5–7 минут **или** после каждого закрытого TZ — обнови **один** нижний блок в `_active-map.md` (не плоди копии без смены статуса):

```text
## Checkpoint <ISO>
- DONE: …
- IN PROGRESS: …
- NOT DONE: …
- NEXT: …
- HEAD: …
- _active/: …
- Blockers: none | …
```

Сессия может оборваться — правда в файле, не в чате.

## Запреты

- Не коммить `deploy/synology/__pycache__/`, `tasks/Данные/`  
- Не `-Wipe` без отдельного явного PO  
- Не начинать **TZ-UI-TABLE-304** без явного PO (склад)  
- Не ждать магических слов mid-queue  
- Не автодеплоить потому что «очередь пуста»

## Старт сессии

1. `git status` / `git log -1` / прочитай `_active-map.md`  
2. Запиши Checkpoint №1  
3. Если в `_active/` или в map есть READY TZ — бери следующий  
4. Если очередь пуста и PO **не** просил деплой — отчёт «готово предложить деплой» и idle
