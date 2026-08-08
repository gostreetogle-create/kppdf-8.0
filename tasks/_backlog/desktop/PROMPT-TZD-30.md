# Промпт агенту — TZD-30 (копируй целиком)

```
Ты исполнитель kppdf-8.0. SoT: D:\kppdf-8.0 на ветке main.
Прочитай целиком:
- GEMINI.md
- OrchestratorKit/AGENTS.md
- docs/PO-DIARY.md §1–§4
- tasks/_backlog/desktop/WAVE-DESKTOP-DOC-TEXTS.md
- tasks/_backlog/desktop/TZD-30-text-block-mcp-drafts.md
- docs/agent-checklists/TZD-30.md
- Эталон паттерна: desktop/mcp/src/doc-tools.ts (TZD-28) + import-todo tools (TZD-29)
- Контракт TextBlock: backend/src/modules/text-block/text-block.schema.ts
  (есть tags, isActive, slug; НЕТ notes — не слать notes → будет 400)

ЦЕЛЬ ДЛЯ МЕНЕДЖЕРА (простыми словами):
Агент Desktop через MCP кладёт в библиотеку текстов готовый черновик
по нужной полочке (категории). Черновик неактивен, пока менеджер не проверит.
Менеджер открывает задачу со ссылкой и включает «Активен». Потом сам
кладёт блок на холст шаблона. Это НЕ автосборка КП и НЕ загрузка печатей/фонов.

КАНОН:
- «Папка» = TextBlockCategory в БД.
- Если категории нет — MCP создаёт её (tool category_create), не сваливает в «Общее».
- create_draft: isActive=false; tags включает ai-draft; имя «Черновик ИИ — …»;
  обязательны name + categoryId + content (или columns).
- Перед create — list в категории, не плодить дубли; 409 → понятная ошибка, без overwrite.
- После create — todo с href=/doc-constructor/texts?editId=<id>
  (НЕ templateId). Ответ tool: textBlockId + todoId|todoError.
- Tool description: сохраняет текст из источника агента; не выдумывает юр/цены/гарантию.

КОД:
- Канон разработки: desktop/mcp/ (новые text-block-tools.ts или расширение doc-tools — на твой выбор, но зарегистрируй в tools.ts).
- desktop/mcp-runtime = installer staging, НЕ править как основную работу; sync = packaging later.
- FE texts/builder НЕ редизайнить (chips Документов уже починены отдельно).
- Organization vault / photos / layout-AI — BAN.

ЦИКЛ:
claim TZD-30 → код → gates из TZ (desktop/mcp test + tsc) → archive
tasks/_archive/2026-08/TZD-30.done.md → checklist DONE → progress → commit+push main.
Без стопов «поехали». Deploy запрещён без команды PO.
Чужой dirty WIP вне CONFLICT KEYS не коммитить.

СТАРТ СЕЙЧАС: claim и выполняй TZD-30 до archive+push.
```
