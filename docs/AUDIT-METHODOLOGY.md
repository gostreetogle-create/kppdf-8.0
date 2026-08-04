# Методика инженерного аудита kppdf-8.0

**Статус:** канон процесса для аудитов и подготовки узких TZ  
**Режим:** документация; product-код этой методикой не изменяется.  
**Назначение:** помочь агенту отличить подтверждённый дефект от предположения,
переходного состояния или сознательно отложенного scope.

## 1. Зачем нужен аудит

Перед изменением модели данных, миграцией или большой UI-волной аудит должен
построить карту фактов: route → frontend → API → backend → schema → tests → docs.
Это предотвращает дублирование задач, разрыв контрактов, повреждение исторических
КП/заказов и попытки исправить большой домен одним небезопасным рефакторингом.

Аудит не означает «переписать всё». Его результат — evidence, приоритеты,
ограничения и небольшие child-TZ.

## 2. Режимы

До начала выбрать один режим:

- **Read-only audit** — код и данные не изменяются; создаётся отчёт с фактами.
- **Audit + remediation plan** — к отчёту добавляется граф зависимостей и child-TZ;
  реализация не начинается.
- **Verification audit** — проверяется чужой diff, тесты, scope, checklist и архив.
- **Runtime/browser audit** — проверяются живой HTTP, console, responsive и keyboard;
  он дополняет, но не заменяет статическую проверку.

Если conflict keys пересекаются с чужой работой, допустим только read-only audit.

## 3. Preflight

В отчёте зафиксировать:

- дату, ветку и полный `HEAD`;
- `git status --short --untracked-files=all`;
- активные worktree и параллельные TZ;
- `CONFLICT KEYS` выбранной и соседних задач;
- прочитанные `GEMINI.md`, `docs/AI-AGENT-GUIDE.md`, `docs/TZ-AUTHORING.md`,
  master-TZ и PO-решения;
- dirty-файлы других агентов, которые не изменяются;
- доступность Mongo, dev-stack и browser.

Недоступный runtime — это честная limitation, а не повод выдавать предположение
за подтверждённый результат. До preflight не создавать код, миграцию или archive.

## 4. Порядок проверки

### Шаг A — вопрос и границы

Одним абзацем записать, на какой вопрос отвечает аудит и какое решение он должен
поддержать. Вместо «проверить всё» указать домен, страницы и исключения.

### Шаг B — inventory

Составить таблицу:

| Route/page | Component/dialog | FE service | HTTP method/path | Controller/service | Schema/DTO | Roles/scope | Tests/docs |
|---|---|---|---|---|---|---|---|
| `/products` | … | … | … | … | … | … | … |

Искать реальные route definitions, lazy imports, URL-строки сервисов, populated
refs, fixtures и page docs. Отсутствие ожидаемого файла — отдельный finding,
но не доказательство отсутствия функции.

### Шаг C — relation matrix

Для каждой связи указать направление, кардинальность, quantity, порядок, API
записи, read/populate, обратную ссылку и влияние на историю:

| Parent | Child | Cardinality | Qty/order | Write API | Read API | Where-used | History |
|---|---|---|---|---|---|---|---|
| Product | Module | M:N | … | … | … | … | … |
| Module | Material | … | … | … | … | … | … |

Отдельно сравнить legacy и целевой контракт. Нельзя считать новую связь готовой,
если UI рисует её только из legacy-поля.

### Шаг D — сквозной контракт

Для каждого важного поля пройти:

```text
schema → DTO/ValidationPipe → service mapping → controller
→ frontend service type/request → page/form → tests → docs
```

Проверить имя, null/optional/default, whitelist, ObjectId/string/populated формы,
pagination, sort/filter, error envelope, индексы и сохранение значения в service.

### Шаг E — жизненный цикл и данные

Ответить: как запись создаётся, редактируется, архивируется и удаляется; что
происходит со ссылками; может ли изменение каталога изменить исторический документ;
есть ли orphan, duplicate, cycle и concurrency риск; нужны ли lock, idempotency,
transaction, dry-run или rollback для миграции.

Hard-delete сам по себе не является дефектом: нужна policy-проверка сущности,
истории, ссылок и audit trail.

### Шаг F — безопасность

Сверить frontend guards и backend authorization: read/write/delete, role/capability,
organization/system scope, detail/sub-resource routes, 401/403/404 и audit событий.
Route guard не доказывает защиту backend.

### Шаг G — UX/UI-kit

Проверить единые dialog/table/card primitives, размеры, sticky footer, dirty-close,
double-submit, inline error, loading/error/empty, links/back/breadcrumbs, focus,
ESC, keyboard, labels/aria, 375px и конфликт row action с row click/expansion.
Не предлагать косметический rewrite без конкретного UX-дефекта.

