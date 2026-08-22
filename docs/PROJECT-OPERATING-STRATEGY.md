# PROJECT OPERATING STRATEGY — kppdf-8.0

> **Канон ежедневной работы с проектом, TZ и ИИ-агентами.**
> Версия: 1.0 · дата: 2026-08-19 · владелец: PO/архитектор.
>
> Этот файл не заменяет `PO-CANON`, `PROJECT-MEMORY`, `TZ-AUTHORING`,
> `GEMINI` и `GIT-POLICY`. Он связывает их в один рабочий алгоритм и отменяет
> двусмысленность старых одноразовых промптов.

## 0. Главный принцип

**Сначала доказать, что именно нужно сделать и где находится источник правды;
затем выполнить одну узкую вертикаль; затем доказать пользовательский результат;
только после этого архивировать.**

Истина проекта — это не история чата и не текст prompt. В текущей работе
приоритет такой:

1. Явное решение PO в текущем чате.
2. Живой код: schema, routes, DTO, service, tests и подтверждённый runtime.
3. `git` на целевой ветке, `docs/agent-checklists/_NOW.md`, `tasks/_active/`.
4. Канонические документы `docs/` и текущая TZ.
5. `progress.md`, `STATUS.md`, старые prompt и архивы — как история и evidence.

При конфликте «живая schema против старой документации» побеждает schema; конфликт
решения PO с техническим предположением останавливает работу и выносится PO.

## 1. Результат полного аудита архивов и prompt-системы

### Объём и метод

Проверены инвентарь репозитория, структура всех task-контуров, 114 prompt-файлов,
архивные статусы, существующие process/data/UX-аудиты, representative DONE,
PARTIAL, BLOCKED, ORPHANED и SUPERSEDED closeout-файлы, а также живые каноны
исполнителя и автора TZ.

На момент аудита файловый инвентарь показал:

- `tasks/_archive/2026-07/` — 89 файлов/артефактов;
- `tasks/_archive/2026-08/` — 913 Markdown-файлов;
- весь `tasks/**/*` — 1154 файла, включая живые задачи, backlog, park и evidence;
- 542 архива с суффиксом `.done.md`;
- 2 честных `BLOCKED`, 3 `ORPHANED`, 7 `SUPERSEDED` архивов;
- 114 prompt-файлов, главным образом в `tasks/_archive/2026-08/prompts-spent/`.

Это **полный ledger-аудит структуры и повторяющихся правил**, а не заявление,
что 1000 документов вручную перечитаны от первой до последней строки. Глубокие
предметные выводы сверены с уже существующими аудитами:

- `docs/audits/2026-08-04-agent-ops-claim-gaps.md`;
- `docs/audits/2026-08-09-project-knowledge-integrity-analysis.md`;
- `docs/audits/2026-08-16-task-ledger-hygiene-audit.md`;
- `docs/audits/2026-08-16-tasks-hygiene-drain-audit.md`;
- `docs/AUDIT-METHODOLOGY.md`;
- `docs/DOCS-INTEGRITY.md` и `docs/FEATURE-INTEGRATION-CHECKLIST.md`;
- `docs/audits/confidence/00-ROLLUP.md` и lanes 01–11.

### Вердикт

Проект получался хорошо не случайно. В нём уже сформировалась сильная инженерная
культура: domain preflight, узкие TZ, conflict keys, один write-path, честные
BLOCKED/PARTIAL, focused gates, архивы, locks, page docs, FIC и запрет опасного
автодеплоя.

Главный накопленный риск находится **не в отсутствии правил**, а в их избытке и
расслоении: старые prompts, root `tasks/`, `OrchestratorKit`, `_NOW`, `STATUS`,
`progress` и архивы иногда описывали одну работу разными словами. Поэтому новая
стратегия должна не добавлять ещё один длинный универсальный prompt, а установить
иерархию, компактный lifecycle и запрет на дублирование канона.

### Что доказало эффективность

