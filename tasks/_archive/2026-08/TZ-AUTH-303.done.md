# TZ-AUTH-303 DONE — вход по приглашению (backend)

```
ARCHIVE_MARKER
task: TZ-AUTH-303
outcome: DONE
closed_at: 2026-08-13
closed_by: agent-3e757640b7 (coding agent)
workspace: D:\kppdf-8.0
verification:
  - acceptance criteria: PASS (см. checklist docs/agent-checklists/TZ-AUTH-303.md)
  - backend tsc (tsconfig.build.json --noEmit): PASS
  - device-enrollment unit tests 20/20 PASS
  - auth.service 15/15 PASS · desktop-pairing-key 7/7 PASS (нет регрессий)
  - enrollment e2e 8/8 PASS · auth e2e 6/6 · owner-invariant e2e 8/8 PASS
  - eslint (изменённые/новые файлы): PASS · git diff --check: PASS
  - checklist: docs/agent-checklists/TZ-AUTH-303.md (DONE)
  - progress.md: UPDATED · _active-map.md: UPDATED
```

## Что сделано

**Новый изолированный модуль `backend/src/modules/device-enrollment/`:**

- `device-invite.schema.ts` — `DeviceInvite` (`secretHash` SHA-256 unique,
  `secretPrefix` display-only, `kind: regular|owner-device`, `role` XOR
  `ownerUserId`, `deviceTtlDays`, `expiresAt`, `consumedAt/GrantId`,
  `revokedAt/By`).
- `browser-device-grant.schema.ts` — `BrowserDeviceGrant` (`tokenHash` SHA-256
  unique, `deviceName` 1–80 не-unique, `status`, `expiresAt`, `lastUsedAt`,
  `activatedAt`, `revokedAt/By`, `userId`, `inviteKind`).
- `device-crypto.ts` — `sha256Hex`, `randomSecret` (≥192 бит), `secretPrefix`.
- `device-cookie.ts` — parse/set `__Host-` cookie (Secure+HttpOnly+SameSite=Lax,
  Path=/, без Domain).
- `device-enrollment.service.ts` — issue regular/owner invite, атомарное
  одноразовое погашение в Mongo-транзакции, grant lifecycle, cookie-only
  session/status/auth-check, admin list/revoke/update/revoke-invite.
- `device-enrollment.controller.ts` (public) + `devices-admin.controller.ts`
  (admin `user:admin`) + `device-enrollment.module.ts`.

**User:** `accountType: person|device` (default `person`). Регистрация device —
`User(accountType=device, displayName=deviceName, username=device_<hex>,
passwordHash=random невыдаваемый, role=из invite)`.

**Инварианты:** role только из invite (публичный клиент не подменяет);
admin-power (invite role=admin / PATCH в/из admin) — owner-only; owner-device
→ привязка к существующему единственному owner; reset-password для device →
409; audit issue/consume/revoke/role-change без plaintext.

**Config:** `DEVICE_INVITE_TTL_DAYS=3`, `DEVICE_OWNER_INVITE_TTL_MINUTES=15`,
`DEVICE_GRANT_TTL_DAYS=365`, `DEVICE_JWT_TTL_SECONDS=300`,
`DEVICE_INVITE/GRANT_SECRET_BYTES=32`, `DEVICE_COOKIE_NAME=__Host-kppdf-device`,
`DEVICE_ENROLL_BASE_URL`.

## Known limitation

До TZ-AUTH-304 нет UI `/enroll` и `/admin/devices`; до 305 nginx Basic остаётся;
`__Host-` cookie требует HTTPS (dev через proxy).

## NEXT

TZ-AUTH-304 (UI `/enroll/:token` + `/admin/devices`).
