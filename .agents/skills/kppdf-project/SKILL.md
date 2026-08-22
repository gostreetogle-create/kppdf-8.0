---
name: kppdf-project
description: >-
  Project-specific operating rules for kppdf-8.0. Routes Cursor to architect/TZ
  mode and Gemini/local agents to executor mode. Use on any work in this repo.
---

# kppdf-8.0 Project Skill

Используй из корня `D:\kppdf-8.0`. Роли разные — не смешивай циклы.

## Роутинг по роли

| Агент | Контракт | Режим |
|---|---|---|
| **Cursor** | `.cursor/rules/cursor-architect.mdc` + `cursor-usage` + `tz-authoring` + **`docs/TZ-AUTHORING.md`** | Mode A: TZ/планы/UX-smell notes/review; git по `docs/GIT-POLICY.md`; **не** код продукта |
| **Gemini / локальные** | корневой `GEMINI.md` + этот skill + **`kppdf-executor-loop`** | Executor: код, gates, archive, continuous queue; deploy only on explicit PO |
| **Claude Code (MCP peer)** | `CLAUDE.md` режим Peer; Cursor зовёт MCP `claude_code` | Analysis-only: архитектура, идеи, review; **не** grind, **не** product files |
| **Perplexity (MCP)** | `.cursor/mcp.json` `perplexity` | Выжимка сайта/статьи для Cursor; **не** TZ и не код |
| **Claude Code (CLI)** | корневой `CLAUDE.md` → тот же контракт, что `GEMINI.md` (`agent_id: claude`) + этот skill + **`kppdf-executor-loop`** | Executor: цикл/gates/archive как у Gemini; deploy only on explicit PO |
| **LM Studio (Qwen local)** | `docs/agents/LM-STUDIO-AGENT.md` + `scripts/lmstudio-agent/run.mjs` | Draft helper only; **LIMITED_HELPER** — не archive/deploy/security review alone |

Cursor: не читай `GEMINI.md` как свой DoD и не вызывай `executing-plans` / `tdd` / `run-project-checks` / `verification-before-completion` для собственной имплементации.

## Обязательный порядок (исполнитель)

1. Прочитать `GEMINI.md`.
2. Прочитать `docs/PROJECT-MEMORY.md`, `docs/PO-CANON.md`, `_NOW.md`,
   собственные TZ/checklist и релевантный page/domain doc.
3. `OrchestratorKit/AGENTS.md` + `TZF-00.txt` читать только для kit
   `OrchestratorKit/TZ-NN.txt`, не для root `tasks/TZ-*.md`.
3a. Сверить `docs/CAPABILITY-LEDGER.md` и выбрать mode в
    `docs/AGENT-TASK-MODES.md` (primary vs secondary signal).
4. Проверить `git status`, worktree, активные TZ, архивы и conflict keys.
5. **CLAIM:** `tasks/_active/<TASK-ID>.md` + checklist Status CLAIMED + Claim slot
   (`agent_id`, `claimed_at` ISO) по `docs/agent-checklists/_TEMPLATE.md`
   **до** первой правки кода. Без slot — не кодить.
6. Создать/обновить `docs/agent-checklists/<TASK-ID>.md` (acceptance, gates, report).
7. Не дублировать уже подтверждённую работу.
8. Проверить typecheck, tests, lint, а для UI — browser/DOM-сценарий.
9. Провести review diff.
10. Архивировать только после прохождения gates **и** Cursor/PO PASS (если TZ требует).
11. Новое понимание PO → `PO-DIARY.md` §5; стабильный принцип → `PO-CANON.md`.

`TZ-232.A`, `TZ-232.N` и `TZ-232.B` не реализуй повторно без доказанного
дефекта. Wave A не означает завершение родительского `TZ-232`.

## Проектные конвенции

- Backend: NestJS 10, TypeScript strict, Mongoose 8, MongoDB 7 Replica Set.
- Frontend: Angular 20 standalone, Signals, OnPush, strict TypeScript.
- UI: Paper & Ink, OKLCH, hairline borders, `pi-focus-ring`, WCAG.
- Формы/диалоги: `docs/DIALOG-COOKBOOK.md` + `docs/pages/ui-form-field-capacity.md` (ёмкость B и C; поле ≠ ширина окна).
- Package manager: только `pnpm`.
- Не добавляй `any`, raw `HttpClient` в компоненты, секреты или неподтверждённые зависимости.
- Git/commit/push — только по `docs/GIT-POLICY.md`; deploy/wipe имеют отдельные gates.
- GitHub = только хранилище (push/fetch); **не добавлять** GitHub Actions и
  dependabot (решение PO 2026-08-21) — проверки только локальные.

## Skill routing

### Cursor (architect)

