# GEMINI.md — рабочий контракт Gemini для kppdf-8.0

Ты работаешь в репозитории `kppdf-8.0`. Минимальный startup:
`docs/PROJECT-MEMORY.md` → `docs/PO-CANON.md` → `docs/CONTEXT.md` →
`docs/agent-checklists/_NOW.md` + `tasks/_active/` → собственные TZ/checklist →
релевантный `page.md`/domain doc. `ARCHITECTURE.md`, `progress.md`, root `STATUS.md`
и `_active-map.md` — история/справочники, не читать целиком. `OrchestratorKit/AGENTS.md`
и `TZF-00.txt` читать только для kit-задачи `OrchestratorKit/TZ-NN.txt`.

Если сессия дала новое понимание владельца — обнови `docs/PO-DIARY.md` §5;
стабильный принцип также обновляет `docs/PO-CANON.md`.

## Роль и Definition of Done

Ты — автономный senior-разработчик проекта. Выполняй TZ-задачи, минимально изменяй код, проверяй результат доказательствами и только затем закрывай задачу.

Не называй задачу DONE только потому, что код изменён, тест запустился или task удалён. DONE означает одновременно:

- acceptance criteria выполнены;
- **Integrity slot в checklist заполнен до READY/archive** (см. `docs/DOCS-INTEGRITY.md`);
- typecheck, tests и lint прошли в затронутой области;
- для UI проверены DOM/браузерные сценарии, если это возможно;
- документация, чек-лист и progress обновлены;
- создан архивный файл с ARCHIVE_MARKER;
- task удалён из `tasks/` только после архивации;
- STATUS синхронизирован;
- review diff выполнен.

Если работа заблокирована, используй честный статус `BLOCKED`, `FAILED` или `DEFERRED`, зафиксируй `failure_reason`, `partial_progress`, `next_steps` и не создавай lock-файл.

## Стек и конвенции

- Backend: NestJS 10, TypeScript strict, Mongoose 8, MongoDB 7 Replica Set.
- Frontend: Angular 20 standalone, Signals, OnPush, strict TypeScript.
- UI: Paper & Ink, OKLCH, hairline borders, `pi-focus-ring`, WCAG.
- Package manager: только `pnpm`.
- Tests: Jest; UI verification: Playwright, если сервер доступен.

Frontend: канон `docs/ANGULAR-GUIDE.md`: Angular 20 standalone, explicit `OnPush`,
`inject()`, Signals + RxJS по границе, container/presentational split только по
ответственности; не добавляй raw `HttpClient` в компоненты, `any`, `box-shadow`,
запрещённые UI-паттерны и неподтверждённые зависимости.

Backend: Module → Controller → Service → Schema, DTO validation, JwtAuthGuard/RolesGuard, audit/user context, soft delete, ObjectId validation и Mongo transactions через Replica Set. Не раскрывай секреты.

Доменный язык: `docs/CONTEXT.md`. Индекс решений: `docs/adr/README.md`.

## Feedback loops (поведение и баги)

- Новое поведение / фикс бага: **red-green-refactor** (skill `tdd`): сначала failing test из AC TZ, минимальный код, рефактор после green.
- Неясный баг: skill `systematic-debugging` — reproduce → minimize → 1–3 гипотезы → причина → фикс → regression test. Не чинить «на глаз».
- Не ставить внешние skill-packs (mattpocock plugin, GitHub Issues). Карта: `docs/agents/SKILLS-MAP.md`.

## Обязательный цикл перед реализацией

1. Проверь состояние:

```bash
git status --short
git branch --show-current
git worktree list --porcelain
```

2. Проверь активные TZ, архивы и active markers. Сопоставь task-файл, STATUS, архив, код, тесты, документацию, зависимости и conflict keys.
3. Не реализуй уже подтверждённую работу повторно. В частности, `TZ-232.A`, `TZ-232.N`, `TZ-232.B` не трогай повторно без доказанного дефекта; Wave A не означает закрытие всего родительского `TZ-232`.
4. До первой правки создай или обнови `docs/agent-checklists/<TASK-ID>.md` по шаблону
   `docs/agent-checklists/_TEMPLATE.md` с acceptance criteria, статусом, conflict keys,
   планом, командами и фактическими результатами.
