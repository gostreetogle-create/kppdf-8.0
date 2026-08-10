═══════════════════════════════════════════════════════════════
TZD-29: Manager import todos (finish list)
═══════════════════════════════════════════════════════════════

STATUS: READY
WAVE: WAVE-DESKTOP-BULK-IMPORT.md (#7, last)
DEPENDS ON: TZD-23 DONE; лучше после TZD-28 (template drafts)
LAYER: 2
CHECKLIST: docs/agent-checklists/TZD-29.md
AUDIT: docs/audits/2026-08-08-desktop-bulk-import-vision-audit.md
PAGES: /import-todos (NEW thin) · PAGE_DOCS: создать docs/pages/import-todos.page.md

РОЛЬ: Backend thin module + MCP + минимальный Angular list (не god-component).

CONFLICT KEYS:
backend/src/modules/import-todo/**;
backend/src/app.module.ts;
desktop/mcp/src/import-todo-tools.ts;
desktop/mcp/src/tools.ts;
frontend/src/app/**/import-todos/**;
frontend/src/app/app.routes.ts;
docs/pages/import-todos.page.md;
docs/pages/PAGE-TZ-INDEX.md;
desktop/docs/MCP.md;

Проверено: notification center Phase 1 = local toast ring only
(docs/pages/ui-notification-center.md) — **не** расширять bell в этом TZ;
отдельная thin page надёжнее.

---

## ИСХОДНОЕ

После импорта «что доделать» живёт только в чате Cursor — менеджер без агента не видит.

---

## ЧТО ДЕЛАТЬ

### 1. Backend `import_todos`

Schema: title, body?, href?, importTaskId?, templateId?, organizationId?,
createdByUserId, status: open|done, createdAt.

REST:
- POST /api/import-todos
- GET /api/import-todos?status=
- PATCH /api/import-todos/:id { status }

Org/RBAC как import-tasks.

### 2. MCP

- `kppdf_import_todo_create`, `kppdf_import_todo_list`, `kppdf_import_todo_set_status`

Protocol: после apply_plan если doubt>0 → todo «Проверить сомнительные строки»;
после TZD-28 draft → todo «Доделать шаблон {name}» + href `/doc-constructor/...`.

### 3. Frontend thin page

- Route `/import-todos` (меню: Админ или Документы — одна ссылка, русский лейбл
  «Задачи импорта»).
- Список open/done, кнопка «Готово», ссылка href если есть.
- PiPageChrome; без тяжёлого дизайна.

### 4. НЕ

Gantt/CRM; wiring bell Phase2 mail; Orders; silent auto-close без PATCH.

---

## AC

1. POST todo → GET list видит open.  
2. MCP create/list работают.  
3. Страница `/import-todos` показывает open; PATCH done убирает из open-фильтра.  
4. PAGE-TZ-INDEX + page.md.  
5. Gates:

```
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
cd backend && pnpm test -- import-todo
cd desktop/mcp && pnpm test
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
```

6. Archive волны: обновить WAVE file status DONE в checkpoint; park README.

known_limitation: нет email/push; менеджер смотрит страницу или Desktop.
