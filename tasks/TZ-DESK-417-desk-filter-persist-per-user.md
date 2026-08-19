# TZ-DESK-417: Стол — фильтр статусов: default «все» + запоминание на пользователя

PAGES: /desk
PAGE_DOCS: manager-desk.page.md (если есть) / desk section in PAGE-TZ-INDEX

РОЛЬ: frontend
LAYER: 3
CONFLICT KEYS: frontend/src/app/pages/desk/manager-desk.page.ts; frontend/src/app/pages/desk/manager-desk.page.spec.ts

Проверено: default `ACTIVE_STATUSES` (3 галочки); persist только в URL `?status=`. PO хочет: default **все** статусы; выбор сохраняется **per user** после F5.

## ЧТО ДЕЛАТЬ

1. Default без `?status=` → `ALL_STATUSES` (не ACTIVE).
2. `localStorage` key: `kppdf.desk.statusFilter.v1:${userId}` где `userId` из `AuthService.user()?.id`; fallback `anonymous`.
3. При старте: если нет `?status=` в URL — загрузить Set из localStorage (валидные статусы); иначе URL wins (deep-link).
4. При `toggleStatus` / `setStatusPreset` — писать в localStorage + обновлять URL как сейчас.
5. Spec: default all checked; persist survives remount (mock localStorage).

## НЕ

- server-side prefs API (только localStorage v1)
