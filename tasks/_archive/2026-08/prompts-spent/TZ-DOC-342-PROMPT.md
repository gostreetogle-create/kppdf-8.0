# Промпт — TZ-DOC-342

Агент починит 500 на загрузке фона шаблона: если файл не пришёл в multipart, API вернёт понятную **400**, а не «Internal server error». Валидный PNG/JPEG/WebP не ломает.

```text
CLAIM первым (до кода):
1) Get-Location + git rev-parse → D:\kppdf-8.0
2) tasks/_active/TZ-DOC-342.md + checklist docs/agent-checklists/TZ-DOC-342.md
3) Status CLAIMED; Claim slot: agent_id + claimed_at (ISO) + workspace
4) _active-map + чужие _active keys → конфликт = STOP
5) Team Room claim best-effort

Затем: прочитай GEMINI.md + docs/AI-AGENT-GUIDE.md
+ tasks/_backlog/TZ-DOC-342-upload-background-null-file-400.md
и выполни.

Суть: document-template upload-background (+ template-block uploadImage) —
if (!file) throw BadRequestException RU; e2e missing-file → 400; tsc PASS.
Не менять MIME/5MB/cap=5/FE (без нового факта).

Gates:
  cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
  cd backend && pnpm test:e2e -- test/e2e/document-templates-upload-background.e2e-spec.ts

Archive после Cursor/PO PASS + ## Executor report (auto).
```
