═══════════════════════════════════════════════════════════════
TZ-ADMIN-302: Главный админ видит все галочки; системная роль read-only
═══════════════════════════════════════════════════════════════

> READY · PO: локальный главный админ = доступ ко всему; роль «Администратор»
> показывать все права **включёнными**, но нередактируемыми; остальные роли
> (Директор, Менеджер, кастомные) — полный edit главным админом.

STATUS: READY

РОЛЬ: Frontend (+ BE only if dialog needs “effective all pages” payload)

ЗАВИСИМОСТИ: TZ-ADMIN-301 DONE

LAYER: 3

PAGES: `/admin/roles`
CONFLICT KEYS:
frontend/src/app/pages/admin/roles-admin.page.ts;
frontend/src/app/pages/admin/role-form-dialog.component.ts;
frontend/src/app/pages/admin/role-form-dialog.component.spec.ts;
docs/agent-checklists/TZ-ADMIN-302.md;
docs/agent-checklists/_active-map.md;

---

## Канон

| Роль | UI |
|------|-----|
| Системная (`isSystem`, напр. Администратор) | Диалог «Смотреть»: **все** pageKeys + capabilities отмечены ✓, controls **disabled**; баннер «Системная · нельзя изменить (полный доступ)» |
| Несистемные | Create/Edit как в 301 — главный админ может менять любые галочки |

Главный админ в приложении уже bypass/full access — это не ломаем. UX: не оставлять пустую «только чтение» без галочек.

## ЧТО ДЕЛАТЬ

1. Read-only view system role: render full catalog of pages/caps with checked=true, disabled.  
2. Не слать PATCH по system (кнопок Save нет).  
3. Убедиться, что кастомные/директор/менеджер открываются на Edit у пользователя с `role:write` / admin.  
4. Jest: system dialog shows checked disabled; custom still editable.  
5. Короткая RU строка в banner.

## НЕ

- Снимать SystemRoleGuard / давать реальный edit system role  
- Nav layout (UX-305)  
- Deploy; stage чужой dirty WIP  

## AC

- [ ] Открыть Администратор → видно полный набор прав, все галочки on, нельзя снять  
- [ ] Директор/Менеджер/своя роль → Edit работает  
- [ ] tsc + jest admin PASS; archive; push  