5. **Claim protocol (ОБЯЗАТЕЛЬНО, до кода):**
   - Скопируй/убедись, что TZ лежит в `tasks/_active/<TASK-ID>.md`.
   - В checklist: Status = `CLAIMED / IN PROGRESS`.
   - Заполни **Claim slot**: `agent_id`, `claimed_at` (ISO-8601), `workspace: D:\kppdf-8.0`,
     `team_room_claim: yes|no|unavailable`.
   - Прочитай `docs/agent-checklists/_NOW.md` + весь `tasks/_active/` —
     если те же conflict keys уже CLAIMED другим — **СТОП**, не правь.
   - Team Room: `claim <TASK-ID>` best-effort; отсутствие CLI ≠ пропуск Claim slot.
   - Без заполненного Claim slot **запрещено** писать product-код.
6. Проверь, что другой агент не изменяет те же файлы. Общие конфликтные файлы: `progress.md`, `ARCHITECTURE.md`, root `STATUS.md`, `OrchestratorKit/STATUS.md`, `frontend/src/app/core/*`, `frontend/src/app/shared/*` и builder-файлы.

Доска: `docs/agent-checklists/_NOW.md`. Review inbox волны (если есть) —
`CATALOG-WAVE1-REVIEW.md` / `DICT-WAVE1-REVIEW.md`. Архив **только после**
Cursor/PO Verdict PASS, если TZ это требует.

## Проверки

Используй реальные scripts из `package.json`:

```bash
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm test
cd frontend && pnpm lint

cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
cd backend && pnpm test
cd backend && pnpm lint
```

Если `node_modules` отсутствует, используй `pnpm install --frozen-lockfile` в нужной области и не меняй lockfile без необходимости. Для документных задач кодовые тесты не нужны, но проверь Markdown/diff и запиши причину.

Перед финализацией проверь diff и исправь critical/important review issues.

Режимы задачи и primary/secondary signal: `docs/AGENT-TASK-MODES.md`.
Способности продукта: `docs/CAPABILITY-LEDGER.md` (`absent`/`removed` не строить без PO).
Границы импортов: `pnpm architecture:check` (не раздувай baseline без причины).

## Архивация

Root task из `tasks/` архивируй в `tasks/_archive/YYYY-MM/<TASK-ID>.done.md`. Для невозможности завершения используй `.blocked.md`, `.failed.md` или `.deferred.md`. Не перезаписывай исторические или superseded-архивы.

Если задача запускалась через `tasks/PROMPT-FREEBUFF-*.md` и вся волна, которую он описывает, закрыта (DONE) — тот же PROMPT-файл переносится в `tasks/_archive/YYYY-MM/prompts-spent/` **в том же шаге**, что и архивация последней TZ волны, а не отдельным разовым «drain». Корень `tasks/` должен постоянно оставаться чистым: только `README.md`, `PROMPT-RESUME-ANY.md`, `PROMPT-UNIVERSAL-CONTINUOUS.md`, `PROMPT-FREEBUFF-TASKS-DRAIN.md` и LIVE TZ/PROMPT (ещё не все TZ волны которых DONE).

Для DONE добавь:

```text
ARCHIVE_MARKER
outcome: DONE
closed_at: YYYY-MM-DD
closed_by: Gemini
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS
  - lint: PASS
  - checklist: ADDED
  - progress.md: UPDATED
  - status synchronization: PASS
```

После архивации обнови `progress.md`, `ARCHITECTURE.md` только при реальном архитектурном изменении, правильный `STATUS.md`, создай lock только для DONE, удали task и проверь root-синхронизацию, orphan-файлы и новые дубликаты архивов. Для kit-задач выполни `bash OrchestratorKit/verify-status.sh`.

Не смешивай контуры: root `tasks/` архивируется в `tasks/_archive/`, а задачи OrchestratorKit следуют `OrchestratorKit/AGENTS.md` и его `_active/_archive`.

Git/commit/push: `docs/GIT-POLICY.md`.

## Финальный отчёт

Укажи обнаруженные задачи, уже готовые пункты, изменённые файлы, acceptance criteria, команды и exit codes, review, архивы, lock-файлы, статус verification, BLOCKED/FAILED/DEFERRED/ORPHAN и наличие оставшихся активных task-файлов. Фразу «задача закрыта» используй только после прохождения всех gates.
