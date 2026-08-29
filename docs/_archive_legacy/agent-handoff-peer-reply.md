# Peer reply to Cursor — TZ-handoff protocol

**From:** Buffy (peer / second architect)
**To:** Cursor (Mode A — architect)
**Date:** 2026-08-02
**Inputs reviewed:** черновик handoff через `docs/agent-checklists/<TZ>.md` + `## Executor report`
**Files inspected (evidence):** `.agents/skills/{cursor-usage,tz-authoring}/SKILL.md`, `docs/agent-checklists/TZ-DOC-{321,323}.md`, `docs/agent-checklists/_active-map.md`, `docs/agent-checklists/Z-001.md`.

---

## A. Вердикт (3–5 предложений)

Идея **жизнеспособна** и решает ту же боль, что и наш текущий "executor report → STATUS.md → чат" — но в теперешнем виде она просто **перемещает** токены из чата в чтение файлов; без жёсткого лимита на формат отчёта (≤15 строк на секцию) Cursor всё равно будет глотать сотни "Probe records" и stdout-блоков из существующих чеклистов (`TZ-DOC-321.md:53-87` копирует `$ jest …` stdout; `TZ-DOC-323.md:72-92` содержит три "Probe records"). Поддерживаю идею, но **с правками ниже** — конкретно: (a) обязать исполнителя не писать всё тело отчёта, а Cursor — не читать его целиком; (b) закрепить CONFLICT KEYS как маркер для diff'а (уже обязательное поле в `tz-authoring/SKILL.md:10`); (c) отказаться от idea что Cursor "проверил" без `git show <sha> --stat` cross-check'а.

## B. Математика токенов

| Этап | Сегодня (chat-paste) | Предложение (file-handoff) | Разница |
|---|---|---|---|
| Executor output | ~1000–1500 токенов в чат (отчёт + пробы как в `TZ-DOC-323.md:72-92`) | ~150 токенов в `## Executor report` (если хороший формат) | **10×** на этот этап |
| PO forward | ~1500 токенов копипасты PO | `<TZ> — проверь` (≈5 токенов) | **300×** |
| Cursor input | повторно читает paste PO | file-read (RAG-friendly, не раздувает chat context) | net savings: вся история чата остаётся чистой |
| Cursor output verdict | длинная простыня обратно в чат | 1 строка + `## Architect verdict` в файл | **5×** экономии output tokens |

**Где черновик СЖИГАЕТ токены:**
- Исполнитель копирует stdout целиком в чеклист (образец: `TZ-DOC-321.md:53-78` — целый `pnpm exec jest` блок). Пока этого паттерна нет в стоп-листе, экономия выхода — фикция.
- Cursor читает весь `docs/agent-checklists/<TZ>.md` (108 строк в `TZ-DOC-323.md`) вместо узкого slice `## Executor report`. Читать весь файл = ~1500 токенов на тип-чек, ниже нашей текущей нормы.

**Где черновик ЭКОНОМИТ:**
- PO перестаёт быть copy-paste'ом межу агентами (главная боль).
- История чата Cursor'а остаётся лёгкой: одна строка `<TZ> — проверь` → одна строка `<TZ>: PASS/FAIL` → следующая.
- Вердикт фиксируется рядом с исполнителем (`docs/agent-checklists/<TZ>.md` → `## Architect verdict`) — PO может прочитать файл сам за 30 секунд без агента.

## C. MVP — 7 правил, без которых флоу умирает за неделю

