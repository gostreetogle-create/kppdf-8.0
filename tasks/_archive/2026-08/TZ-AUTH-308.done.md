# TZ-AUTH-308.done — Device-only admin UX (people via Devices)

```
ARCHIVE_MARKER
TZ: TZ-AUTH-308
TITLE: Единый вход людей через Устройства (без рабочего Users CRUD UI)
OUTCOME: DONE
DATE: 2026-08-15
AGENT: agent-3e757640b7
LAYER: 2
WIPE: none
DEPLOY: none
```

## What changed

- Nav `entryPath` + menu → `/admin/devices`, label **Устройства**.
- `/admin` and `/admin/users` redirect → `admin/devices` (UsersAdminPage not routed).
- `ADMIN_TOC_CHIPS`: Устройства | Роли (users chip removed).
- `POST /api/auth/register` → HTTP 410 Gone; `POST /api/auth/login` KEEP.
- Page docs + PAGE-TZ-INDEX + `_NOW` updated.

## NOT in scope (KEEP)

- AUTH-307 Bearer / Basic wipe / nginx
- BE `/api/admin/users` CRUD API
- Owner password login, device enroll, roles matrix

## Gates

- FE `tsc -p tsconfig.app.json --noEmit` PASS
- FE Jest `admin|layout|devices|auth` 12/12 suites, 147 tests PASS
- BE `tsc -p tsconfig.build.json --noEmit` PASS
- BE Jest `auth` 3 suites / 28 tests PASS
- `git diff --check` on TZ files PASS

## known_limitation

- Owner reset-password UI via `/admin/users` unavailable (redirect). Break-glass: login API / `reset-admin-password` script.
- Device User rows not managed via Users UI — role/revoke on Devices only.

## Follow-up

- TZ-AUTH-307 (park): Bearer migration / htpasswd cleanup — only after PO
