# TZ-UI-408: Админ-диалоги — токены шрифта, не 10px Mono

PAGES: /admin/devices
PAGE_DOCS: admin-devices.page.md
РОЛЬ АГЕНТА: Frontend UI Engineer
ЗАВИСИМОСТИ: Нет
LAYER: 3
CONFLICT KEYS: frontend/src/app/pages/admin/device-invite-dialog.component.ts; frontend/src/app/pages/admin/device-role-dialog.component.ts; frontend/src/app/pages/admin/owner-device-invite-dialog.component.ts; frontend/src/app/pages/admin/reset-password-dialog.component.ts; frontend/src/app/pages/admin/user-form-dialog.component.ts; frontend/src/app/pages/admin/role-form-dialog.component.ts

Проверено: аудит T-02 — `font-family: 'JetBrains Mono'` + `font-size: 10px` на `.field__label` (напр. device-invite-dialog ~157–162). Канон: micro 11, `var(--font-mono)`.

## ИСХОДНОЕ

Шесть админ-диалогов дублируют 10px mono вместо токенов. На light/dark 10px плохо читается.

## ЧТО ДЕЛАТЬ

ШАГ 1: Во всех шести: `'JetBrains Mono', monospace` → `var(--font-mono)`.

ШАГ 2: Лейблы `font-size: 10px` → `11px` (или `var(--text-micro)`, если переменная уже есть в styles). Input `13px` не уменьшать.

ШАГ 3: Не менять разметку полей, API, copy.

## ИЗМЕНЯТЬ

Только CONFLICT KEYS.

## НЕ ИЗМЕНЯТЬ

- `pi-dialog.component.ts` shell
- Auth/login, pairing desktop
- Deploy, RBAC logic

## КРИТЕРИИ ПРИЁМКИ

```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
rg -n "JetBrains Mono" frontend/src/app/pages/admin --glob "*.ts"
```

- `rg` по шести файлам: 0 совпадений `JetBrains Mono`
- Нет `font-size: 10px` в этих шести компонентах (кроме kit-исключений — их тут нет)

known_limitation: остальные admin pages вне списка — не трогать.
