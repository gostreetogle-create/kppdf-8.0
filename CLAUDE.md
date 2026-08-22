# CLAUDE.md — рабочий контракт Claude Code для kppdf-8.0

## Режим вызова

1. **Peer (из Cursor через MCP `claude_code`)** — обсуждение, альтернатива, review.
   Cursor **обязан** звать MCP на сложное / новую идею / архитектуру **до TZ**.
   Если промпт говорит analysis-only / не менять файлы — **не** писать product-код.
2. **Executor (этот CLI как исполнитель)** — тот же контракт, что `GEMINI.md`,
   `agent_id: claude`. Deploy only on explicit PO.
3. Рутинные волны TZ — Freebuff (`tasks/PROMPT-FREEBUFF-*.md`), не жечь Claude.

**Не устанавливать** `mattpocock-skills` plugin и **не** запускать
`/setup-matt-pocock-skills` (подключит GitHub/Linear Issues). Ритуалы уже
в проекте: `docs/CONTEXT.md`, grilling/diagnose/architecture rules, TZ = spec.
Карта: `docs/agents/SKILLS-MAP.md`.

Полный executor-контракт — корневой `GEMINI.md`, без исключений. Не дублируй его.
Не запускай `/init`, если он перезапишет этот файл шаблоном `pnpm dev`.
Разница в Claim slot: `agent_id: claude` (не `gemini`).
CLI/MCP гигиена (не дублировать сюда): @docs/agents/CLAUDE-CODE.md

## Порядок старта (обязательно, в этом порядке)

1. `docs/how-to-connect-ai.md` — читать ПЕРВЫМ в любой сессии (golden rule про
   continuous executor vs isolated worktree, ритуал git sync, запреты).
2. `GEMINI.md` целиком — Definition of Done, claim protocol, стек и конвенции,
   обязательные проверки (typecheck/tests/lint), архивация, git-policy.
3. `docs/PROJECT-MEMORY.md` → `docs/PO-CANON.md` →
   `docs/agent-checklists/_NOW.md` + `tasks/_active/` → своя TZ/checklist →
   релевантный `page.md`/domain doc.
4. `.agents/skills/kppdf-project/SKILL.md` — роутинг skills; следуй ветке
   «Gemini / локальные» (Executor: код, gates, archive, continuous queue).

## Обязательный цикл перед кодом

Как в `GEMINI.md`: `git status`/`branch`/`worktree list` → сверка active TZ и
конфликт-ключей → **Claim** (`tasks/_active/<TASK-ID>.md` + checklist Claim slot,
`agent_id: claude`, `claimed_at` ISO-8601) **до** первой правки кода.
Без заполненного Claim slot — не писать продуктовый код.

## Проверки

```bash
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit && pnpm test && pnpm lint
cd backend  && pnpm exec tsc -p tsconfig.build.json --noEmit && pnpm test && pnpm lint
pnpm architecture:check
```

## Экономия токенов

- Не читай целиком `progress.md`, `STATUS.md`, `PO-DIARY.md`, `ARCHITECTURE.md` —
  это исторические журналы (см. `docs/PROJECT-MEMORY.md`). Открывай только
  релевантный кусок/секцию по задаче.
- Модель по умолчанию — Sonnet, для типовых executor-задач (gates, тесты,
  локальный рефакторинг по готовому TZ) её достаточно. Переключайся на Opus
  (`/model`) только когда реально застрял на архитектурной развилке или
  неоднозначности, которую не решить перебором.
- Одна сессия терминала — один TZ. После archive TZ — `/clear` перед
  следующим, не тащи историю прошлой задачи вперёд.
- Рутинные многочасовые задачи с чётким ТЗ — не сам, а через Freebuff
  (см. `tasks/PROMPT-FREEBUFF-*.md`), это отдельный бюджет, не Claude-токены.

## Если что-то не сходится

Если инструкция в `GEMINI.md` конфликтует со спецификой Claude Code — остановись,
зафиксируй расхождение и уточни у PO. Не изобретай собственный процесс параллельно
существующему.
