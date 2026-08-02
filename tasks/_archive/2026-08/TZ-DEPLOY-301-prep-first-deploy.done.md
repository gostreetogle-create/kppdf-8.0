# TZ-DEPLOY-301 DONE — Prep first staging/prod deploy gate

```
ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-02
closed_by: local-executor
auth_variant: A
verification:
  - acceptance criteria (code): PASS
  - live smoke §7: BLOCKED (LAN/VPN — VM 192.168.1.103 unreachable)
  - backend tsc: PASS
  - frontend tsc: FAIL pre-existing work-type-form-dialog TS2729 (out of conflict keys)
  - BE auth jest: PASS 11/11
  - FE auth jest: PASS 28/28
protects:
  - Auth refresh contract FE↔BE (refresh in JSON body)
  - Prod compose secret gate (no banned ADMIN_PASSWORD default)
  - Canon CORS domain kppdf-crm.ru + /api/health/ready
  - pnpm deploy path + scrubbed deploy docs
residual:
  - PO must VPN-off and run deploy.ps1 for live smoke
  - HttpOnly-only refresh = successor TZ-DEPLOY-302
  - Pre-existing FE tsc work-types error
```

## Summary

First-deploy gate closed for **code**. Auth **variant A**: `AuthResponse.refresh` in login/register body; optional cookie `path:/api/auth`. Compose requires env secrets; healthcheck `/api/health/ready`; domain canon `kppdf-crm.ru`; `deploy.py` uses `pnpm --dir frontend build`; DEPLOY/RUNBOOK scrubbed of live secrets; RUNBOOK has secrets + 10-line pre-deploy checklist.

Live server smoke **blocked** on LAN/VPN — PO can run `.\deploy\synology\deploy.ps1` after VPN off.

## Critical files

- `backend/src/modules/auth/auth.service.ts`
- `backend/src/modules/auth/dto/auth-response.dto.ts`
- `backend/src/modules/auth/auth.service.spec.ts`
- `frontend/src/app/core/auth.service.ts`
- `docker-compose.prod.yml`
- `deploy/synology/deploy.py`, `deploy.ps1`, `RUNBOOK.md`, `DEPLOY.md`, `config.env.example`
- `.env.example`, `backend/.env.example`
- `docs/SECURITY-OPERATIONS.md`, `docs/agent-checklists/TZ-DEPLOY-301.md`

## Executor report (auto)

- **status:** DONE
- **commit:** _(filled after push)_
- **gates:** BE tsc PASS; FE tsc pre-existing fail (work-types); auth jest PASS
- **known:** smoke blocked LAN/VPN; variant A chosen
- **ask:** VPN off → `.\deploy\synology\deploy.ps1` (no wipe) → confirm health + login
