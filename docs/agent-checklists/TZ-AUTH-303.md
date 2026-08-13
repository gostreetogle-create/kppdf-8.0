# TZ-AUTH-303 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-AUTH-303.md` (removed at archive)
> Commit/push: **YES (green gates); NO deploy**

## Claim slot

- agent_id: agent-3e757640b7 (coding agent)
- claimed_at: 2026-08-13T21:20:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: no (room task registry stale from 2026-08-01)

## Plan

1. `user.schema.ts`: add `accountType` (`person | device`, default `person`).
2. New module `device-enrollment/`: `DeviceInvite` + `BrowserDeviceGrant` schemas, DTOs, service, controller, module, cookie+crypto helpers.
3. Service: invite issue (regular + owner-device), atomic one-time consume in Mongo transaction, grant lifecycle, cookie set, device JWT session (≤5m, no refresh), cookie-only auth_request check.
4. Controller: public consume/status/session + admin device/invite management + owner self-link (password step-up).
5. Wire module into `app.module.ts`, `auth.module.ts` (JWT sign helper), `admin.module.ts`; config TTLs; rate limit public endpoints.
6. Reject password reset for `accountType: device` (users-admin).
7. Unit + e2e security tests.

## Preflight

- [x] TZ-AUTH-306 DONE on origin/main (`32d34f7a`) — owner invariant + OwnerTargetGuard in place
- [x] `_active/` only this marker; conflict keys checked
- [x] Active marker created before code
- [x] Config TTLs + env validation added (defaults: invite 3d, owner 15m, grant 365d, device JWT 5m)

## Acceptance

- [x] regular invite only with preselected ACTIVE role; public activation cannot change role
- [x] atomic one-time consume; repeat → 409; revoked/expired/invalid → same safe 410
- [x] device cookie `__Host-kppdf-device` Secure+HttpOnly+SameSite=Lax, Path=/, no Domain, 365d default
- [x] cookie-only session issues access JWT ≤5m, NO refresh token
- [x] browser grant never accepted as Bearer/X-Access-Token; kppd_ + password login unchanged
- [x] revoke/role-change effective ≤5m; device User deactivate stops renew
- [x] owner-device invite (15m, password step-up) binds to existing single owner, no 2nd owner
- [x] reset-password for device rejected; deviceName not unique; no plaintext secrets in DB/audit/list
- [x] non-owner cannot PATCH device → `admin` role (403, no User mutation) + cannot mint admin invite
- [x] Gates: backend tsc + device-enrollment + auth.service + desktop-pairing-key tests + enrollment e2e PASS

## Gates

- [x] `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` PASS
- [x] `cd backend && pnpm test -- device-enrollment --runInBand` PASS (20/20)
- [x] `cd backend && pnpm test -- auth.service --runInBand` PASS (15/15)
- [x] `cd backend && pnpm test -- desktop-pairing-key --runInBand` PASS (7/7)
- [x] enrollment e2e PASS (8/8); auth e2e 6/6 + owner-invariant e2e 8/8 (нет регрессий)
- [x] eslint (changed/new files) PASS; git diff --check PASS

## Review handoff

- [x] READY FOR REVIEW; security self-review выполнен (diff ниже).

## Executor report (auto)

- Модуль `device-enrollment/`: 2 схемы (secret только SHA-256 hash + display prefix), 2 контроллера (public cookie-only + admin), service с Mongo-транзакцией для атомарного одноразового погашения.
- Public: `POST /device/enroll` (@Throttle), `GET /device/session|status|auth-check` — только cookie `__Host-kppdf-device`; grant secret никогда не Bearer/JWT/kppd_.
- Admin: `POST/GET /admin/devices/invites`, `POST /admin/devices/invites/:id/revoke`, `GET /admin/devices`, `PATCH /admin/devices/:id`, `POST /admin/devices/:id/revoke`; owner-only `POST /admin/devices/owner-invite` (password step-up, 15m) + `GET /admin/devices/owner`.
- Security: role берётся ТОЛЬКО из invite; admin-power (invite role=admin / PATCH в/из admin) — owner-only; owner-device → привязка к существующему owner; reset-password для device → 409; audit без plaintext.
- Scope disclosure: помимо conflict-key файлов добавлены `config/configuration.ts`, `config/env.validation.ts` (TTL config) и новые `device-crypto/cookie` helpers — Desktop/nginx не тронуты.
- Known limitation: до 304 нет UI `/enroll` и `/admin/devices`; nginx Basic остаётся до 305; `__Host-` cookie требует HTTPS (dev через proxy).
- closed_at: 2026-08-13T21:40:00Z
