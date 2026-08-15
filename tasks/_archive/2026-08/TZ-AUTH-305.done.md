# TZ-AUTH-305.done — Device access cutover (Basic removed)

```
ARCHIVE_MARKER
TZ: TZ-AUTH-305
TITLE: Переключение внешнего входа (auth_request вместо Basic)
OUTCOME: DONE
DATE: 2026-08-15
AGENT: cursor-architect (ops cutover)
WIPE: none
EVIDENCE: docs/ops/server-harden-evidence.md § AUTH-305
ROLLBACK: /etc/nginx/sites-available/kppdf-proxy.bak-auth-basic
```

## What changed

- VPS nginx: Basic Auth removed from UI.
- UI gated by `auth_request` → `/api/device/auth-check` (device cookie).
- `/enroll/`, static assets, `/api/` remain without Basic/auth_request.
- Docs: home-host-access.md, DEPLOY.md §15b, RUNBOOK.md, CREDENTIALS.md, checklist.

## Smoke (no secrets)

- `/` anon → 401, no WWW-Authenticate Basic
- `/` + device cookie → 200
- `/enroll/*` anon → 200
- `/api/health` → 200; OPTIONS → 204

## Follow-up

- TZ-AUTH-307: htpasswd cleanup, enrollBaseUrl production host
- PO: open one owner enroll link in daily browser