1. **Доменная разведка до TZ.** Проверка живой schema/FK/route до формулировки
   задачи предотвращала ошибки `Counterparty ≠ Organization`, неправильный unique,
   смешение КП и Order, а также UI поверх legacy SoT.
2. **Малые вертикали.** Последовательности вроде Catalog, Production, KP, Auth,
   Combine и Desk работали лучше широкого «переписать домен»: один owner, реальные
   conflict keys, измеримые AC и successor вместо расползания scope.
3. **Primary signal.** Визуальный экран, API-ответ, smoke или browser flow ловят
   то, что не ловит один `tsc`. История с Angular template-check показывает:
   `tsc --noEmit` не заменяет `ng build`.
4. **Evidence-first closeout.** Archive-файлы с командами, exit codes, SHA,
   known limitations и review verdict дают воспроизводимую историю.
5. **Честные границы.** `BLOCKED`, `PARTIAL`, `ORPHANED`, `SUPERSEDED` без lock
   лучше фальшивого DONE. Примеры `TZ-119.1`, `TZ-MIG-304`, `TZ-154/176` должны
   считаться эталоном честного завершения.
6. **Reuse-first.** Shared `OrderFormPanel`, `OrderHubTray`, Pi primitives,
   один SoT и один write-path снижают регрессии сильнее, чем локальная красота.
7. **Безопасность процесса.** `deploy` отдельно от `push`, `wipe` отдельно от
   warm deploy, MCP write только через propose→confirm/journal, dirty WIP не
   затирается.

### Что остаётся системным риском

- Исторический prompt легко устаревает; папка `prompts-spent` не является
  источником инструкции для новой сессии.
- Два контура статусов (`tasks/` и `OrchestratorKit`) требуют явного разграничения.
- `DONE` иногда означает «код готов», хотя production/browser smoke ещё BLOCKED;
  deploy и readiness нельзя выводить из archive одного.
- Визуальная/production проверка часто недоступна из-за VPN, Mongo, MCP или
  отсутствия dev-сервера; это должно быть записано как limitation, а не скрыто.
- Большой `STATUS`, `progress` и `_active-map` полезны как история, но вредны как
  startup-контекст и не должны конкурировать с `_NOW`.

## 2. Единая модель контуров

| Контур | Единственная роль | Что считается правдой |
|---|---|---|
| `tasks/` root | канон запуска и живые узкие TZ | только live TZ + canonical prompts |
| `tasks/_backlog/` | утверждённые, но не взятые инициативы | очередь, не активная работа |
| `tasks/_park/` | сознательно отложенная память | нельзя брать без PO |
| `tasks/_active/` | бронь текущей работы | 0–1 claim на hot-file/Layer-3 |
| `tasks/_archive/` | история и доказательства | outcome, evidence, successors |
| `docs/agent-checklists/_NOW.md` | короткая оперативная доска | что делать сейчас |
| `docs/agent-checklists/<ID>.md` | lifecycle evidence одной TZ | claim, AC, gates, report, closeout |
| `OrchestratorKit/` | отдельный kit-контур только для `OrchestratorKit/TZ-*` | не смешивать с root tasks |
| prompt | инструкция конкретной сессии | delta, не SoT |

**Rule:** новый prompt не читается из `prompts-spent`; новый executor начинает с
`PROJECT-MEMORY → PO-CANON → _NOW → active → собственная TZ/checklist`.

## 3. Канонический lifecycle одной TZ

### A. Решение, что вообще делать

1. PO формулирует результат простыми словами.
2. Архитектор выбирает режим: `Review`, `Direct`, `Investigation`, `TDD-first`
   или `TZ-exec`.
3. Проверяется `CAPABILITY-LEDGER`: `absent/removed` нельзя строить без PO.
4. Если вопрос широкий, сначала read-only audit, не код.
5. Если есть существующий archive/commit, работу не повторять: оформить только
   missing closeout, successor или drift-fix.

### B. Domain preflight и TZ

До создания TZ обязательно открыть живую вертикаль:

