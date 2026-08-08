# TZ-DICT-314 — Form profiles BE API (schema + seed + LockedRequired)

**Outcome:** DONE  
**Date:** 2026-08-08  
**Cursor Verdict:** PASS (executor self / PO continuous)

## Delivered

- Module `backend/src/modules/form-profiles/**`
  - Schema `FormProfile` unique `(organizationId, entity, size)`
  - Allowlist + LockedRequired + S/M/L defaults (audit §4)
  - API: `GET /api/form-profiles`, `GET /api/form-profiles/:entity/:size`, `PUT …`
  - Seed on first GET (idempotent; never overwrites)
  - PUT rejects strip of LockedRequired / unknown FieldKeys (400)
- Wired `FormProfilesModule` in `app.module.ts`
- Jest: 12/12 PASS

## НЕ (as scoped)

- FE settings (315), QuickCreate wire (316), material entity, EAV, desktop, deploy

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08T06:40:00Z
closed_by: cursor-composer-continuous-executor
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (backend tsc -p tsconfig.build.json --noEmit)
  - tests: PASS (jest form-profiles.service.spec.ts 12/12)
  - checklist: UPDATED
  - progress.md: UPDATED
cursor_verdict: PASS
agent_id: cursor-composer-continuous-executor