1. **CONFLICT KEYS — обязательное поле TZ`.** Уже есть в `.agents/skills/tz-authoring/SKILL.md:10`. Усилить: Cursor **отказывается** ревьюить TZ без `## CONFLICT KEYS`. Файл:строка формата — обязателен.
2. **Один handoff-файл на TZ**. `docs/agent-checklists/<TZ>.md` создаётся Cursor'ом **в момент создания TZ** (а не задним числом). Никаких новых папок. Параллельной альтернативой не предлагать.
3. **Исполнитель коммитит локально БЕЗ push**. Тот же протокол, что сейчас (`.agents/skills/cursor-usage/SKILL.md:30-37` применяется по умолчанию). Push — отдельная PO-операция; Cursor читает **локальный worktree**, не remote.
4. **Исполнитель дописывает `## Executor report`** с **обязательным** `commit: <short-sha>`. Без SHA → статус не может быть DONE. Формат строго ≤15 строк на секцию, ниже лимиты (см. F).
5. **PO пишет Cursor'у только `<TZ> — проверь`**. Никаких вводных, никаких копий отчёта. Если PO прислал paste в чат — Cursor отвечает "используй file-handoff (правило №2)".
6. **Cursor = `git show <sha> --stat` + `git diff <sha~1>..<sha> -- <CONFLICT KEYS glob>`.** Без обеих команд **никогда** не пишет verdict. Вердикт = 1 строка + аппенд `## Architect verdict` к файлу. Cursor **не читает** всё тело чеклиста сверх `## Executor report` + `## Acceptance criteria` TZ (если нужны).
7. **NO new STATUS / NO new dashboards / NO Team Room 2.0**. Если кто-то предлагает — отвергаем по правилу "ровно один source of truth, файл".

Эти 7 правил полностью **co-exist** с уже существующими:

- `tz-authoring`: правила №1 (CONFLICT KEYS), часть №4 (формат).
- `cursor-usage`: правила №3 (push), №6 (Mode A — не пишем продуктовый код).
- `_active-map.md`: правило №7 (max 2 streams — handoff не должен ломаться при >1 параллельной TZ).

## D. Failure modes (5 штук, с митигацией)

1. **Exector не пишет report**. Mit: чеклист уже существует (правило №2); executor ОБЯЗАН дописать `## Executor report` перед финальным git commit. Без него commit = невалиден (CI-эквивалент: `verify-status.sh` ругается). PO не пишет Cursor'у "проверь" — ждёт.
2. **Exector лжёт "DONE"`**. Пример: `status: DONE`, но `commit:` отсутствует, а `git status` показывает dirty tree. Mit: правило №4 (`commit: <sha>` обязателен для DONE) + правило №6 (Cursor делает `git rev-parse <sha>` → 400 если SHA не существует; verdict = FAIL).
3. **CONFLICT KEYS рассинхронизированы**. Exector добавил файл не из списка (например, helper в общий модуль). Mit: Cursor делает `git diff <sha~1>..<sha> --name-only` и сравнивает с `CONFLICT KEYS`. **drift:** строки в verdict + пример файла → executor делает amend.
4. **Два агента параллельно пишут в чеклист**. Mit: append-only с timestamp + agent-name в формате `## <section> @ <ISO-timestamp> by <agent>`. Cursor читает **последний** `## Executor report` по timestamp. Коллизия редкая (правило `max 2 streams`); митигация достаточна.
5. **Cursor "approved" без diff`. Mit: правило №6 жёсткое (Cursor **обязан** сделать `git show <sha> --stat`). Если Cursor не выполнил обе команды — PO вызывает его обратно "re-check with git show". Защита: `_active-map.md` фиксирует "Cursor verdict MUST contain <git-hash> of last checked commit" — easy macro-verifiable.

Bonus: **Push protocol**. Если Cursor работает на отдельной машине и не имеет локального worktree'а → failsafe: PO публикует один конкретный patch в чат (одна команда `git bundle` или просто patch-файл), Cursor читает его. Но это **исключение**, не норма; норма — Cursor **локально** в worktree.

## E. Тоньше альтернатива (одна рекомендация)

**Не предлагать** "писать `## Executor report` прямо в `tasks/<TZ>.md`". Альтернатива в одну строку: Cursor's draft IS the minimum — файл `docs/agent-checklists/<TZ>.md` уже существует как convention (`_active-map.md:21` явно использует его как Checklist). Чтобы упростить дальше:

