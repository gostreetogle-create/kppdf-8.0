═══════════════════════════════════════════════════════════════
CYCLE-PROMPT: Аудит → Приоритизация → Грамотное Исправление → Архивация TZ
═══════════════════════════════════════════════════════════════

> 📋 **Универсальный промпт** для запуска цикла работы над TZ-тасками
> проекта с `OrchestratorKit`. Используйте его, когда нужно:
>
> 1. Понять, какие TZ-таски сделаны/не сделаны.
> 2. Принять техническое решение: фиксить / отложить / отменить.
> 3. Грамотно реализовать фикс (фикс проходит через TZF-00 финализатор).
> 4. Корректно архивировать его в `_archive/` и обновить STATUS.md.
>
> **Использование:** скопируйте этот файл в свой рабочий контекст
> вместе с конкретным TZ-NN (или списком TZ), который хотите
> провести через цикл.

═══════════════════════════════════════════════════════════════
МНОГОАГЕНТНАЯ КООРДИНАЦИЯ (reviewer 2026-07-12, multi-agent gap)
═══════════════════════════════════════════════════════════════

cycle-prompt в базовом виде описывает **1 агент = 1 TZ в один момент**.
Если вы запускаете **несколько агентов параллельно** в одном цикле
(TZF-00 §ПРАВИЛА ПАРАЛЛЕЛЬНОЙ РАБОТЫ разрешают до 4-5 одновременно),
добавьте эту prelude перед ФАЗОЙ 0:

1. **Wave planning**: разбейте все ⏳ READY на 2-3 wave'а по CONFLICT KEYS.
   - Wave 1: Layer 4 (backend, до 2 одновременно).
   - Wave 2: Layer 1/2 (CSS + new components, до 2 одновременно).
   - Wave 3: Layer 3 (edit existing, **СТРОГО 1 агент**).
2. **Per-wave full cycle**: проведите полный цикл (PHASE 0 → PHASE 4) для
   каждой wave'ы как отдельный запуск. Иначе race-condition между agents.
3. **Archive convergence**: после каждой wave run `verify-status.sh` —
   убедитесь что все wave-TZ в правильных секциях STATUS.md.
4. **Cross-agent comms**: если во время ФАЗЫ 3 один agent обнаруживает
   нужным изменить файл, который трогает другой agent → STOP, escalate PO.

═══════════════════════════════════════════════════════════════
ФАЗА 0 — ПОДГОТОВКА: ЧТЕНИЕ КОНТЕКСТА
═══════════════════════════════════════════════════════════════

**ГЛАЗАМИ АГЕНТА — ПРЕЖДЕ ЧЕМ ЧТО-ЛИБО ДЕЛАТЬ, прочитайте:**

1. `OrchestratorKit/_templates/TZ-template.txt` — формат TZ-тасков.
2. `OrchestratorKit/_templates/TZF-00.txt` — финализатор (9 шагов).
3. `OrchestratorKit/STATUS.md` — текущая доска статусов.
4. `OrchestratorKit/AGENTS.md` — мануал поведения агента.
5. `ARCHITECTURE.md` (корень проекта) — границы слоёв, конвенции.
6. `progress.md` (корень проекта) — хронология.

**Сканирование файловой системы (команды):**

```bash
# 1. Какие TZ на руках (READY)?
ls tasks/TZ-*.md

# 2. Какие TZ в работе (IN_WORK)?
ls OrchestratorKit/_active/ 2>/dev/null

# 3. Что уже в архиве (DONE)?
find . -path '*/_archive/*.done.txt' -o -path '*/_archive/*.done.md'

# 4. Что провалилось (FAILED)?
find . -path '*/_archive/*.failed.txt' -o -path '*/_archive/*.failed.md'

# 5. Запустить авто-чекер синхронизации STATUS ↔ FS
bash OrchestratorKit/verify-status.sh
```

> **GATE-0:** verify-status.sh PASS. Если FAIL — чинить рассинхрон вручную,
> не продолжать.

**ВЫХОД ФАЗЫ 0:** enumerate table (TZ-NN numbering: до TZ-99 — 2 цифры, 100+ — 3 цифры, для больших TZ разделитель `.`):

