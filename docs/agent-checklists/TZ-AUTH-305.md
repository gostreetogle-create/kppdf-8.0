# TZ-AUTH-305 checklist

> Status: **DONE — CUTOVER 2026-08-15**
> Marker: archived `tasks/_archive/2026-08/TZ-AUTH-305.done.md`
> Commit/push: docs/ops only unless PO asks

## Claim slot

- agent_id: cursor-architect (cutover)
- claimed_at: 2026-08-15T14:17:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: no

## Acceptance

- [x] Основной UI без Basic popup (`WWW-Authenticate: Basic` отсутствует).
- [x] Неизвестный браузер не видит `/login` и ERP (401 plain).
- [x] `/enroll/` открыт без Basic / без auth_request.
- [x] Device cookie → UI 200; `/api/health` 200; OPTIONS без Basic.
- [x] `/api` без Basic/auth_request (JWT/`kppd_` путь сохранён).
- [x] Rollback файл `kppdf-proxy.bak-auth-basic` на месте.
- [x] `nginx -t` PASS · evidence без invite/password/cookie secret.
- [x] Cursor cutover PASS (curl smoke). PO human browser: открыть свежую owner-ссылку один раз.

## Executor report (auto)

- outcome: DONE
- date: 2026-08-15
- Stage A: enroll/static/API exempt; UI Basic retained; internal device-check added.
- Stage B: Basic removed; `auth_request /internal/device-check` on `/`.
- Smoke: `/` anon 401 no Basic; cookie 200; `/enroll/` 200; `/api/health` 200; OPTIONS 204.
- Device: owner-device `owner-main-cutover` for smoke; PO needs own enroll once.
- Follow-up: AUTH-307 htpasswd cleanup; fix `device.enrollBaseUrl` (API returned localhost host).
- Rollback: `cp kppdf-proxy.bak-auth-basic kppdf-proxy && nginx -t && systemctl reload nginx`
- Evidence: `docs/ops/server-harden-evidence.md` § AUTH-305
- Wipe: none