### Шаг H — доказательность

Каждое утверждение пометить:

- **CONFIRMED** — есть код, тест, runtime или воспроизводимый probe;
- **LIKELY** — сильные признаки, но не хватает запуска/данных;
- **HYPOTHESIS** — вопрос для targeted follow-up;
- **NOT A BUG** — намеренное ограничение подтверждено документом;
- **OUT OF SCOPE** — реально, но не этой TZ.

Каждая находка содержит `path:line`/symbol, команду или ручной сценарий.

## 5. Приоритеты

- **P0:** потеря данных, обход безопасности, невалидный исторический контракт,
  блокер запуска.
- **P1:** поломка важного потока, orphan/cycle/data-integrity риск или существенный
  разрыв слоёв/API.
- **P2:** заметный UX, performance или documentation gap без немедленной потери данных.
- **P3:** косметика и необязательный рефакторинг.

P0/P1 получают отдельную узкую child-TZ. Не объединять одной задачей миграцию,
новый API, RBAC и массовый UI rewrite с разными conflict keys.

## 6. Из аудита в executable TZ

После отчёта не выдавать агенту весь список findings. На каждую child-TZ указать:

- уникальный ID и одну цель;
- роль, слой, зависимости и successor;
- реальные `CONFLICT KEYS`;
- исходное состояние и запрещённый scope;
- 2–7 шагов;
- измеримые AC и regression tests;
- ручной сценарий и критерий BLOCKED;
- checklist → Executor report → archive → lock/STATUS/progress → удаление активного TZ.

Для каталога безопасная последовательность:

```text
CATALOG-301 Material fields
→ 302 composition contract
→ 303 cycle/depth guards
→ 304 legacy migration + dual-read
→ 305 Product→Product
→ where-used/backlinks
→ composition editor
→ detail/photo/document/stock UX
```

Аудит не разрешает запускать child-TZ, если зависимый контракт не стабилен.

## 7. Формат отчёта

Каждый самостоятельный audit report содержит:

1. title, date, mode, HEAD, scope и conflict disclosure;
2. executive summary и явный verdict;
3. preflight;
4. inventory route → page → service → endpoint → schema;
5. relation/integration matrix;
6. findings P0–P3 с evidence и статусом;
7. подтверждённые non-findings и intentional limitations;
8. data lifecycle, security и UX sections;
9. dependency graph и proposed child-TZ;
10. команды/сценарии verification;
11. ограничения и handoff prompt после согласования PO.

Шаблон finding:

```md
### P1 — краткое название [CONFIRMED]
- Evidence: `path/to/file.ts:123`, `symbolName()`
- Check: `command` или ручной сценарий
- Impact: что ломается и кого затрагивает
- Recommendation: минимальная child-TZ
- Out of scope: что намеренно не исправляется
```

## 8. Контрольный список каталога

Для Product/Module/Material/WorkType обязательно проверить:

- list/detail routes и обратные ссылки;
- product→module, module→material, module→work-type и nested links;
- quantity, unit, sortOrder, populated/unpopulated формы;
- legacy `productModuleIds[]`/`materials[]` против `composition[]`;
- cycle/depth/duplicate/orphan guards;
- `materialKind`, raw-material policy и `weightKg`;
- photos, main photo, caption, reorder и orphan cleanup;
- documents/passports/drawings и access policy;
- warehouse/stock backlinks и read/write scope;
- where-used для переиспользуемых сущностей;
- soft-delete/history/snapshots;
- role/capability/org scope на FE и backend;
- единые dialogs, tables, cards, loading/error/empty states;
- tests, docs, browser scenario и archive hygiene.

## 9. Запреты

Аудит не должен писать product-код «заодно», перезаписывать dirty-файлы,
объявлять finding без evidence, запускать весь backlog параллельно, архивировать
BLOCKED/DRAFT, делать generic refactor всех hard-delete/pagination/UI или заменять
решение PO технической догадкой.

## 10. Связанные документы

- `docs/AI-AGENT-GUIDE.md` — обязательный onboarding;
- `docs/how-to-connect-ai.md` — рабочая папка `main`, запрет `.freebuff/worktrees`;
- `docs/TZ-AUTHORING.md` — правила подготовки TZ;
- `docs/PO-DIARY.md` — планка PO и канон решений;
- `GEMINI.md` — контракт исполнителя (код / gates / archive);
- `tasks/TZ-CATALOG-300.md` — канон каталога;
- `tasks/_backlog/README.md` — правила backlog;
- `docs/audits/` — отчёты конкретных срезов;
- `tasks/_backlog/catalog/TZ-CATALOG-306-catalog-coherence-audit-gpt.md` — пример
  применения методики к каталогу.