```text
route/page → FE component → FE service → HTTP → controller/DTO
→ BE service → schema/index → tests → docs/permissions/readiness
```

TZ обязана содержать:

- `TZ-ID`, роль, слой, зависимости, реальные `CONFLICT KEYS`;
- `PAGES` и `PAGE_DOCS` для UI;
- 2–5 проверенных source paths с фактическим символом/полем;
- исходное состояние и точное «почему»;
- 2–7 шагов; больше — split на successor-TZ;
- `ИЗМЕНЯТЬ` и минимум 3 конкретных `НЕ ИЗМЕНЯТЬ`;
- измеримые AC и команды проверки;
- `known_limitation`, successor и критерий BLOCKED;
- ожидаемый primary signal и secondary gates.

Термины должны следовать коду: `Counterparty`, `Organization`, `Order`,
`Contract`, `Worker`, `User`. Указать кардинальность, unique, snapshot/FK и
источник правды; не писать TZ «по памяти».

### C. Claim до кода

До первой product-правки исполнитель:

1. Проверяет workspace, branch, `git status`, worktrees и свежий `origin/main`.
2. Создаёт/обновляет checklist из `_TEMPLATE.md`.
3. Перемещает/отмечает TZ в `tasks/_active/<ID>.md`.
4. Заполняет `agent_id`, `claimed_at` ISO, workspace, Team Room status.
5. Сверяет `_NOW` и все чужие active conflict keys.
6. При пересечении — `STOP/DEFERRED`, без попытки «аккуратно поделить» файл.

Team Room — best-effort signal; checklist Claim slot — обязательный registry.

### D. Исполнение

- Один Layer-3 hot-file — один owner.
- Параллель допустима только при непересекающихся exact keys и независимых
  primary signals.
- Сначала characterization/focused failing test для неясного поведения, затем
  минимальная реализация.
- Не делать «заодно» новый API, RBAC, миграцию, визуальный rewrite и рефактор.
- После каждого зелёного куска обновлять checkpoint, если работа длинная.

### E. Verification

Проверки разделяются на два слоя:

**Primary — обязательно:**

- пользовательский DOM/route/keyboard flow;
- либо подтверждённый API/DB contract;
- либо browser/runtime smoke;
- для migration/import — counters, samples, idempotent rerun и rollback proof.

**Secondary — обязательно по зоне:**

- frontend: `tsc`, focused Jest, ESLint, `ng build`/template check;
- backend: build tsc, focused Jest/e2e, lint;
- desktop/MCP: tsc, tool tests, envelope/outputSchema, journal path;
- architecture/doc: architecture-check, diff-check, reference/path checks;
- cross-cutting: regression tests соседних consumers.

Если runtime недоступен, отчёт обязан сказать `NOT RUN/BLOCKED`, причину, что
проверено статически и какой ручной сценарий остаётся. `tsc PASS` не позволяет
назвать браузерный primary PASS.

### F. Integrity и review

Перед `READY FOR REVIEW` / archive заполнить Integrity slot:

- тип изменения и релевантные FIC §A–F;
- page docs / PAGE-TZ-INDEX / readiness;
- coupling map для общих полей, статусов, фильтров и FK;
- чужой WIP не попал в diff;
- `Executor report (auto)` есть и не разросся;
- known limitations честно выписаны.

Если TZ требует Cursor/PO visual PASS — `READY FOR REVIEW` не превращается в
DONE сам по себе.

### G. Closeout

Только после AC + primary + secondary + review:

1. Создать архив правильного типа: `.done.md`, `.partial.md`, `.blocked.md`,
   `.failed.md`, `.deferred.md`, `.orphaned.md` или `.superseded.md`.
2. Вставить `ARCHIVE_MARKER`, outcome, date, owner, SHA и verification.
3. DONE implementation получает lock по действующему git/kit протоколу; у
   BLOCKED/FAILED/DEFERRED/ORPHANED lock не создаётся.
