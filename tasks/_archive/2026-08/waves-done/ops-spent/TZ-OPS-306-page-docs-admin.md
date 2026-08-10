# TZ-OPS-306: page.md — админ пользователи + роли

PAGES: /admin/users ; /admin/roles  
PAGE_DOCS: admin-users.page.md ; admin-roles.page.md  
WAVE: `tasks/_backlog/ops/WAVE-PAGE-DOCS-GAPS.md`

РОЛЬ АГЕНТА: docs-only  
ЗАВИСИМОСТИ: TZ-OPS-305 DONE  
LAYER: 4  
CONFLICT KEYS: docs/pages/admin-users.page.md; docs/pages/admin-roles.page.md; docs/pages/README.md; docs/pages/PAGE-TZ-INDEX.md; docs/DOMAIN-MAP.md; docs/agent-checklists/TZ-OPS-306.md; progress.md; docs/agent-checklists/_active-map.md

Проверено: `app.routes.ts` `admin/users` → `users-admin.page.ts`, `admin/roles` → `roles-admin.page.ts`; `docs/RBAC-CONTRACT.md`; DOMAIN-MAP: User ≠ Worker; `/admin` redirect → users.

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ
═══════════════════════════════════════════════════════════════

1. Админ-реестр пользователей и ролей живёт в UI; page.md нет.
2. Путать нельзя: **User** (логин) ≠ **Worker** (People / цех).

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

1. `docs/pages/admin-users.page.md` (≤120): route, chips ADMIN, API `/admin/users` (+ activate/deactivate/reset-password), dialogs, pagination PAGE_SIZE, capabilities gate, TZ refs (ADMIN-*).
2. `docs/pages/admin-roles.page.md` (≤120): API `/admin/roles`, RoleFormDialog, system vs custom roles, permission labels RU, связь с формой пользователя.
3. README + PAGE-TZ-INDEX; DOMAIN-MAP gaps users/roles → yes.
4. В каждом page.md явный блок «Не путать: User ≠ Worker; admin FE ≠ BE admin module только как API».

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- Product code FE/BE/desktop
- `people.page.md` / Workers schema
- permissions.constants.ts (READ ok)
- deploy; SALES-*; DOC-* FE

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Оба page.md + индекс/ DOMAIN-MAP обновлены.
2. Нет product paths в diff.
3. Executor report (auto) → archive → commit+push.

Verification:
```
Test-Path docs/pages/admin-users.page.md, docs/pages/admin-roles.page.md
git diff --name-only
```
