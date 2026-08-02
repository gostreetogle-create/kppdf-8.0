═══════════════════════════════════════════════════════════════
TZ-ACCESS-301: Page-ACL — каталог разделов + 4 роли (seed)
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Backend + contract (RBAC lite)
ЗАВИСИМОСТИ: существующий RBAC-CONTRACT (не ломать fine keys; добавить page-слой)
LAYER: 4
PAGES: /admin/users ; /admin/roles (контракт)
PAGE_DOCS: —

CONFLICT KEYS:
backend/src/common/seed/permissions.constants.ts;
backend/src/common/contracts/rbac-contract.ts;
docs/RBAC-CONTRACT.md;
docs/product-vision-lite.md;
docs/agent-checklists/TZ-ACCESS-301.md

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

Сейчас permissions = `section:action` (много ключей). Nav почти без
capabilities (кроме admin). Vision: Директор выдаёт **страницы**, не
кнопки. Нужен тонкий слой `page:*` или явный список page-keys =
пункты меню из app-layout.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ (не раздувать)
═══════════════════════════════════════════════════════════════

ШАГ 1 — Зафиксировать каталог PAGE_KEYS (1:1 с nav items), напр.:
  materials, products, modules, work-types, people, organizations,
  contracts, orders, dictionaries, categories, color-references,
  doc-template-categories, doc-builder, doc-templates, doc-texts,
  doc-tables, doc-documents, inventory, storage-items, stock-movements,
  admin-users, admin-roles.
ШАГ 2 — Seed ролей: Admin, Director, Manager, Worker с default pages[]
  (Worker: минимум; Manager: sales+docs+catalog read; Director: почти всё
  кроме ломки системы; Admin: + admin-*).
ШАГ 3 — Модель хранения: либо `role.pages: string[]`, либо user override
  `user.pageAccess: string[]` (Director правит user). Одно поле-массив —
  достаточно. Документировать в RBAC-CONTRACT § Page ACL (коротко).
ШАГ 4 — API: GET эффективного списка pages для /auth/me (чтобы фронт
  фильтровал nav). Не строить матрицу на каждую кнопку.
ШАГ 5 — Executor report (auto).

НЕ: переписывать все @Permissions на контроллерах в этом TZ.
НЕ: UI галочек (это ACCESS-302).
НЕ: бухгалтерия / finance pages.

AC: seed 4 ролей; /auth/me (или аналог) отдаёт pages[]; docs обновлены;
  tsc+jest targeted; Executor report.
ПРОМПТ: GEMINI.md + tasks/TZ-ACCESS-301-page-acl-catalog.md.
Checklist docs/agent-checklists/TZ-ACCESS-301.md. Push нет.
