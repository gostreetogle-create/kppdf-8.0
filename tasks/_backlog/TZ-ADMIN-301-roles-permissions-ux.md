═══════════════════════════════════════════════════════════════
TZ-ADMIN-301: Роли — понятное редактирование прав + audit pageKeys
═══════════════════════════════════════════════════════════════

> READY · PO: список полей/прав не кликабелен; default Админ  
> Canon: audit chrome-nav-admin-smell; SystemRole frozen = by design

STATUS: READY

РОЛЬ: Frontend (+ BE только если не хватает списка permissions catalog)

LAYER: 3

PAGES: `/admin/roles`
PAGE_DOCS: audit; RBAC-CONTRACT snippet if needed

CONFLICT KEYS:
frontend/src/app/pages/admin/roles-admin.page.ts;
frontend/src/app/pages/admin/role-form-dialog.component.ts;
frontend/src/app/pages/admin/role-form-dialog.component.spec.ts;
frontend/src/app/pages/admin/permission-labels.ru.ts;
backend/src/common/seed/permissions.constants.ts (только если missing pageKeys);
docs/agent-checklists/TZ-ADMIN-301.md;
docs/agent-checklists/_active-map.md;

---

## Domain

| Факт | UX |
|------|-----|
| `isSystem: true` (Администратор) | Нельзя менять права — **показать** баннер/бейдж «Системная · только чтение», не «мёртвые» галочки без объяснения |
| Кастомная роль | Edit → диалог с **матрицей/группами pageKey+capabilities** (уже частично есть — довести до очевидного) |
| Колонка permissions в таблице | Summary ок; клик по строке/edit открывает диалог — не inline-edit ячейки |

## ЧТО ДЕЛАТЬ

1. Таблица: для system — badge; row actions без Edit или Edit opens read-only view с текстом почему.  
2. Create/Edit кастомной: все актуальные pageKeys из NAV+stubs (`counterparties`, `design`, `supply`, `shipping`, `form-profiles`, …) присутствуют в picker; missing → добавить в seed constants + labels RU.  
3. Audit checklist в progress/docs: таблица pageKey nav vs permissions seed (в TZ acceptance).  
4. Tests dialog + frozen system.  

## НЕ

- Ломать SystemRoleGuard  
- Desktop pairing; compact nav (UX-301)  
- Deploy  

## AC

- [ ] PO на Администраторе видит почему нельзя править  
- [ ] Кастомная роль: можно включить/выключить новые разделы (Клиенты, Снабжение, …)  
- [ ] Seed/labels покрывают NAV pageKeys 2026-08-08  
- [ ] tsc + jest PASS; archive; push  