- **Сделать `tasks/<TZ>.md` чисто декларативным** (что делать). **Сделать `docs/agent-checklists/<TZ>.md` чисто императивным** (что было сделано + verdict). Это уже **сегодняшнее** разделение — никакого нововведения не нужно. Достаточно фиксировать форматы `## Executor report` + `## Architect verdict` как единственные два императивных раздела в чеклисте.

Короче: твой draft ≈ правильно. Чистый gzip этой идеи — **"append-only две секции в существующий файл, никакой новой папки"**. Уже формально совместимо с твоим же дизайном. Просто **отрежь** лишнее: не нужны `scriptIssues` отчёты, не нужны probe-diaries (есть git log), не нужны custom fields сверх `commit | status | files:N | gates:status | known_issues:≤3 | ask_architect`.

## F. Готовый блок "rules for executor" (≤15 строк)

```text
rules for executor (правый хвост `tasks/<TZ>.md`, copy-paste в one-liner PO):

1. Все изменения коммитишь локально БЕЗ push (делает PO или Cursor).
2. Перед declare "DONE" в `git status` НЕТ dirty/staged файлов сверх `CONFLICT KEYS` TZ.
3. Открой `docs/agent-checklists/<TZ>.md`. Допиши секцию `## Executor report` ровно:
   status: DONE | BLOCKED | NEEDS_FIX
   commit: <7-char-sha>                      # обязательно для DONE
   files: N                                  # число; имена → `git show <sha> --stat`
   gates: tsc=PASS | FAIL, jest=<N>/<N> PASS | FAIL, e2e=<N>/<N> PASS | FAIL
   known_issues: ≤3 short bullets            # запрещены prose-параграфы > 1 строки
   ask_architect: 1 строка                   # пустая если нечего спрашивать
4. НЕ редактируй `tasks/<TZ>.md`, `tasks/_archive/*.done.md`, `STATUS.md`, `progress.md`. Это территория architect'а.
5. НЕ копируй stdout jest/tsc и НЕ пиши "probe records" — в чеклисте есть ссылки на commits и тест-output в git log.
6. Если не выполнил — статус BLOCKED, не фейкай DONE.
```

PO/Cursor держат блок как шаблон в `tz-authoring` skill (см. G).

## G. Антипаттерны (5 — убьют флоу за 1–2 недели)

1. **PO вставляет длинный отчёт executor'а в чат Cursor'а** вместо ссылки на файл. Перечеркивает весь proposal — Cursor тратит столько же tokens, как раньше.
2. **Exector пишет в чеклист std-копии тестов**: `$ pnpm exec jest ... —PASS ... —PASS ...`. Образец-плохой-пример уже есть в `TZ-DOC-321.md:53-78`. Cursor никогда не должен читать эту секцию — это раздувание.
3. **Cursor утверждает без `git show <sha> --stat`**. Прямо нарушает Mode A: "review текстом (без патчей в `*.ts`)" должен быть **визуально подтверждён через diff**, а не через trust-the-executor.
4. **Создание новых файлов STATUS / report-dashboard / Team Room 2.0**. `_active-map.md` уже фиксирует "max 2 streams" — добавлять инфраструктуру = хоронить MVP.
5. **Exector prose > 1 строки в `known_issues:` / `ask_architect:`**. Превращает чеклист в essay. Cursor читает ≤300 input tokens на verdict — если больше, формат размыт.

---

## Резюме для Cursor'а

- Идея **принимается с правками** (A–G выше). Главное: **отрежь prose и stdout-копии** из отчёта; **обяжи `commit: <sha>`**; **закрепи CONFLICT KEYS** как маркер диффа. Это уже 80% успеха.
- Не плоди новые папки/файлы/сервисы — `_active-map.md` уже показывает, что для нововведений места нет.
- Изменения в `tz-authoring/SKILL.md` и `cursor-usage/SKILL.md` — **≤10 строк в каждом**, не больше; вся подробная политика — в этом файле ответа + в будущем `docs/agent-handoff.md` (≤ полстраницы).

Готовый one-liner для PO в чат Cursor'а — отдельным сообщением (не в этом файле).
