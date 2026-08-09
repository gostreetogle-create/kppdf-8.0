# Промпт — TZ-DOC-343

Агент сделает в конструкторе шаблона редактируемое **Название** (сейчас оно только текстом в инспекторе). API уже умеет PATCH name.

```text
CLAIM первым (до кода):
1) Get-Location + git rev-parse → D:\kppdf-8.0
2) tasks/_active/TZ-DOC-343.md + checklist docs/agent-checklists/TZ-DOC-343.md
3) Status CLAIMED; Claim slot: agent_id + claimed_at (ISO) + workspace
4) _active-map + чужие _active keys → конфликт = STOP (не трогать DOC-342 backend keys / SALES-317)
5) Team Room claim best-effort

Затем: прочитай GEMINI.md + docs/AI-AGENT-GUIDE.md
+ tasks/_backlog/TZ-DOC-343-builder-editable-template-name.md
и выполни.

Суть: builder-inspector Mode B — input «Название» вместо read-only hint;
commit blur/Enter → templateUpdate({ name }); empty reject; reuse onTemplateUpdate;
jest + tsc; docs/pages/builder.page.md one line.

Gates:
  cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
  cd frontend && pnpm test -- --testPathPattern=builder-inspector

Archive после Cursor/PO PASS + ## Executor report (auto).
```
