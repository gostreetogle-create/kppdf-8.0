# Как подключать ИИ-агента к kppdf-8.0

Короткая памятка — читай ПЕРВОЙ при старте любой сессии ИИ.

## Золотое правило

- Continuous executor работает в `D:\kppdf-8.0` на `main`.
- Explicit Cursor **Isolated** работает в `.worktrees/<TASK-ID>` на своей ветке,
  коммитит только её и не мержит в main без review.
- `.freebuff/worktrees/*` запрещён: временный/устаревший контур.
- Commit/push policy: `docs/GIT-POLICY.md`.

## Почему так происходит

Каждый чат/сессия Freebuff автоматически создаёт изолированный git worktree в `.freebuff/worktrees/<id>/` на своём коммите. Он почти всегда **отстаёт от main**. Работа там:
- не видна main и другим агентам;
- теряется при закрытии сессии;
- вызывает путаницу base/HEAD (агент «не видит» свежие коммиты и чужие правки).

## Ритуал старта (30 секунд)

```bash
cd D:/kppdf-8.0
git fetch origin && git merge origin/main   # или: git pull
git log --oneline -1                        # сверить HEAD
git status --short                          # посмотреть чужие незакоммиченные правки
```

1. Открывай continuous executor из `D:\kppdf-8.0`; isolated — только через
   явную опцию Cursor и именованный `.worktrees/<TASK-ID>`.
2. Синхронизируйся с main перед началом работы (команды выше).
3. Если в дереве есть чужие незакоммиченные правки — не трогай их; stage только
   свои пути поимённо.
4. main может уезжать вперёд, пока ты работаешь — перед коммитом повтори `git fetch origin && git merge origin/main`.
5. **До кода:** CLAIM по `docs/agent-checklists/_TEMPLATE.md` —
   `tasks/_active/<TASK-ID>.md` + checklist Claim slot (`agent_id`, `claimed_at` ISO).
   Доска: `docs/agent-checklists/_NOW.md`. Без CLAIM — не кодить.
6. **После CLAIM** прочитай `docs/PROJECT-MEMORY.md` — тонкий склад «где правда / что не потерять»
   (до ARCHITECTURE и page.md).

## Запреты

- ❌ НЕ создавай самодельный worktree вне explicit Cursor Isolated flow (`claude --worktree` тоже нельзя).
- ❌ НЕ работай в `.freebuff/worktrees/*`.
- ❌ НЕ нарушай `docs/GIT-POLICY.md`.
- ❌ НЕ коммить чужие незакоммиченные файлы и не используй `git add -A` / `git add .`.

## Проверь себя

- `pwd` содержит `.freebuff/worktrees` → STOP, переоткрой сессию.
- В main-контуре branch должна быть `main`; в explicit Isolated — именованная task branch.
- `git log --oneline -1` старше, чем ожидаемый HEAD → `git fetch origin && git merge origin/main`.

## Локальный LM Studio (опционально)

Draft-helper на той же машине (не Cursor cloud). Доверие: **LIMITED_HELPER**.

```powershell
# LM Studio → Developer Running, model qwen2.5-coder-14b, port 1234
pnpm lmstudio:check
pnpm lmstudio -- --task "Explain pageKey in 3 bullets" --with frontend/src/app/core/capabilities/capability-route.guard.ts
```

Канон: `docs/agents/LM-STUDIO-AGENT.md`.
