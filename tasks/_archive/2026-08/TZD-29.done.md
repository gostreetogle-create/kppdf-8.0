═══════════════════════════════════════════════════════════════
TZD-29: Manager import todos (finish list) — DONE
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08
closed_by: buffy-desktop-ex (Freebuff desktop executor, wave #7, last)
acceptance_status: PASS (all AC + gates green)
verification:
  - backend typecheck: PASS
  - backend pnpm test -- import-todo: 3/3 PASS
  - desktop/mcp pnpm test: 62/62 PASS (incl. 3 new import-todo tests)
  - frontend pnpm exec tsc -p tsconfig.app.json --noEmit: PASS
checklist: docs/agent-checklists/TZD-29.md
lock: .mimocode/locks/TZD-29-manager-import-todos.lock
source: tasks/_backlog/desktop/TZD-29-manager-import-todos.md
wave: tasks/_backlog/desktop/WAVE-DESKTOP-BULK-IMPORT.md (#7 — wave final)

---

## Summary

- **Backend `backend/src/modules/import-todo/**`** (NEW): schema `import_todos`
  (title, body?, href?, importTaskId?, templateId?, organizationId?,
  createdByUserId, status open|done, timestamps), REST:
  POST `/api/import-todos`, GET `/api/import-todos?status=` (items+total+page+limit),
  PATCH `/api/import-todos/:id { status }`. RBAC `admin|manager`, org-scoped
  (как import-tasks). Зарегистрирован в `app.module.ts`. Seed pages
  (`permissions.constants.ts`, `admin.seed.ts`): `import-todos` для
  admin + manager.
- **MCP `desktop/mcp/src/import-todo-tools.ts`** (NEW): `kppdf_import_todo_create`,
  `kppdf_import_todo_list`, `kppdf_import_todo_set_status` — зарегистрированы
  в `tools.ts`. Protocol: после apply_plan если doubt>0 → todo «Проверить
  сомнительные строки»; после TZD-28 draft → todo «Доделать шаблон {name}»
  + href `/doc-constructor/...`.
- **Frontend thin page `frontend/src/app/pages/import-todos/import-todos.page.ts`**
  (NEW): route `/import-todos` (nav Документы, лейбл «Задачи импорта»),
  PiGroupWorkspace chrome, фильтры Все/Открытые/Выполненные, кнопка «Готово»
  (PATCH done), href link, DatePipe. Route + nav + dense list — всё по канону.
- **Docs**: `docs/pages/import-todos.page.md` (NEW) + `PAGE-TZ-INDEX.md` row;
  MCP.md import-todo protocol; FEATURE-INTEGRATION-CHECKLIST §F.

## Acceptance (AC → результат)

1. POST todo → GET list видит open ✅ (BE spec: create → open; list filter)
2. MCP create/list работают ✅ (import-todo-tools.test.ts 3 tests)
3. Страница `/import-todos` показывает open; PATCH done убирает из open-фильтра ✅
   (FE tsc; BE spec patchStatus; фильтр клиентский)
4. PAGE-TZ-INDEX + page.md ✅
5. Gates ✅ (перечислены в verification)
6. Archive волны ✅ — WAVE file status DONE + checkpoint + park README

## Out of scope (known_limitation)

- Нет email/push; менеджер смотрит страницу или Desktop.
- Notification bell Phase 1 остаётся local toast ring (не расширялся).
- Deploy НЕ выполнялся (только по команде PO).

## Protects

Орг-scope как import-tasks; никакого silent auto-close — PATCH только
по явному действию; «Готово» — только менеджер в вебе или явный вызов MCP.
