# Промпт — TZ-DOC-343

Агент в конструкторе справа соберёт **свойства шаблона** как при создании: название, категория, формат, ориентация (+ уже существующий фон). Всё сохраняется; ориентацию починит и на бэке (сейчас PATCH update её игнорирует).

```text
CLAIM первым (до кода):
1) Get-Location + git rev-parse → D:\kppdf-8.0
2) tasks/_active/TZ-DOC-343.md + checklist docs/agent-checklists/TZ-DOC-343.md
3) Status CLAIMED; Claim slot: agent_id + claimed_at (ISO) + workspace
4) _active-map + чужие _active keys → конфликт = STOP
   (не трогать DOC-342 upload keys / SALES-317 proposal-create)
5) Team Room claim best-effort

Затем: прочитай GEMINI.md + docs/AI-AGENT-GUIDE.md + docs/PO-DIARY.md §1–§4
+ tasks/_backlog/TZ-DOC-343-builder-editable-template-name.md
и выполни (scope = create-parity свойства, не только name).

Суть:
- BE: document-template.service update() пишет orientation
- FE Mode B: секции Основные (name+category) / Страница (A3–A5, orientation, pageNumbering) / Фон (как сейчас)
- category из DocumentTemplateCategoriesService; emit templateUpdate; empty name reject
- jest builder-inspector + tsc FE/BE; docs/pages/builder.page.md

Gates:
  cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
  cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
  cd frontend && pnpm test -- --testPathPattern=builder-inspector

Archive после Cursor/PO PASS + ## Executor report (auto).
```
