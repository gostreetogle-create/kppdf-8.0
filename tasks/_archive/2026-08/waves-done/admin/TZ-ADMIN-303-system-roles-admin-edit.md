═══════════════════════════════════════════════════════════════
TZ-ADMIN-303: Админ правит системные роли (permissions/pages), DELETE запрещён
═══════════════════════════════════════════════════════════════

PAGES: /admin/roles  
PAGE_DOCS: docs/pages/admin-roles.page.md (или существующий admin roles page.md)

РОЛЬ АГЕНТА: fullstack (тонкий BE guard + FE roles-admin)  
ЗАВИСИМОСТИ: нет; WIP уже в working tree на `main`  
LAYER: 2  
CONFLICT KEYS:
- backend/src/common/guards/system-role.guard.ts
- backend/src/common/guards/system-role.guard.spec.ts
- backend/src/modules/admin/roles-admin.controller.ts
- frontend/src/app/pages/admin/roles-admin.page.ts
- frontend/src/app/pages/admin/roles-admin.page.spec.ts
- docs/pages/admin-roles.page.md (если есть; иначе создай/обнови канонический page.md ролей)

Проверено: PO-DIARY 2026-08-09 «Админ правит системные роли»; dirty WIP на `main`
(system-role.guard* + roles-admin*); API `/admin/roles` уже `@Roles('admin')`.

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. Раньше `SystemRoleGuard` блокировал любой PATCH/DELETE на `isSystem: true`
   → в UI у системных ролей только «Просмотр».
2. PO: системная ≠ read-only для **админа сайта**. Админ может менять
   permissions/pages у Administrator / director / manager / user (системных).
3. DELETE системной роли — **всегда запрещён**.
4. Escalation (`isSystem: true` на не-системной) — по-прежнему запрещён.
5. Часть кода уже в незакоммиченном WIP — **добей, не переписывай с нуля**.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

1. **BE:** PATCH системной роли разрешён только site-admin
   (`role.name === 'admin'` / `*` / effective `role:admin` — как в WIP-контракте).
   DELETE системной — 403 `SYSTEM_ROLE_FROZEN` для всех.
2. **FE:** у системной роли при `role:write` — «Редактировать» (не только «Просмотр»);
   Delete для системных скрыт/disabled; RU toast при попытке удаления.
3. Тесты: guard spec + roles-admin page spec покрывают admin PATCH ok / non-admin
   frozen / DELETE frozen.
4. Page doc: одна секция политики системных ролей (RU).
5. Gates зоны → self-verify (логин admin → Роли → Редактировать системную → сохранить
   permissions/pages) → archive → commit+push **только** CONFLICT KEYS + checklist/archive/progress.

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- WAVE-KP-USABLE / proposals / quotation / document-template / table-template
- Users-admin (кроме косвенно через роли)
- Desktop/MCP, deploy
- Чужой freebuff worktree КП-агента

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Админ видит «Редактировать» на системной роли и успешно PATCH permissions/pages.
2. Удалить системную роль нельзя (UI + API 403).
3. Не-админ не может PATCH системную (если такой актор возможен в тестах/guards).
4. tsc FE+BE зоны PASS; focused Jest PASS; RU UI.
5. Archive + lock + push; WIP больше не висит грязным на этих файлах.

PARALLEL-SAFE: да, пока KP-агент не трогает admin/* / system-role.guard*.
Workspace: только канон `D:\kppdf-8.0` (не freebuff KP worktree).
