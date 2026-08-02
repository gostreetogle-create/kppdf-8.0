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
| **Cursor** | `.cursor/rules/cursor-architect.mdc` + `cursor-usage` + `tz-authoring` + **`docs/TZ-AUTHORING.md`** | Mode A: TZ/планы/UX-smell notes/review; **commit+push своих docs**; **не** код продукта |
| **Gemini / локальные** | корневой `GEMINI.md` + этот skill (секции ниже) | Executor: код, gates, archive |
| **LM Studio (Qwen local)** | `docs/agents/LM-STUDIO-AGENT.md` + `scripts/lmstudio-agent/run.mjs` | Draft helper only; **LIMITED_HELPER** — не archive/deploy/security review alone |

Cursor: не читай `GEMINI.md` как свой DoD и не вызывай `executing-plans` / `tdd` / `run-project-checks` / `verification-before-completion` для собственной имплементации.

## Обязательный порядок (исполнитель)

1. Прочитать `GEMINI.md`.
2. Прочитать `README.md`, `ARCHITECTURE.md`, `STACK.md`,
   `docs/AI-AGENT-GUIDE.md`, `docs/DEVELOPMENT-PATTERNS.md`.
3. Для TZ-flow прочитать `OrchestratorKit/AGENTS.md` и
   `OrchestratorKit/_templates/TZF-00.txt`.
4. Проверить `git status`, worktree, активные TZ, архивы и conflict keys.
5. Создать `docs/agent-checklists/<TASK-ID>.md` до первой правки.
6. Не дублировать уже подтверждённую работу.
7. Проверить typecheck, tests, lint, а для UI — browser/DOM-сценарий.
8. Провести review diff.
9. Архивировать только после прохождения gates.

`TZ-232.A`, `TZ-232.N` и `TZ-232.B` не реализуй повторно без доказанного
дефекта. Wave A не означает завершение родительского `TZ-232`.

## Проектные конвенции

- Backend: NestJS 10, TypeScript strict, Mongoose 8, MongoDB 7 Replica Set.
- Frontend: Angular 20 standalone, Signals, OnPush, strict TypeScript.
- UI: Paper & Ink, OKLCH, hairline borders, `pi-focus-ring`, WCAG.
- Package manager: только `pnpm`.
- Не добавляй `any`, raw `HttpClient` в компоненты, секреты или неподтверждённые зависимости.
- Не выполняй production-действия, destructive-команды, `git push` или `git commit` без явного запроса владельца.

## Skill routing

### Cursor (architect)

| Ситуация | Skill |
|---|---|
| Любая сессия Cursor на репо | `cursor-usage` |
| Написать/уточнить TZ, спеку, AC | `tz-authoring` + **обязательно** `docs/TZ-AUTHORING.md` |
| Новый feature / поведение (дизайн) | `brainstorming` |
| План без кода | `writing-plans` |
| Текстовый review чужого diff | `requesting-code-review` / `receiving-code-review` (без патчей) |

### Исполнитель (Gemini / локальные)

Подключай skills из `C:\Users\User\.agents\skills` только по необходимости:

| Ситуация | Skill |
|---|---|
| Исполнение готового плана | `executing-plans` |
| TypeScript DSL/generics | `typescript-advanced-types` |
| NestJS/API/database | `nodejs-backend-patterns` |
| REST/GraphQL design | `api-design-principles` |
| Новая функциональность test-first | `tdd` |
| Bug/build/test failure | `systematic-debugging` |
| Accessibility/WCAG/keyboard | `accessibility` |
| Performance/Lighthouse | `performance` |
| Angular/browser verification | `webapp-testing` |
| Проверка перед DONE | `verification-before-completion` |
| Worktree isolation | `using-git-worktrees` |
| Работа с PDF | `pdf` |
| Project gates | `run-project-checks` |
| Local Qwen via LM Studio | `docs/agents/LM-STUDIO-AGENT.md` (`node scripts/lmstudio-agent/run.mjs`) |

## Проверки

Используй реальные scripts из manifests. Базовые команды:

```bash
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm test
cd frontend && pnpm lint

cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
cd backend && pnpm test
cd backend && pnpm lint
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
