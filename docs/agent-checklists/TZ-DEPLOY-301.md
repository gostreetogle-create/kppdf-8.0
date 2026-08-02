# TZ-DEPLOY-301 checklist

**TZ:** `tasks/TZ-DEPLOY-301-prep-first-deploy.md`  
**Goal:** когда все AC ✅ и TZ в `_archive/*.done.md` — PO может деплоить.

## Before code

- [x] Прочитан TZ + `docs/SECURITY-OPERATIONS.md` (секреты)
- [x] Выбран auth вариант: ☑ A (refresh in JSON body)  ☐ B (HttpOnly cookie path fix)

## Blockers

- [x] Auth login→refresh E2E works (variant A: BE returns `refresh` in body; FE stores/refreshes; jest green)
- [x] compose.prod: no banned ADMIN_PASSWORD default; require env
- [x] CORS_ORIGIN + canonical domain documented (`kppdf-crm.ru`)
- [x] deploy script / RUNBOOK uses **pnpm** FE build; artifact path OK
- [x] healthcheck = `/api/health/ready` OR documented keep `/api/health`
- [x] DEPLOY/RUNBOOK scrubbed of live secrets
- [ ] Smoke: health 200, login, materials, orders, inventory, templates, refresh survives — **BLOCKED on LAN/VPN** (VM `192.168.1.103` unreachable from executor host; code AC closed without VM)

## Out of scope (do not block DONE)

- [x] People / КП / Gantt / ACCESS page-ACL / lifecycle chain

## Executor report (auto)

- **status:** DONE (code AC pass; live smoke blocked on LAN/VPN)
- **auth_variant:** A (refresh JWT in JSON body; cookie optional `path:/api/auth`)
- **commit:** _(filled after push)_
- **gates:**
  - backend `tsc -p tsconfig.build.json --noEmit` PASS
  - frontend `tsc -p tsconfig.app.json --noEmit` FAIL pre-existing `work-type-form-dialog.component.ts` TS2729 (out of conflict keys / not DEPLOY)
  - BE auth jest 11/11 PASS
  - FE auth jest 28/28 PASS (`auth.service` + `auth.interceptor`)
- **known:**
  - Server smoke §7 blocked: VM 192.168.1.103 TCP/SSH timed out (VPN/LAN). PO: VPN off → `.\deploy\synology\deploy.ps1`
  - HttpOnly-only refresh = successor TZ-DEPLOY-302 if desired
  - Pre-existing FE tsc error in work-types (not this TZ)
- **ask:** After VPN off, run `deploy.ps1` (no wipe) and confirm `/api/health/ready` + login + page smoke.