4. Обновить checklist, `progress.md`, `_NOW` и релевантный STATUS/index.
5. Удалить только активный task-marker, не исторический source и не чужой WIP.
6. Проверить `git diff`, `git diff --check`, точечный stage и target branch.
7. Push/commit — только по `docs/GIT-POLICY.md`; deploy — отдельное решение PO.

## 4. Стратегия prompt-файлов

### Иерархия

1. `tasks/PROMPT-RESUME-ANY.md` — один живой resume/start envelope.
2. Один prompt конкретной волны — только delta: порядок TZ, зависимости,
   conflict keys, специальные bans и gates.
3. `docs/PROJECT-OPERATING-STRATEGY.md` и каноны — правила процесса.
4. `prompts-spent/` — историческое evidence, не инструкция.

`PROMPT-UNIVERSAL-CONTINUOUS.md` уже помечен deprecated: не возвращать в него
полный цикл. Не создавать новый «супер-промпт» на сотни строк.

### Минимальный состав нового prompt

```text
ROLE + ONE OUTCOME
SOURCE OF TRUTH (3–7 paths)
WORKSPACE / CLAIM GATE
ORDER OF TZ (если это wave)
EXACT CONFLICT KEYS + parallel rule
IN SCOPE / HARD BANS / STOP CONDITIONS
PRIMARY + SECONDARY GATES
CLOSEOUT + 5-field Executor report
FINAL REPORT: outcome | archive | SHA | gates | blockers | next
```

Prompt не должен повторять `GEMINI`, полный UI-кодекс или архивную историю.
Любая новая постоянная норма сначала попадает в канонический doc, а не только в
prompt. Prompt может ужесточить scope, но не отменить `GIT-POLICY`, PO-CANON,
DANGEROUS-OPS или явное решение PO.

### Выбор модели

- Freebuff/local helper: механическая рутина, узкий CRUD/form, focused tests,
  docs sync по готовой TZ. Параллель: до **2 Freebuff + 1 Claude terminal**,
  разные conflict keys; Cursor отдаёт `tasks/PROMPT-*.md`.
- Cursor/архитектор: domain preflight, UX/business smell, decomposition,
  review, final verdict, новые TZ. Сложное / новая идея — MCP `claude_code`
  analysis-only **до TZ**.
- Сильная модель: security, 152-ФЗ, необратимая schema/data migration,
  неизвестный cross-domain баг.

Нельзя жечь дорогую модель на `Number()` или перенос одного поля. Нельзя отдавать
малой модели выбор новой capability, schema ownership или production operation.

## 5. Методика исследования и аудита

Выбирать один режим: read-only audit; audit + remediation plan; verification
чужого diff; runtime/browser audit. В каждом отчёте фиксировать дату, branch,
HEAD, dirty state, active claims, conflict disclosure и ограничения.

Каждое утверждение маркировать:

- `CONFIRMED` — code/test/runtime/probe;
- `LIKELY` — сильные признаки, но не хватает запуска;
- `HYPOTHESIS` — нужен targeted check;
- `NOT A BUG` — подтверждённый intentional design;
- `OUT OF SCOPE` — реально, но не этой TZ.

Finding обязан иметь `path:line` или symbol, команду/сценарий, impact и минимальное
решение. Приоритет:

- P0 — потеря данных, bypass security, невалидный исторический контракт,
  блокер запуска;
- P1 — важный бизнес-поток, orphan/cycle, существенный разрыв FE/BE/API;
- P2 — заметный UX/performance/docs gap;
- P3 — косметика или необязательный refactor.

Аудит заканчивается evidence + child-TZ, а не product-кодом «заодно».

## 6. Ежедневная шпаргалка

### PO / владелец

- [ ] Сформулировать один наблюдаемый результат.
- [ ] Сказать, это review, TZ, продолжение или deploy.
- [ ] Не использовать «поехали» как разрешение на опасную операцию.
- [ ] Для реальной развилки выбрать A/B с рекомендацией, а не отдавать модели
      необратимое решение без PO.
- [ ] В конце принять primary signal, а не только красивый отчёт.

