# Skills map — mattpocock → kppdf

> Источник: `docs/audits/2026-08-22-matt-pocock-skills-source.md` + [mattpocock/skills](https://github.com/mattpocock/skills).
> Берём **ритуалы**, не вторую операционку. Claude Code plugin / `/setup-matt-pocock-skills` — **не ставить**.

## Что уже есть у нас

| Pocock | У нас |
|--------|--------|
| grill-with-docs | TZ-AUTHORING + правило `planning-grilling.mdc` + `docs/CONTEXT.md` |
| CONTEXT.md | `docs/CONTEXT.md` (глоссарий) + `PO-CANON` + `PROJECT-MEMORY` |
| ADR | `docs/adr/README.md` (индекс), не новая пачка файлов |
| to-prd / to-spec | `tasks/TZ-*.md` |
| to-tickets / issues | `tasks/_active/` + `_NOW.md` (GitHub Issues нет) |
| tdd | skill `tdd` + `GEMINI.md` § Feedback; **исполнитель**, не Cursor |
| diagnosing-bugs | skill `systematic-debugging` + `debugging-diagnose.mdc` (TZ на фикс) |
| improve-codebase-architecture | `architecture-review.mdc` + Mode A review текстом |
| caveman / кратко | `PO-CANON` п.0 |
| implement | Freebuff / Gemini / Claude CLI по `GEMINI.md` |
| peer Claude | MCP `claude_code` из Cursor: архитектура, идеи, review; **не** grind |
| web article | MCP Perplexity (выжимка) → выводы Cursor; конфиг `.cursor/mcp.json` |

## Запрещено копировать

- Корневой `AGENTS.md` рядом с `GEMINI.md`
- `docs/prd/` и `docs/issues/`
- `alwaysApply` global rule поверх `cursor-architect.mdc`
- TDD-glob, который заставляет Cursor писать product-тесты
- Claude: `claude plugins install mattpocock-skills` и `/setup-matt-pocock-skills` (спросит GitHub/Linear)

## Что сделать вручную (PO)

После `git pull` **полный перезапуск Cursor** — подхватятся `.cursor/rules/*.mdc`.

**Не обязательно.** Если ответы в любом чате Cursor (не только этот репо) слишком длинные — User Rules → Add:

```text
Отвечай коротко по-русски. Сначала 1–3 действия для меня.
Не эссе. Не проси «продолжать?» внутри одной волны.
Неопределённую фичу не коди: сначала вопросы, потом TZ.
```

**Claude Code CLI:** ничего не ставить из Pocock. Контракт — корневой `CLAUDE.md`. В чате Claude можно сказать: «сначала grilling по CONTEXT.md, код не пиши».