| Ситуация | Skill |
|---|---|
| Любая сессия Cursor на репо | `cursor-usage` |
| Написать/уточнить TZ, спеку, AC | `tz-authoring` + **обязательно** `docs/TZ-AUTHORING.md` + `docs/CONTEXT.md` |
| Фича расплывчатая / поток PO | правило `planning-grilling.mdc` (потом TZ, не код) |
| Баг: найти причину, не патчить | правило `debugging-diagnose.mdc` → TZ |
| Архитектурный обзор текстом | правило `architecture-review.mdc` |
| Новый feature / поведение (дизайн) | `brainstorming` |
| План без кода | `writing-plans` |
| Текстовый review чужого diff | `requesting-code-review` / `receiving-code-review` (без патчей) |
| Карта внешних skills (Pocock и др.) | `docs/agents/SKILLS-MAP.md` — **не** ставить mattpocock plugin |

### Исполнитель (Gemini / Claude Code / локальные)

Общие skills — из `C:\Users\User\.agents\skills` (глобально, по необходимости):

| Ситуация | Skill |
|---|---|
| Исполнение готового плана | `executing-plans` |
| TypeScript DSL/generics | `typescript-advanced-types` |
| NestJS/API/database | `nodejs-backend-patterns` |
| REST/GraphQL design | `api-design-principles` |
| Новая функциональность test-first | `tdd` (red-green-refactor; не Cursor) |
| Bug/build/test failure | `systematic-debugging` (reproduce → гипотезы → фикс → регресс) |
| Accessibility/WCAG/keyboard | `accessibility` |
| Performance/Lighthouse | `performance` |
| Angular/browser verification | `webapp-testing` |
| Проверка перед DONE | `verification-before-completion` |
| Worktree isolation | `using-git-worktrees` |
| Работа с PDF | `pdf` |
| Project gates | `run-project-checks` |
| Local Qwen via LM Studio | `docs/agents/LM-STUDIO-AGENT.md` (`node scripts/lmstudio-agent/run.mjs`) |

Проектные skills — репо-локальные, `.agents/skills/*` в этом репозитории
(установлены `npx skills`, отслеживаются в `skills-lock.json`):

| Ситуация | Skill |
|---|---|
| Angular-компонент, signals, formы, DI, роутинг, a11y | `angular-developer` |
| Создание нового Angular-приложения/шаблона | `angular-new-app` |
| Дизайн/ревью MongoDB-схемы, embed vs reference, миграция | `mongodb-schema-design` |
| Медленный запрос, индексация, explain-план | `mongodb-query-optimizer` |
| Настройка connection pool / таймауты Mongoose-клиента | `mongodb-connection` |

`mongodb-mcp-setup`, `mongodb-natural-language-querying`, `mongodb-search-and-ai`,
`mongodb-atlas-stream-processing` из офиц. набора MongoDB **намеренно не ставили** —
требуют MongoDB MCP Server / Atlas, которых в проекте нет (self-hosted Replica Set).
При необходимости: `npx skills add mongodb/agent-skills`.

## Проверки

Используй реальные scripts из manifests. Базовые команды:

```bash
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm test
cd frontend && pnpm lint

cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
cd backend && pnpm test
cd backend && pnpm lint

pnpm architecture:check
```

Для документной задачи проверь Markdown/diff и зафиксируй, почему кодовые
тесты не применимы.

## Архивация

Корневые задачи архивируй в `tasks/_archive/YYYY-MM/`. Для DONE добавляй
`ARCHIVE_MARKER`, обновляй `progress.md` и правильный `STATUS.md`, создавай lock
только для DONE и удаляй task только после архивации. Для `BLOCKED`, `FAILED` и
`DEFERRED` укажи `failure_reason`, `partial_progress`, `next_steps` и
`lock_file_skipped: TRUE`.

Не перезаписывай исторические/superseded-архивы. Для задач OrchestratorKit
дополнительно запускай:

```bash
bash OrchestratorKit/verify-status.sh
```

## Внешние MCP-инструменты (веб-исследование)

Perplexity — не executor и не заменяет роли из таблицы выше. Только внешние
факты (статьи, доки библиотек). Канон продукта — `PROJECT-MEMORY` / `PO-CANON` / TZ.

Два клиента, один ключ `PERPLEXITY_API_KEY` (User env, не git):

| Клиент | Конфиг | Транспорт |
|--------|--------|-----------|
| **Cursor** | `.cursor/mcp.json` | HTTP `https://api.perplexity.ai/mcp`, `Authorization: Bearer ${env:PERPLEXITY_API_KEY}` |
| **Claude Code CLI** | root `.mcp.json` | stdio `npx @perplexity-ai/mcp-server`, env `${PERPLEXITY_API_KEY}` |

Cursor: сайт/статья → выжимка Perplexity → выводы Cursor → сложное ещё MCP `claude_code`.
Allowlist MCP: `claude_code` + Perplexity. Не GitHub Issues / Figma / Postgres / Notion.
Нет сервера `perplexity` в чате → полный перезапуск Cursor (Settings → Tools & MCP).
Не используй Perplexity вместо канона репо.
