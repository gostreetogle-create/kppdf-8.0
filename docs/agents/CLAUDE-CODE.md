# Claude Code — шпаргалка kppdf (не startup)

> Не читать в начале каждой сессии. Контракт исполнителя — корневой
> `CLAUDE.md` → `GEMINI.md`. Сюда — только CLI/MCP гигиена.
> Источник отбора: vc.ru «50 фишек Claude Code» (2026) + peer MCP;
> в репо **не** копировать все 50.

## Два входа

| Как зовут | Что делать | Что нельзя |
|-----------|------------|------------|
| **MCP `claude_code` из Cursor** | Сложное / идея / архитектура / 152-ФЗ **до TZ**. Промпт: `ANALYSIS ONLY`, не менять product files. | Grind, claim, archive, deploy |
| **Терминал Claude** | Одна TZ, `agent_id: claude`, Claim до кода. | Рутина Freebuff; `--dangerously-skip-permissions` |

Сайт/статья для выжимки — **MCP Perplexity**, выводы пишет Cursor.
Cursor: `.cursor/mcp.json` → `url` `https://api.perplexity.ai/mcp` +
`Authorization: Bearer ${env:PERPLEXITY_API_KEY}` (ключ в User env, не в файле).
Claude CLI: root `.mcp.json` (npx). Один ключ на оба клиента.
Нет сервера в чате → Settings → Tools & MCP, полный перезапуск Cursor.

## Тебе (PO) в терминале Claude

- Между TZ: `/clear`. Два круга «не то» → `/clear` и новый промпт, не добивать в той же свалке.
- Баг: вставь лог/стек, не пересказывай. Файл ткни `@path`.
- Неясно «с какого боку» → Plan Mode (`Shift+Tab`), потом Claim и код. Plan ≠ пропуск TZ.
- `/model` Sonnet по умолчанию; Opus / `ultrathink` — только развилка.
- `Esc` — стоп, контекст жив. Чекпоинты не откатывают bash/Mongo.
- `/compact` с подсказкой: оставь TASK-ID, conflict keys, статус тестов.

## Cursor → MCP Claude (промпт)

Коротко: вопрос, 2–5 путей файлов, `ANALYSIS ONLY`, «файлы не писать».
Не тащить весь `PO-DIARY`. После ответа — TZ, не «ещё подумать вслух».

## Запрещено у нас (из тех же 50 фишек)

- `claude --dangerously-skip-permissions` и алиас `cc` с этим флагом
- `claude --worktree` — worktree только `.worktrees/<TASK-ID>` по `docs/how-to-connect-ai.md`
- experimental agent teams / несколько Claude на **тех же** conflict keys
- зоопарк MCP (GitHub Issues, Slack, Figma, Postgres, Notion) и `mattpocock-skills`
- MCP write в production / ключи в репо
- массовый `claude -p` по сотне файлов без Claim
- `/loop` на деплой; wipe; кати без слова PO

## Не раздувать CLAUDE.md

Правило в файл — только если Claude **без него** ошибается.
Детали — `@docs/agents/CLAUDE-CODE.md` и skills, не копипаста в корень.
Новая устойчивая договорённость → `PO-DIARY.md` §5 / `PO-CANON.md`, не `/init`.

## Как читать внешний гайд (вердикт 2026-08-22)

Берём дух: контракт проекта, мало MCP, доказательства вместо «готово», skills/hooks
там, где модель может забыть. Не берём универсальный шаблон.

| Совет гайда | У нас |
|-------------|--------|
| Живой CLAUDE.md + команды + DoD | `CLAUDE.md` тонкий → **`GEMINI.md`**. Старт: `./start.sh` / `node start.mjs`, не `pnpm dev`. |
| Не «готово» без вывода команд | Уже DoD + checklist + `Executor report (auto)`. Повторять в промпте TZ. |
| MCP GitHub / Figma / Postgres / Notion / Sentry | **Нет.** GitHub = хранилище без Issues. БД = Mongo, не Postgres. Allowlist: `claude_code` (peer) + Perplexity (статья). Playwright — локальный скрипт/Jest, не новый MCP «на всякий случай». |
| MCP read-only, без skip-permissions | Да. Секреты не в `.claude/settings.json` / git. |
| `.claude/skills/` api-change, db-migration, release… | Уже `.agents/skills/` + `kppdf-executor-loop` / `tdd` / `systematic-debugging`. Не плодить вторую пачку. |
| Hooks линтер/секреты | Husky pre-commit / pre-push. Claude PostToolUse не дублировать. |
| Исследуй → план → согласуй → код | **TZ + Claim.** Plan Mode только если TZ дырявый. Peer MCP = план до TZ, не код. |
| git worktree на каждую фичу | Только `.worktrees/<TASK-ID>` Isolated. Continuous = `D:\kppdf-8.0` main. Не `claude --worktree`. |
| Параллель | 2 Freebuff + 1 Claude, разные conflict keys. Не схема+lockfile+shared UI разом. |