### Архитектор / автор TZ

- [ ] Проверить живой код и существующие archive перед новой задачей.
- [ ] Разрешить имена, SoT, unique, кардинальность и dependencies.
- [ ] Сузить до 2–7 шагов и exact conflict keys.
- [ ] Записать measurable AC, primary signal, gates, bans и successor.
- [ ] Сформировать короткий delta-prompt и не копировать весь канон.

### Исполнитель

- [ ] Workspace/branch/status/worktree.
- [ ] Claim slot + active marker до кода.
- [ ] `_NOW` + чужие keys + relevant page/domain docs.
- [ ] Baseline/focused tests → минимальный diff.
- [ ] Primary + secondary gates.
- [ ] Integrity slot + Executor report.
- [ ] Archive outcome, lock policy, progress, `_NOW`, diff review.

## 7. Красные линии

- Не работать в `.freebuff/worktrees/*`; не затирать чужой dirty WIP.
- Не использовать `git add .` / `git add -A`; не коммитить secrets, dumps,
  `ruvector.db`, `__pycache__`, generated `dist`.
- Не добавлять capability со статусом `absent/removed` без решения PO.
- Не делать второй CRUD/write-path, локальный смысл общего статуса или UI поверх
  legacy SoT без migration/coupling plan.
- Не архивировать BLOCKED, PARTIAL или «код есть» как DONE.
- Не объявлять browser/runtime PASS без browser/runtime evidence.
- Не запускать deploy без явного глагола PO; обычный deploy = warm, `wipe` только
  отдельной русской фразой после backup.
- Не использовать старый prompt, если он расходится с этим документом или живым
  кодом.

## 8. Контроль зрелости процесса

Раз в неделю или после большой волны проверять:

- root tasks содержит только живое и canonical prompts;
- `_active` отражает реальные claims, `_NOW` не противоречит HEAD;
- каждый archive имеет outcome и verification; partial/blocked не маскируются;
- prompt-spent не попадает в новые handoff;
- route/page/FIC/DOMAIN-MAP/COUPLING-MAP не дрейфуют;
- deploy status отдельно от code status;
- known limitations либо закрыты successor-TZ, либо осознанно приняты PO.

Раз в месяц — маленький read-only hygiene audit. Автоматизировать только то, что
проверяемо без бизнес-решения: orphan task↔archive, duplicate IDs, missing
archive marker, root/backlog/park placement, broken links, route↔page index count.
Не автоматизировать ценой новой тяжёлой инфраструктуры: Graphify, vector DB и
«универсальный агент» не заменяют evidence и decision ownership.

## 9. Рекомендуемый следующий шаг

Не переписывать архив и не переносить сотни файлов ещё раз. Использовать этот
playbook как индекс процесса. Следующая отдельная docs-only волна, если PO её
утвердит:

1. лёгкий `task-ledger-check` для механических drift-проверок;
2. prompt-lint для обязательных секций и запрета устаревших ссылок;
3. один короткий еженедельный confidence rollup с UNKNOWN/BLOCKED, а не ещё один
   полный history-файл.

До такой автоматизации ручной ритуал выше является обязательным.

## 10. Канонические ссылки

- `docs/PROJECT-MEMORY.md` — startup memory pack;
- `docs/PO-CANON.md` — PO, вкус, продуктовый север;
- `docs/TZ-AUTHORING.md` — domain preflight и форма TZ;
- `docs/AUDIT-METHODOLOGY.md` — evidence-аудит;
- `docs/DOCS-INTEGRITY.md` — code + docs closeout;
- `docs/FEATURE-INTEGRATION-CHECKLIST.md` — route/permission/module/MCP wiring;
- `docs/AGENT-TASK-MODES.md` — primary/secondary signal;
- `docs/GIT-POLICY.md` — commit/push/worktree;
- `GEMINI.md` — executor contract;
- `docs/agent-checklists/_NOW.md` — текущая доска;
- `tasks/PROMPT-RESUME-ANY.md` — живой resume envelope.