| TZ-NN | Название | Conflict Keys | Зависим от | Где сейчас |
|-------|----------|---------------|------------|-----------|
| TZ-115 | Inventory error toast | inventory/*.page.ts | — | `tasks/TZ-115.md` (READY) |
| TZ-115.1 | Inventory httpResource migration | inventory/*.page.ts | TZ-115 | `tasks/TZ-115.1.md` (READY, можно поделить большой TZ) |
| TZ-119 | Backend safety sweep | backend/src/modules/{products,orders,...}/* | TZ-110 | `tasks/TZ-119.md` (READY) |
| ... | ... | ... | ... | ... |

**Decimal `.N` суффикс семантика** (TZF-00 §): большой TZ (>7 ШАГОВ) писать
как TZ-NNa + TZ-NNb + … и DEPENDENCIES = TZ-NNa → TZ-NNb.

═══════════════════════════════════════════════════════════════
ФАЗА 1 — АУДИТ: КЛАССИФИКАЦИЯ ТАСКОВ ПО СТАТУСУ
═══════════════════════════════════════════════════════════════

**Для КАЖДОГО TZ-NN вычислите его текущий статус:**

| Статус | Как определить | Что означает |
|--------|----------------|--------------|
| ✅ **DONE** | `tasks/_archive/<YYYY-MM>/TZ-NN.done.{txt,md}` существует; STATUS.md строка в ✅ DONE | Архив подтверждает, что задача выполнена ранее |
| 🔥 **IN_WORK** | `OrchestratorKit/_active/TZ-NN.{txt,md}` существует; STATUS.md строка в 🔥 IN WORK | Агент сейчас работает над этим TZ |
| ⏳ **READY** | `tasks/TZ-NN.md` существует; STATUS.md строка в ⏳ READY | TZ написан, готов к выдаче агенту |
| ❌ **FAILED** | `tasks/_archive/<YYYY-MM>/TZ-NN.failed.{txt,md}` существует; STATUS.md строка в ❌ FAILED | Архив подтверждает провал, нужен successor |
| 🚧 **BLOCKED** | TZ-файл ссылается на ЗАВИСИМОСТИ которые DONE/FAILED (deps not met) | TZ ждёт predecessors |
| ⚠️ **ORPHAN** | TZ-NN есть в STATUS.md, но файл нигде на FS (рассинхрон) | Ручное исправление |
| 💀 **ABANDONED** | TZ-NN без архива > 60 дней и в ⏳ READY — техдолг | Пере-выпуск или DEFER |

> **GATE-1:** Каждый TZ в таблице выше имеет И (a) file location, И (b) STATUS.md row —
> ОБА должны совпадать. Если рассинхрон — STOP, чинить вручную (либо удалить
> файл, либо STATUS.md row).

**ВЫХОД ФАЗЫ 1:** audit table с разбивкой:

```
TOTAL TZ:      N
✅ DONE:       N
🔥 IN_WORK:    N
⏳ READY:      N
❌ FAILED:     N
🚧 BLOCKED:    N
⚠️ ORPHAN:     N (если > 0 — STOP, ручной fix)
💀 ABANDONED:  N
```

═══════════════════════════════════════════════════════════════
ФАЗА 2 — ПРИОРИТИЗАЦИЯ: РЕШЕНИЕ О ДЕЙСТВИИ
═══════════════════════════════════════════════════════════════

**Заполните decision matrix для каждого TZ-не-DONE:**

| TZ | Severity (Criticality) | Рекомендация | Action |
|----|-------------------------|--------------|--------|
| TZ-115 | **CRITICAL** (silent error drop в inventory) | FIX ASAP | → ФАЗА 3 |
| TZ-110 | HIGH (fullPath integrity) | FIX batch 1 | → ФАЗА 3 |
| TZ-119 | HIGH (backend safety parity) | Sequencing: после TZ-110 | → ФАЗА 3 (отложено) |
| TZ-117 | MEDIUM (a11y UX) | Sequencing: после TZ-115 | → ФАЗА 3 (отложено) |
| TZ-118 | MEDIUM (Type Safety refactor) | Sequencing: после TZ-117 | → ФАЗА 3 (отложено) |
| TZ-80 | ❌ REJECTED (out of scope) | Architectural decision | DEFER permanently |

**Severity классификация (reviewer-aligned, TZ-115 anchor для reference):**

| Severity | Описание | Action SLA | Пример (kppdf-8.0) |
|----------|----------|------------|---------------------|
| **CRITICAL** | Silent data loss / unhandled exception / production revenue impact | **≤ 24h** | TZ-115 (inventory silent error drop) |
| **HIGH** | Data integrity / cascading bug | **≤ 7d** | TZ-110 (category fullPath referential integrity) |
| **MEDIUM** | UX / a11y / type safety | **В текущем спринте** | TZ-117 (toolbar UX) |
| **LOW** | Code quality / consistency | Backlog / майбутний TZ | TZ-116 Step 3 (storage-items accessor gap) |

**Defensive flows таблица:**

| Situation | Action |
|-----------|--------|
| TZ DONE, не хотите трогать | Skip — no-op. (Если хотите verify — откройте архив и прочитайте SUMMARY.) |
| TZ FAILED | Не начинайте заново. Прочитайте `_archive/.../TZ-NN.failed.txt` → create successor TZ-NN+1.md (новый НОМЕР!). |
| TZ BLOCKED upstream | DEFER. Не начинайте — недостающие predecessors в DUE-first списке. |
| TZ ORPHAN | Ручний fix: либо создать файл в _active/ или _archive/, либо remove row из STATUS.md. |
| TZ ABANDONED | Decision: либо обновить (sprint-planning), либо формально архивировать `TZ-NN.abandoned.txt` с пометкой. |
| Конфликт CONFLICT KEYS с другим TZ | DEFER в `_archive/<YYYY-MM>/TZ-NN.deferred.txt` (TZF-00 §ПРАВИЛА ПАРАЛЛЕЛЬНОЙ РАБОТЫ). |

> **GATE-2:** Решение по КАЖДОМУ TZ-не-DONE задокументировано
> в плане. Если есть НЕРЕШЁННЫЕ — STOP, спросить PO.

**PO APPROVAL GATE (reviewer 2026-07-12):** Завершение ФАЗЫ 2 = PAUSE.

После построения decision matrix **ОБЯЗАТЕЛЬНО** отдать результат PO для подтверждения:

> «Decision matrix готов. Severity/sequencing необходимо PO approval
> до старта ФАЗЫ 3. Вопросы к PO:
> 1. Подтвердить ли я priority для TZ-X?
> 2. Если несколько CRITICAL — зафиксировать ли sequencing?
> 3. Override severity (downgrade HIGH → MEDIUM если direct user-impact мал)?»

Без PO подтверждения **НЕ начинайте ФАЗУ 3**. Иначе рискуете:
- Потратить часы на TZ который PO решит defer.
- Sequencing-конфликт с TZ которые PO хочет параллельно.

═══════════════════════════════════════════════════════════════
ФАЗА 3 — ГРАМОТНОЕ ИСПРАВЛЕНИЕ (TZF-00 9-STEP CYCLE)
═══════════════════════════════════════════════════════════════

**Для ВЫБРАННОГО TZ:**

**ШАГ 0 — ПЕРЕМЕЩЕНИЕ В `_active/`:**
- `mv tasks/TZ-NN.md → OrchestratorKit/_active/TZ-NN.md` (или `move` на Windows).
- STATUS.md: строка TZ-NN из `⏳ READY` → `🔥 IN WORK` (с датой старта YYYY-MM-DD).
- Убедитесь, что CONFLICT KEYS TZ-NN не пересекаются с другими TZ в `_active/`
  (TZF-00 §ПРАВИЛА ПАРАЛЛЕЛЬНОЙ РАБОТЫ — Вар. 1: ждать, Вар. 2: defer).

**ШАГ 1 — САМОПРОВЕРКА по КРИТЕРИЯМ ПРИЁМКИ из TZ-NN:**

Для каждого критерия приёмки к концу TZ-NN:

```
[a] ✓ Выполнено полностью, не "примерно".
[b] ✓ В итоговом поведении UI: загрузка / ошибка / пустота / граничные случаи.
[c] ✓ Стили не "поехали", responsive не сломан.
[d] ✓ Никаких pre-existing багов не сломано.
```

Если отклонение → ИСПРАВИТЬ СЕЙЧАС, не продолжать.

**ШАГ 2 — ТЕХНИЧЕСКАЯ ПРОВЕРКА ЗАПУСКА:**

```bash
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit    # exit 0 обязателен
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit    # exit 0 обязателен
cd backend && pnpm exec jest.*                                # tests pass
cd frontend && pnpm exec jest.*                               # tests pass
```

Если build падает — найти, починить, пересобрать. Цель: проект собираемый.

**GATE-2-bis:** Все четыре команды exit 0. Если нет → STOP, исправить.

**ШАГ 3 — ФИКСАЦИЯ в `progress.md` (ОБЯЗАТЕЛЬНО):**

Добавить запись в конец `progress.md`:

```markdown
## [YYYY-MM-DD] — Завершено: TZ-NN ([краткое название])

**Исполнитель:** [ВАША РОЛЬ]
**Статус:** Выполнено / Проверено / Требует перепроверки
**Что сделано кратко:** 2-3 предложения о сути изменений.
**Затронутые файлы/папки:**
- backend/src/modules/category/category.service.ts
- backend/src/modules/category/category.controller.ts
- ...
**Известные ограничения:** pre-existing проблемы, которые видели, но не чинили.
```

**ШАГ 4 — ОБНОВЛЕНИЕ `ARCHITECTURE.md` (ОБЯЗАТЕЛЬНО):**

В секции «Зоны ответственности агентов» обновить свою зону:
- Что появилось нового в архитектуре?
- Какие соглашения TZ ввёл в проект?
- Какие ключевые файлы/папки созданы?

Если TZ тривиально не меняет архитектуру — указать явно «No architectural change».

**ШАГ 5 — ЛОК-ФАЙЛ `.mimocode/locks/TZ-NN-*.lock` (только для DONE!):**

```
# Lock file
Locked as of [YYYY-MM-DD] — TZ-NN: [название].

Owner: [ВАША РОЛЬ]
Protected files:
- [список файлов, которые вы стабилизировали]

Unlock: only via orchestrator approval (новое TZ-NN с пометкой «successor»).
```

> ⚠️ Для FAILED outcome — НЕ создавать lock-файл (successor-TZ будет
> пере-выпущен под новым номером).

═══════════════════════════════════════════════════════════════
ФАЗА 4 — АРХИВАЦИЯ + СИНХРОНИЗАЦИЯ (TZF-00 ШАГИ 6-7)
═══════════════════════════════════════════════════════════════

**ШАГ 6 — АРХИВИРОВАНИЕ:**

Если работа прошла УСПЕШНО:

1. Скопировать `_active/TZ-NN.md` → `tasks/_archive/YYYY-MM/TZ-NN.done.md`
2. Добавить ARCHIVE_MARKER в конец (формат ниже).
3. Удалить `_active/TZ-NN.md`.
4. **Удалить оригинал `tasks/TZ-NN.md`** (иначе файл дублируется: оригинал + архив).
5. STATUS.md: строка TZ-NN из `🔥 IN WORK` → `✅ DONE` (с датой + archive path).

Если ПРОВАЛИЛАСЬ:

1. Скопировать → `tasks/_archive/YYYY-MM/TZ-NN.failed.md`
2. ARCHIVE_MARKER с пометкой `outcome: FAILED` + `failure_reason` + `next_steps`
3. Удалить `_active/TZ-NN.md`.
4. **Удалить оригинал `tasks/TZ-NN.md`** (иначе файл дублируется: оригинал + архив).
5. STATUS.md → `❌ FAILED`
6. **НЕ создавать lock-файл** (для successor-TZ он будет генерироваться заново).

**ARCHIVE_MARKER формат (для DONE):**

```markdown
┌─────────────────────────────────────────────────────────────────┐
│ ARCHIVE_MARKER                                                  │
│ outcome: DONE                                                   │
│ closed_at: [YYYY-MM-DD]                                         │
│ closed_by: [ВАША РОЛЬ]                                          │
│ protected_files:                                                │
│   - backend/...                                                 │
│   - frontend/...                                                │
│ affected_areas:                                                 │
│   - frontend/src/app/shared/util/...                            │
│   - ...                                                         │
│ verification:                                                   │
│   - npm run build: PASS                                         │
│   - acceptance criteria: PASS                                   │
│   - progress.md entry: ADDED                                    │
│   - architecture.md update: DONE                                │
│   - lock file: CREATED                                          │
│ notes: [Любые важные заметки, non-obvious discoveries]          │
└─────────────────────────────────────────────────────────────────┘
```

**ARCHIVE_MARKER формат (для FAILED):**

```markdown
┌─────────────────────────────────────────────────────────────────┐
│ ARCHIVE_MARKER                                                  │
│ outcome: FAILED                                                 │
│ closed_at: [YYYY-MM-DD]                                         │
│ closed_by: [ВАША РОЛЬ]                                          │
│ failure_reason: ... (что не получилось и почему)                 │
│ partial_progress: ... (что успели сделать)                       │
│ next_steps: ... (что делать successor-TZ)                        │
│ lock_file_skipped: TRUE                                         │
└─────────────────────────────────────────────────────────────────┘
```

**ШАГ 6+ — ПРОВЕРКА СИНХРОНИЗАЦИИ:**

```bash
bash OrchestratorKit/verify-status.sh
```

Результат:
- **PASS** → STATUS.md синхронизирован с FS. Переходим к ШАГ 7.
- **FAIL** → STOP. ЧИСТИТЬ ВРУЧНУЮ: обычно достаточно переместить TZ-NN строку
  в нужную секцию STATUS.md.

**ЗАПРЕТ:** «Задача закрыта» до тех пор, пока verify-status.sh не вернёт PASS.
Это жёсткое правило — ложь здесь убивает проект.

**ШАГ 7 — ФИНАЛЬНЫЙ ОТЧЁТ:**

В конце ответа PO выведите СТРОГО эту фразу (подставив переменные):

```
«Задача TZ-NN выполнена и проверена. Запись добавлена в progress.md,
документация актуализирована. TZ архивирован в
_archive/YYYY-MM/TZ-NN.done.md (или .failed.md). Критичные файлы:
[перечислить]. Задача закрыта.»
```

═══════════════════════════════════════════════════════════════
ФАЗА 5 — СЛЕДУЮЩИЙ ЦИКЛ (LOOP)
═══════════════════════════════════════════════════════════════

После успешной архивации одного TZ цикл **НЕ завершён** — есть ещё таски
в ⏳ READY или 🔥 IN_WORK. Вернитесь к **ФАЗА 0** нового цикла:

1. Обновите enumeration table.
2. Переклассифицируйте на основе новых данных.
3. Примите новое решение по приоритизации.
4. Переходите к ФАЗЕ 3 для следующей TZ.

**Условия выполнения цикла:**
- **LOOP CONTINUES WHILE** (🔥 IN_WORK > 0 OR ⏳ READY > 0)
- **LOOP STOPS WHEN** (остались только ✅ DONE-only state, ❌ FAILED, 🚧 BLOCKED или ❌💀 ABANDONED)

═══════════════════════════════════════════════════════════════
DEFINITION OF DONE (КРИТЕРИИ ПРИЁМКИ ВСЕГО ЦИКЛА)
═══════════════════════════════════════════════════════════════

Чтобы отчёт цикла был правдой, ВСЕ пункты ниже должны быть TRUE:

| # | Пункт | Проверка |
|---|--------|----------|
| 1 | audit table complete (все TZ перечислены) | ФАЗА 1 |
| 2 | Все TZ имеют consistent (file ↔ STATUS.md) связь | verify-status.sh PASS |
| 3 | Severity присвоена каждому ⏳ READY / 🔥 IN_WORK | ФАЗА 2 |
| 4 | Sequencing decision documented | ФАЗА 2 |
| 5 | Все implementation goals прошли любые из: build/test/lint | ШАГ 2 TZF-00 |
| 6 | progress.md entry ADDED | grep "[YYYY-MM-DD] — Завершено: TZ-NN" progress.md |
| 7 | ARCHITECTURE.md UPDATED | grep TZ-NN-marked-section ARCHITECTURE.md |
| 8 | Lock file CREATED | cat .mimocode/locks/TZ-NN-*.lock (только DONE!) |
| 9 | ARCHIVE copy exists at correct path | ls _archive/YYYY-MM/TZ-NN.{done,failed}.md |
| 10 | STATUS.md row reflects outcome | grep "TZ-NN" STATUS.md → ✅ DONE / ❌ FAILED |
| 11 | verify-status.sh ВОЗВРАЩАЕТ 0 (PASS) | terminal exit code |
| 12 | Final user report формат correct | чат-output |

Если хотя бы один пункт FALSE — цикл НЕ closed. Fix и retry.

═══════════════════════════════════════════════════════════════
АНТИ-ПАТТЕРНЫ (чего НЕ делать)
═══════════════════════════════════════════════════════════════

❌ **НЕ ПИШИТЕ** новый TZ поверх существующего без явного successor-number.

   ❌ Нельзя: править `tasks/TZ-115.md` после архивирования — это замёт
   audit trail. Правильно: создать `tasks/TZ-120.md` как successor.

❌ **НЕ ГОВОРИТЕ** «готово» пока verify-status.sh не PASS.

❌ **НЕ СОЗДАВАЙТЕ** lock-файл для FAILED outcome.

❌ **НЕ КОПИРУЙТЕ** TZF-00 или этот cycle-prompt в `_archive/`.

❌ **НЕ ТРОГАЙТЕ** `_templates/*` файлы — они служебные.

❌ **НЕ ПЕРЕЗАПИСЫВАЙТЕ** существующий архив (TZ-NN.done.md → TZ-NN.done.md).
   Если уже есть — это racing, остановитесь и разберитесь.

═══════════════════════════════════════════════════════════════
ШАБЛОНЫ ДЛЯ ОТЧЁТА
═══════════════════════════════════════════════════════════════

**Краткий отчёт цикла (после полного прохода):**

```
ЦИКЛ [ДАТА] ЗАВЕРШЁН ✅

Аудит:
  TZ-110: ✅ DONE (архив 2026-07/TZ-110.done.md)
  TZ-115: ✅ DONE (архив 2026-07/TZ-115.done.md)
  TZ-119: ⏳ READY → 🔥 IN WORK (TZ-119.md сейчас в _active/)

Сейчас:
  - 🔥 IN WORK: 1 TZ (TZ-119)
  - ⏳ READY: 4 TZ (TZ-111, 112, 113, 116, 117, 118, 119)
  - ✅ DONE: 60+ (включая новые TZ-110, 115)
  - ❌ FAILED: 0

verify-status.sh: PASS
Запись progress.md: ADDED
LOCK файл создан: TZ-110, TZ-115
Следующий цикл: TZ-119 в работе.
```

═══════════════════════════════════════════════════════════════
КОНЕЦ CYCLE-PROMPT
═══════════════════════════════════════════════════════════════

> 💡 **Сценарий реального использования:**
>
> 1. Скопировать этот файл в контекст агента вместе с конкретным TZ-NN.md.
> 2. Дать агенту одну фразу: «Проведи TZ-NN через CYCLE-PROMPT».
> 3. Агент читает cycle-prompt → PHASE 0 → PHASE 1 → ... → PHASE 4.
> 4. На каждой фазе агент делает действия и ОСТАНАВЛИВАЕТСЯ на GATE.
> 5. После всех GATE-pass → ШАГ 7 финальный отчёт → цикл closed.
>
> Используйте как thel'audit contract с любым агентом —
> Claude Code, Cursor, OpenAI Codex, собственный скрипт.
