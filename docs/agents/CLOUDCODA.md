# Cloudcoda / Claude Code — kppdf-8.0

> Onboarding для облачного или локального Claude Code на этом репозитории.
> Контракт исполнителя: `CLAUDE.md` → `GEMINI.md`. CLI-гигиена: `CLAUDE-CODE.md`.
> Не дублируй `.claude/rules/` или `.claude/skills/` — SoT = `.agents/skills/`.

## 1. Старт сессии (обязательный порядок)

1. `docs/how-to-connect-ai.md` — continuous vs isolated worktree, git sync, запреты.
2. `GEMINI.md` — DoD, claim, gates, archive, git-policy.
3. `docs/PROJECT-MEMORY.md` → `docs/PO-CANON.md`.
4. `docs/agent-checklists/_NOW.md` + `tasks/_active/` — conflict keys.
5. Своя TZ + checklist с Claim slot (`agent_id: claude`, `claimed_at` ISO).
6. `.agents/skills/kppdf-project/SKILL.md` — роутинг роли.
7. `.agents/skills/kppdf-context-preflight/SKILL.md` — preflight с конкретными путями.
8. Executor: `.agents/skills/kppdf-executor-loop/SKILL.md`.

**Workspace:** continuous executor = `D:\kppdf-8.0` на `main`.
Isolated = `.worktrees/<TASK-ID>` на task branch. `.freebuff/worktrees/*` запрещён.

## 2. Локальный запуск (не `pnpm dev`)

| Команда | Назначение |
|---------|------------|
| `pnpm start` / `pnpm check:start` | Pre-flight only (безопасно, не поднимает сервисы) |
| `pnpm start:all` | Mongo + backend :3000 + frontend :4200 + browser |
| `pnpm start:no-browser` | Полный запуск без браузера |
| `pnpm stop:start` | Остановить backend + frontend |
| `node start.mjs --help` | Все флаги `start.mjs` |

Требования: Node 20+, pnpm 8+, Docker (Mongo replica set). Секреты — только в локальном `.env` (не в git).

## 3. Gates (исполнитель)

```bash
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit && pnpm test && pnpm lint
cd backend  && pnpm exec tsc -p tsconfig.build.json --noEmit && pnpm test && pnpm lint
pnpm architecture:check
```

Husky уже покрывает hot-path:

- **pre-commit:** `lint-staged` + `supply-gate.mjs`
- **pre-push:** typecheck backend + frontend

Не добавляй Claude PostToolUse hooks — дублируют Husky.

## 4. MCP (allowlist)

| Клиент | Файл | Разрешено |
|--------|------|-----------|
| Claude CLI | `.mcp.json` | Perplexity (`PERPLEXITY_API_KEY` из env) |
| Cursor | `.cursor/mcp.json` | `claude_code` peer (analysis-only из Cursor) |

**Запрещено подключать:** GitHub Issues, Slack, Figma, Notion, Postgres, production MongoDB, Synology SSH/deploy MCP, `mattpocock-skills`.

`PERPLEXITY_API_KEY` — только в user environment. Не писать в git, `.mcp.json`, docs, отчёты.

## 5. Skills (repo-native)

SoT: `.agents/skills/*/SKILL.md` (12 skills). Ключевые:

| Skill | Когда |
|-------|-------|
| `kppdf-project` | Роутинг ролей на любой задаче |
| `kppdf-context-preflight` | Preflight до TZ/кода |
| `kppdf-executor-loop` | Claim → gates → archive (executor) |
| `tz-authoring` | Cursor: написание TZ (не код) |
| `tdd` / `systematic-debugging` | Тесты / диагностика |

Trigger-eval наборы (опционально): `.agents/skills/kppdf-executor-loop/evals/`, `tz-authoring/evals/`.
`run_loop.py` из skill-creator — только из **отдельного** Claude Code терминала (`--num-workers 1`, `PYTHONUTF8=1` на Windows).

**Не создавать:** `.claude/skills/`, `.claude/rules/` — `.claude/` в `.gitignore`, намеренно не SoT.

## 6. Запреты (жёстко)

- `mattpocock-skills`, `/setup-matt-pocock-skills`
- `/init` если перезапишет `CLAUDE.md` шаблоном `pnpm dev`
- `--dangerously-skip-permissions`
- `claude --worktree` (worktree только `.worktrees/<TASK-ID>` вручную)
- deploy / wipe / seed / prod Mongo без явной команды PO
- `git add -A` / `git add .` — stage только свои пути
- Чужой незакоммиченный WIP не трогать

## 7. Проверка конфигурации (read-only, без commit)

```bash
git status --short
git branch --show-current
git worktree list --porcelain
node -e "JSON.parse(require('fs').readFileSync('.mcp.json','utf8')); console.log('.mcp.json OK')"
pnpm check:start
```

Ожидания:

- branch `main` в continuous contour (или task branch в isolated)
- `.mcp.json` — только Perplexity с `${PERPLEXITY_API_KEY}`
- `pnpm check:start` exit 0 (Node/pnpm/Docker preflight)
- `_NOW.md` ACTIVE пуст или содержит чужой TZ → не редактировать чужие conflict keys

## 8. Два режима Claude

| Режим | Где | Действие |
|-------|-----|----------|
| **Peer** | Cursor → MCP `claude_code` | Analysis-only до TZ; не product files |
| **Executor** | Claude Code CLI | `GEMINI.md` + claim + код + gates + archive |

Рутинные волны TZ — Freebuff (`tasks/PROMPT-FREEBUFF-*.md`), не Claude-токены.

## 9. Секреты и production

- Не читать/выводить `.env`, credentials, API keys.
- Не подключать Cloudcoda к production MongoDB, Synology, deploy scripts.
- Wipe/опасные ops — только по `docs/ops/DANGEROUS-OPS.md` + явная русская фраза PO.

## 10. Карта документов

| Вопрос | Файл |
|--------|------|
| Git commit/push | `docs/GIT-POLICY.md` |
| Skills vs Pocock | `docs/agents/SKILLS-MAP.md` |
| Claude CLI tips | `docs/agents/CLAUDE-CODE.md` |
| LM Studio helper | `docs/agents/LM-STUDIO-AGENT.md` |
| Очередь агентов | `docs/agent-checklists/_NOW.md` |
