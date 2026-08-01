---
name: kppdf-project
description: Project-specific operating rules for Gemini working on the kppdf-8.0 repository
---

# kppdf-8.0 Project Skill

Используй этот skill из корня репозитория `D:\kppdf-8.0` вместе с корневым
`GEMINI.md`. `GEMINI.md` — главный контракт проекта; этот файл дополняет его
маршрутизацией навыков и короткими правилами.

## Обязательный порядок

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

Подключай skills из `C:\Users\User\.agents\skills` только по необходимости:

| Ситуация | Skill |
|---|---|
| Новый feature или изменение поведения | `brainstorming` |
| Планирование | `writing-plans` |
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
| Code review | `requesting-code-review` и `receiving-code-review` |
| Worktree isolation | `using-git-worktrees` |
| Работа с PDF | `pdf` |

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
